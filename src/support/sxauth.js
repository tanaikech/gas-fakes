/**
 * Auth and Init
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */
import got from 'got';
import { Auth } from './auth.js';
import { syncError, syncLog, syncWarn } from './workersync/synclogger.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { KSuiteDrive } from './ksuite/kdrive.js';
import { getMsGraphToken, mapGasScopesToMsGraph } from './msgraph/msauth.js';
import { MsGraph } from './msgraph/msclient.js';

let _loggedSummary = false;

/**
 * initialize key stuff at the beginning such as manifest content and settings
 * @param {object} p pargs
 * @param {string} p.manifestPath where to find the manifest by default
 * @param {string} p.claspPath where to find the clasp file by default
 * @param {string} p.settingsPath where to find the settings file
 * @param {string} p.cachePath the cache files
 * @param {string} p.propertiesPath the properties file location
 * @param {string} p.fakeId a fake script id to use if one isnt in the settings
 * @param {string[]} [p.platformAuth] list of platforms to authenticate
 * @return {object} the finalized versions of all the above 
 */
export const sxInit = async ({ manifestPath, claspPath, settingsPath, cachePath, propertiesPath, fakeId, platformAuth }) => {

  // Default to google if nothing specified
  const platforms = platformAuth || (process.env.GF_PLATFORM_AUTH ? process.env.GF_PLATFORM_AUTH.split(',') : ['google']);

  // get a file and parse if it exists
  const getIfExists = async (file) => {
    if (!file) return {};
    try {
      const content = await readFile(file, { encoding: 'utf8' })
      return JSON.parse(content)
    } catch (err) {
      return {}
    }
  }

  const manifestFile = process.env.GF_MANIFEST_PATH || manifestPath;
  const claspFile = process.env.GF_CLASP_PATH || claspPath;

  const [manifest, clasp] = await Promise.all([
    getIfExists(manifestFile),
    getIfExists(claspFile)
  ])

  // Emulate manifest scopes from .env if missing or empty
  if (!manifest.oauthScopes || manifest.oauthScopes.length === 0) {
    const envScopes = Array.from(new Set([
      ...(process.env.DEFAULT_SCOPES || "").split(","),
      ...(process.env.EXTRA_SCOPES || "").split(",")
    ])).map(s => s.trim()).filter(s => s);

    if (envScopes.length > 0) {
      manifest.oauthScopes = envScopes;
      if (!manifest.timeZone) {
        manifest.timeZone = process.env.GF_TIMEZONE || "America/New_York";
      }
      if (!_loggedSummary) {
        syncLog(`...appsscript.json missing or missing scopes. Emulating manifest using scopes from .env file`);
      }
    }
  }

  const settings = {
    manifest: manifestFile,
    clasp: claspFile,
    scriptId: process.env.GF_SCRIPT_ID || clasp.scriptId || fakeId,
    documentId: process.env.GF_DOCUMENT_ID || null,
    cache: process.env.GF_CACHE_PATH || cachePath,
    properties: process.env.GF_PROPERTIES_PATH || propertiesPath
  }

  const identities = {};

  // --- Google Auth Block ---
  if (platforms.includes('google')) {
    try {
      // Ensure platform is set for info discovery
      Auth.setPlatform('google');

      const scopes = manifest.oauthScopes || []
      const mandatoryScopes = [
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/cloud-platform"
      ]
      const scopeSet = new Set(scopes)
      mandatoryScopes.forEach(scope => scopeSet.add(scope))
      const finalScopes = Array.from(scopeSet)

      await Auth.setAuth(finalScopes);

      const [activeInfo, effectiveInfo] = await Promise.all([
        Auth.getSourceAccessTokenInfo(),
        Auth.getAccessTokenInfo()
      ]);

      const activeUser = {
        id: activeInfo.tokenInfo.sub || activeInfo.tokenInfo.email || activeInfo.tokenInfo.user_id || 'unknown-active-user',
        email: activeInfo.tokenInfo.email,
        token: activeInfo.token
      }
      const effectiveUser = {
        id: effectiveInfo.tokenInfo.sub || effectiveInfo.tokenInfo.email || effectiveInfo.tokenInfo.user_id || 'unknown-effective-user',
        email: effectiveInfo.tokenInfo.email,
        token: effectiveInfo.token
      }

      identities.google = {
        activeUser,
        effectiveUser,
        projectId: Auth.getProjectId(),
        tokenScopes: effectiveInfo.tokenInfo.scopes || effectiveInfo.tokenInfo.scope,
        authMethod: Auth.getAuthMethod('google')
      };

      // Set current worker identity to google for remainder of init if needed
      Auth.setIdentity('google', identities.google);

    } catch (err) {
      syncWarn(`Google authentication failed: ${err.message}`);

      // Provide guidance for Domain Wide Delegation issues
      if (err.message.includes('unauthorized_client')) {
        const clientId = Auth.getClientId();
        const msg = [
          "",
          "=".repeat(80),
          "GOOGLE AUTHENTICATION ERROR: unauthorized_client",
          "This usually means Domain-Wide Delegation (DWD) is missing for one or more scopes.",
          "",
          `Your Service Account Client ID is: ${clientId || 'unknown (check your service account JSON file)'}`,
          "",
          "The following scopes should be authorized in the Google Admin Console:",
          finalScopes.join(","),
          "",
          "To fix this:",
          "1. Go to https://admin.google.com",
          "2. Security -> Access and data control -> API controls",
          "3. Manage Domain Wide Delegation",
          "4. Find/Add your Client ID and ensure the list of scopes above matches exactly.",
          "=".repeat(80),
          ""
        ].join("\n");
        console.error(msg);
      }

      if (!platforms.includes('ksuite') && !platforms.includes('msgraph')) throw err;
    }
  }

  // --- KSuite Auth Block ---
  if (platforms.includes('ksuite')) {
    const kToken = process.env.KSUITE_TOKEN;
    if (!kToken) {
      syncWarn("ksuite requested in platformAuth but KSUITE_TOKEN is missing from environment.");
    } else {
      try {
        Auth.setPlatform('ksuite');
        const kDrive = new KSuiteDrive(kToken);
        const accountId = await kDrive.getAccountId();

        if (!accountId) throw new Error("Could not retrieve Infomaniak account info.");

        const kUser = {
          id: String(accountId),
          email: process.env.KSUITE_EMAIL || 'ksuite-user@infomaniak.com',
          token: kToken
        };

        identities.ksuite = {
          activeUser: kUser,
          effectiveUser: kUser,
          accessToken: kToken,
          projectId: null,
          authMethod: 'token'
        };

        Auth.setIdentity('ksuite', identities.ksuite);
      } catch (err) {
        syncWarn(`KSuite authentication failed: ${err.message}`);
        if (!platforms.includes('google') && !platforms.includes('msgraph')) throw err;
      }
    }
  }

  // --- MS Graph Auth Block ---
  if (platforms.includes('msgraph')) {
    try {
      Auth.setPlatform('msgraph');

      // If we already have a valid identity (passed from main thread), use it
      if (Auth.hasAuth('msgraph')) {
        const id = Auth.getActiveUser(); // This will return the sync-ed user
        identities.msgraph = {
          activeUser: Auth.getActiveUser(),
          effectiveUser: Auth.getEffectiveUser(),
          accessToken: await Auth.getAccessToken(),
          projectId: null,
          authMethod: Auth.getAuthMethod('msgraph') || 'native'
        };
        syncLog('...using MS Graph identity synchronized from main process');
      } else {
        const gasScopes = manifest.oauthScopes || [];
        const msScopes = mapGasScopesToMsGraph(gasScopes);

        const token = await getMsGraphToken(msScopes);
        const msGraph = new MsGraph(token);
        const me = await msGraph.getMe();

        const msUser = {
          id: me.id,
          email: me.userPrincipalName || me.mail || 'msgraph-user@microsoft.com',
          token: token
        };

        identities.msgraph = {
          activeUser: msUser,
          effectiveUser: msUser,
          accessToken: token,
          projectId: null,
          authMethod: 'native'
        };

        Auth.setIdentity('msgraph', identities.msgraph);
      }
    } catch (err) {
      syncWarn(`Microsoft Graph authentication failed: ${err.message}`);
      if (!platforms.includes('google') && !platforms.includes('ksuite')) throw err;
    }
  }

  // Restore default platform context only if not already set or defaulted
  // Auth.setPlatform(defaultPlatform); 

  // Final Summary Report (Concise, single instance)
  if (!_loggedSummary) {
    const summary = Object.keys(identities).map(p => {
      const id = identities[p];
      const isImpersonating = id.activeUser?.email !== id.effectiveUser?.email;
      const userPart = isImpersonating
        ? `${id.activeUser?.email} impersonating ${id.effectiveUser?.email}`
        : id.effectiveUser?.email;

      const methodPart = id.authMethod ? ` via ${id.authMethod.toUpperCase()}` : '';
      return `${p}${methodPart} (${userPart})`;
    }).join(', ');

    if (summary) {
      const scriptIdSource = process.env.GF_SCRIPT_ID ? 'env' : (clasp.scriptId ? 'clasp' : 'random');
      syncLog(`...authorized backends: ${summary}`);
      syncLog(`...using scriptId: ${settings.scriptId} (source: ${scriptIdSource})`);
      _loggedSummary = true;
    }
  }

  return {
    identities,
    settings,
    manifest,
    clasp,
  }
}
