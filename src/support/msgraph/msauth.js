import {
  InteractiveBrowserCredential,
  ClientSecretCredential,
  useIdentityPlugin
} from "@azure/identity";

import { execSync } from 'node:child_process';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { chmodSync } from 'fs';
import got from 'got';
import crypto from 'node:crypto';

const TOKEN_CACHE_FILE = path.join(process.cwd(), '.msgraph-token.jwt');
const JWT_SECRET = 'gas-fakes-local-cache-secret';

function encodeJWT(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const toBase64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const encodedHeader = toBase64Url(header);
  const encodedPayload = toBase64Url(payload);
  
  const hmac = crypto.createHmac('sha256', JWT_SECRET);
  hmac.update(`${encodedHeader}.${encodedPayload}`);
  const signature = hmac.digest('base64url');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function decodeJWT(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');
  const [encodedHeader, encodedPayload, signature] = parts;
  
  const hmac = crypto.createHmac('sha256', JWT_SECRET);
  hmac.update(`${encodedHeader}.${encodedPayload}`);
  if (signature !== hmac.digest('base64url')) {
    throw new Error('JWT signature mismatch');
  }
  
  return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
}

const customCachePlugin = (options) => {
  return {
    beforeCacheAccess: async (cacheContext) => {
      if (existsSync(TOKEN_CACHE_FILE)) {
        try {
          const data = await readFile(TOKEN_CACHE_FILE, 'utf-8');
          let cache;
          if (data.trim().startsWith('{')) {
             cache = JSON.parse(data);
          } else {
             cache = decodeJWT(data.trim());
          }
          if (cache && cache.msalCache) {
             cacheContext.tokenCache.deserialize(cache.msalCache);
          }
        } catch (e) {
          console.warn(`...failed to load MS Graph token cache: ${e.message}`);
        }
      }
    },
    afterCacheAccess: async (cacheContext) => {
      if (cacheContext.cacheHasChanged) {
        try {
          const msalCache = cacheContext.tokenCache.serialize();
          const cacheData = { 
            msalCache, 
            token: 'managed-by-msal', 
            expiresOn: new Date(Date.now() + 86400000 * 30).getTime() // Keep valid for 30 days
          };
          const jwtString = encodeJWT(cacheData);
          await writeFile(TOKEN_CACHE_FILE, jwtString);
          try {
            chmodSync(TOKEN_CACHE_FILE, 0o600);
          } catch (e) {}
        } catch (e) {
          console.warn(`...failed to save MS Graph token cache: ${e.message}`);
        }
      }
    }
  };
};

useIdentityPlugin((context) => {
  if (context.cachePluginControl) {
    context.cachePluginControl.setPersistence(customCachePlugin);
  }
});

async function loadTokenCache() {
  if (existsSync(TOKEN_CACHE_FILE)) {
    try {
      const data = await readFile(TOKEN_CACHE_FILE, 'utf-8');
      
      let cache;
      if (data.trim().startsWith('{')) {
         cache = JSON.parse(data);
      } else {
         cache = decodeJWT(data.trim());
      }

      if (cache && cache.expiresOn && new Date(cache.expiresOn).getTime() > Date.now() + 300000) {
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
    const cacheData = { token, expiresOn };
    const jwtString = encodeJWT(cacheData);
    await writeFile(TOKEN_CACHE_FILE, jwtString);
    try {
      chmodSync(TOKEN_CACHE_FILE, 0o600);
    } catch (e) {}
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

async function isGcpEnv() {
  if (process.env.K_SERVICE || process.env.FUNCTION_NAME) return true;
  return false;
}

/**
 * Gets a Microsoft Graph token.
 */
export async function getMsGraphToken(scopes = ['User.Read']) {
  const envTenant = process.env.MS_GRAPH_TENANT_ID || 'consumers';
  const clientId = process.env.MS_GRAPH_CLIENT_ID;
  const clientSecret = process.env.MS_GRAPH_CLIENT_SECRET;
  const msAuthType = process.env.MS_AUTH_TYPE;

  const uniqueScopes = Array.from(new Set(scopes)).filter(s => s);
  const msScopes = uniqueScopes.map(s => {
    const core = ['openid', 'profile', 'email', 'offline_access'];
    if (core.some(c => s.startsWith(c))) return s;
    if (s.startsWith('https://graph.microsoft.com/')) return s;
    return `https://graph.microsoft.com/${s.startsWith('/') ? s.slice(1) : s}`;
  });

  // Federated/WIF bypasses cache to ensure fresh identity exchange
  if (msAuthType !== 'federated') {
    const cachedToken = await loadTokenCache();
    if (cachedToken) {
      syncLog('...retrieved MS Graph token via local file cache');
      return cachedToken;
    }
  }

  try {
    // 1. Federated Flow (WIF) - For Cloud Run/GKE only
    if (msAuthType === 'federated') {
      const isGcp = await isGcpEnv();
      if (isGcp) {
        try {
          syncLog('...initiating MS Graph Federated Identity (WIF) exchange (GCP)');
          const audience = clientId || 'api://AzureADTokenExchange';
          const metadataUrl = `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${audience}`;
          
          const googleTokenResponse = await got(metadataUrl, {
            headers: { 'Metadata-Flavor': 'Google' },
            timeout: { request: 2000 },
            retry: { limit: 0 }
          });
          const googleIdToken = googleTokenResponse.body;

          // Note: Personal apps registered in 'consumers' typically do not support WIF.
          // This flow expects an App Registration in a Work/School tenant.
          const tenant = (envTenant && envTenant !== 'common' && envTenant !== 'consumers') ? envTenant : 'organizations';
          const msTokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;

          const form = {
            client_id: clientId,
            grant_type: 'client_credentials',
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            client_assertion: googleIdToken,
            scope: 'https://graph.microsoft.com/.default'
          };

          const msTokenResponse = await got.post(msTokenUrl, { form, timeout: { request: 5000 } }).json();
          const token = msTokenResponse.access_token;
          const expiresOn = new Date(Date.now() + (msTokenResponse.expires_in * 1000)).toISOString();

          syncLog('...retrieved MS Graph token via Federated Identity (WIF)');
          await saveTokenCache(token, expiresOn);
          return token;
        } catch (wifErr) {
          syncLog(`...MS WIF exchange failed: ${wifErr.message}`);
        }
      } else {
        syncLog('...skipping Federated Identity (Local environment)');
      }
    }

    // 2. Service Principal
    if (clientId && clientSecret) {
      const tenantId = (envTenant === 'common' || envTenant === 'consumers') ? 'organizations' : envTenant;
      const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
      const tokenResponse = await credential.getToken(msScopes);
      syncLog('...retrieved MS Graph token via Client Secret (Service Principal)');
      await saveTokenCache(tokenResponse.token, tokenResponse.expiresOnTimestamp);
      return tokenResponse.token;
    }

    // 3. Azure CLI Direct Exec (Silent) - Primary Local "Keyless" Path
    const isAuthFlow = process.env.GF_AUTH_FLOW === 'true';
    if (!isAuthFlow && !clientId) {
      const tenant = (envTenant && envTenant !== 'common') ? envTenant : 'consumers';
      const tenantArg = `--tenant "${tenant}" `;

      try {
        const cmd = `az account get-access-token --resource-type ms-graph ${tenantArg}--output json`;
        const stdout = execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'], shell: true });
        const res = JSON.parse(stdout);
        const token = res.accessToken;
        if (token && (token.match(/\./g) || []).length >= 2) {
          syncLog('...retrieved valid MS Graph token via Azure CLI (silent)');
          await saveTokenCache(token, res.expiresOn);
          return token;
        }
      } catch (e) {
        syncLog(`...silent CLI fallback failed: ${e.message}`);
      }
    }

    // 4. Interactive Fallback
    if (!isAuthFlow && !clientId) {
      console.log(`...silent CLI login failed. Falling back to interactive SDK login in the worker...`);
    } else if (!isAuthFlow && clientId) {
      console.log(`...using custom MS_GRAPH_CLIENT_ID. Bypassing Azure CLI for Interactive SDK login...`);
    }

    // Try silent refresh first, then interactive if required
    let promptBehavior = isAuthFlow ? 'select_account' : 'none';
    const credentialSilent = new InteractiveBrowserCredential({
      tenantId: (envTenant && envTenant !== 'common') ? envTenant : 'consumers',
      clientId,
      prompt: promptBehavior,
      tokenCachePersistenceOptions: {
        enabled: true,
        name: 'gas-fakes-msgraph-cache'
      }
    });

    try {
      const tokenResponse = await credentialSilent.getToken(msScopes);
      syncLog(`...retrieved MS Graph token via interactive login (prompt: ${promptBehavior})`);
      await saveTokenCache(tokenResponse.token, tokenResponse.expiresOnTimestamp);
      return tokenResponse.token;
    } catch (silentErr) {
       if (promptBehavior === 'none') {
         console.log(`...silent refresh failed, prompting user...`);
         const credentialInteractive = new InteractiveBrowserCredential({
           tenantId: (envTenant && envTenant !== 'common') ? envTenant : 'consumers',
           clientId,
           prompt: 'select_account consent',
           tokenCachePersistenceOptions: {
             enabled: true,
             name: 'gas-fakes-msgraph-cache'
           }
         });
         const tokenResponse = await credentialInteractive.getToken(msScopes);
         syncLog('...retrieved MS Graph token via interactive login');
         await saveTokenCache(tokenResponse.token, tokenResponse.expiresOnTimestamp);
         return tokenResponse.token;
       } else {
         throw silentErr;
       }
    }

  } catch (err) {
    throw new Error(`MS Graph Auth failed. Error: ${err.message}`);
  }
}

function syncLog(msg) {
  console.log(msg);
}
