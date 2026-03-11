import {
  InteractiveBrowserCredential,
  ClientSecretCredential
} from "@azure/identity";
import { execSync } from 'node:child_process';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { chmodSync } from 'fs';

const TOKEN_CACHE_FILE = path.join(process.cwd(), '.msgraph-token.json');

async function loadTokenCache() {
  if (existsSync(TOKEN_CACHE_FILE)) {
    try {
      const data = await readFile(TOKEN_CACHE_FILE, 'utf-8');
      const cache = JSON.parse(data);
      // Check if expired (buffer of 5 mins)
      if (cache.expiresOn && new Date(cache.expiresOn).getTime() > Date.now() + 300000) {
        return cache.token;
      }
    } catch (e) {
      console.warn(`...failed to load MS Graph token cache: ${e.message}`);
    }
  }
  return null;
}

async function saveTokenCache(token, expiresOn) {
  try {
    await writeFile(TOKEN_CACHE_FILE, JSON.stringify({ token, expiresOn }, null, 2));
    try {
      chmodSync(TOKEN_CACHE_FILE, 0o600); // Read/Write only for owner
    } catch (e) {
      // Ignore if chmod fails (e.g. on non-posix)
    }
  } catch (e) {
    console.warn(`...failed to save MS Graph token cache: ${e.message}`);
  }
}

/**
 * Maps Google/GAS scopes to Microsoft Graph equivalents.
 */
const scopeMapping = {
  'https://www.googleapis.com/auth/drive': 'Files.ReadWrite.All',
  'https://www.googleapis.com/auth/drive.readonly': 'Files.Read.All',
  'https://www.googleapis.com/auth/drive.file': 'Files.ReadWrite',
  'https://www.googleapis.com/auth/spreadsheets': 'Files.ReadWrite',
  'https://www.googleapis.com/auth/documents': 'Files.ReadWrite',
  'https://www.googleapis.com/auth/presentations': 'Files.ReadWrite',
  'https://www.googleapis.com/auth/forms': 'Files.ReadWrite',
  'https://www.googleapis.com/auth/userinfo.email': 'User.Read email',
  'openid': 'openid',
  'https://mail.google.com/': 'Mail.ReadWrite',
  'https://www.googleapis.com/auth/calendar': 'Calendars.ReadWrite',
  'https://www.googleapis.com/auth/script.external_request': 'offline_access'
};

export function mapGasScopesToMsGraph(gasScopes = []) {
  const msScopes = new Set(['User.Read', 'offline_access', 'openid', 'profile', 'email']);
  gasScopes.forEach(scope => {
    const mapped = scopeMapping[scope];
    if (mapped) {
      mapped.split(' ').forEach(s => msScopes.add(s));
    } else if (scope && !scope.includes('googleapis.com')) {
      // If it's not a google scope, assume it might be a MS scope or a direct one
      msScopes.add(scope);
    }
  });
  return Array.from(msScopes);
}

/**
 * Gets a Microsoft Graph token.
 */
export async function getMsGraphToken(scopes = ['User.Read']) {
  const envTenant = process.env.MS_GRAPH_TENANT_ID || 'common';
  const clientId = process.env.MS_GRAPH_CLIENT_ID;
  const clientSecret = process.env.MS_GRAPH_CLIENT_SECRET;

  // No local token caching - strictly "Keyless"

  // Ensure no duplicate or empty scopes
  const uniqueScopes = Array.from(new Set(scopes)).filter(s => s);

  // Format for MS Graph: core scopes are as are, resource scopes with full URL prefix
  const msScopes = uniqueScopes.map(s => {
    const core = ['openid', 'profile', 'email', 'offline_access'];
    if (core.some(c => s.startsWith(c))) return s;
    if (s.startsWith('https://graph.microsoft.com/')) return s;
    return `https://graph.microsoft.com/${s.startsWith('/') ? s.slice(1) : s}`;
  });

  // Check local cache first
  const cachedToken = await loadTokenCache();
  if (cachedToken) {
    syncLog('...retrieved MS Graph token via local file cache');
    return cachedToken;
  }

  try {
    // 1. Service Principal (if configured) - "Keyless" for Business
    if (clientId && clientSecret) {
      const tenantId = envTenant === 'common' || envTenant === 'consumers' ? 'organizations' : envTenant;
      const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
      const tokenResponse = await credential.getToken(msScopes);
      syncLog('...retrieved MS Graph token via Client Secret (Service Principal)');
      await saveTokenCache(tokenResponse.token, tokenResponse.expiresOnTimestamp);
      return tokenResponse.token;
    }

    // 2. Azure CLI Direct Exec (Silent flow - OS level "Keyless")
    const isAuthFlow = process.env.GF_AUTH_FLOW === 'true';
    const targetTenant = envTenant === 'common' ? 'consumers' : envTenant;
    const scopeArg = msScopes.join(' ');

    if (!isAuthFlow) {
      // Revert to strictly tenant-aware fallback to avoid picking up business/EXT sessions.
      const tenantArg = targetTenant ? `--tenant "${targetTenant}" ` : '';
      const clientArg = clientId ? `--client-id "${clientId}" ` : '';

      try {
        // Strategy 1: Custom Client ID + Tenant
        const cmd = `az account get-access-token --resource-type ms-graph ${tenantArg}${clientArg}--scope "https://graph.microsoft.com/.default" --output json`;
        const stdout = execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'], shell: true });
        const res = JSON.parse(stdout);
        const token = res.accessToken;
        if (token && (token.match(/\./g) || []).length >= 2) {
          syncLog('...retrieved valid MS Graph token via Azure CLI (silent)');
          // az returns expiresOn in a format new Date() can parse
          await saveTokenCache(token, res.expiresOn);
          return token;
        }
      } catch (e) {
        try {
          // Strategy 2: First-party + Tenant (Magic bullet for SPO license fix)
          const fallbackCmd = `az account get-access-token --resource-type ms-graph ${tenantArg}--scope "https://graph.microsoft.com/.default" --output json`;
          const stdout = execSync(fallbackCmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'], shell: true });
          const res = JSON.parse(stdout);
          const token = res.accessToken;
          if (token && (token.match(/\./g) || []).length >= 2) {
            syncLog(`...retrieved valid MS Graph token via Azure CLI (first-party ${targetTenant} fallback)`);
            await saveTokenCache(token, res.expiresOn);
            return token;
          }
        } catch (ee) {
          syncLog(`...silent CLI fallback failed: ${ee.message}`);
        }
      }
    }

    // 3. Auth Flow - Interactive Fallback

    // If we're not in the dedicated auth flow, we still attempt interactive fallback
    // if silent login failed, as requested by the user for "asynchronous" operations in the worker.
    if (!isAuthFlow) {
      console.log(`...silent CLI login failed. Falling back to interactive SDK login in the worker...`);
    }

    // Interactive login for setup or runtime fallback
    const credential = new InteractiveBrowserCredential({
      tenantId: envTenant === 'common' ? 'consumers' : envTenant,
      clientId,
      prompt: 'select_account consent'
    });
    const tokenResponse = await credential.getToken(msScopes);
    syncLog('...retrieved MS Graph token via interactive login');
    await saveTokenCache(tokenResponse.token, tokenResponse.expiresOnTimestamp);
    return tokenResponse.token;

  } catch (err) {
    throw new Error(`MS Graph Auth failed. Error: ${err.message}`);
  }
}

function syncLog(msg) {
  // Use worker sync log if available, otherwise console
  console.log(msg);
}
