import { GoogleAuth, JWT } from "google-auth-library";
import is from "@sindresorhus/is";
import { createHash } from "node:crypto";
import { syncLog, syncError } from "./workersync/synclogger.js";
import fs from "node:fs";

const _authScopes = new Set([]);

// all this stuff gets populated by the initial synced fxInit
let _auth = null;
let _projectId = null;
let _tokenInfo = null;
let _accessToken = null;
let _tokenExpiresAt = null;
let _manifest = null;
let _clasp = null;

let _settings = null;
const setManifest = (manifest) => (_manifest = manifest);
const setClasp = (clasp) => (_clasp = clasp);
const getManifest = () => _manifest;
const getClasp = () => _clasp;
const getSettings = () => _settings;
const getScriptId = () => getSettings().scriptId;
const getDocumentId = () => getSettings().documentId;
const setProjectId = (projectId) => (_projectId = projectId);
const setAccessToken = (accessToken) => (_accessToken = accessToken);
const setSettings = (settings) => (_settings = settings);
const getCachePath = () => getSettings().cache;
const getPropertiesPath = () => getSettings().properties;
const setTokenExpiresAt = (expiresAt) => (_tokenExpiresAt = expiresAt);
const getTokenInfo = () => {
  if (!_tokenInfo) throw `token info isnt set yet`;
  return _tokenInfo;
};

const getTimeZone = () => getManifest().timeZone;
const getUserId = () => getTokenInfo().sub;
const getTokenScopes = () => getTokenInfo().scope;
const getHashedUserId = () =>
  createHash("md5")
    .update(getUserId() + "hud")
    .digest()
    .toString("hex");

const getAccessToken = () => _accessToken;

const isTokenExpired = () =>
  !_accessToken || !_tokenExpiresAt || Date.now() >= _tokenExpiresAt;
/**
 * we'll be using adc credentials so no need for any special auth here
 * the idea here is to keep addign scopes to any auth so we have them all
 * @param {string[]} [scopes=[]] the required scopes will be added to existing scopes already asked for
 * @param {string} [keyFile=null]
 * @param {boolean} [mcpLoading=false] When the MCP server is loading, this value is true. By this, the invalid values can be hidden while the MCP server is loading. This is important for using Google Antigravity.
 * @returns {GoogleAuth.auth}
 */
let _authClient = null;
const getAuthClient = () => _authClient;

let _cachedDwdToken = null;
let _dwdTokenExpiresAt = 0;

/**
 * Handles keyless DWD by signing a JWT with IAM and exchanging it for a token
 * @param {import("google-auth-library").AuthClient} client 
 * @param {string} saEmail 
 * @param {string} subject 
 * @param {string[]} scopes 
 */
async function getKeylessDwdToken(client, saEmail, subject, scopes) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const payload = {
    iss: saEmail,
    sub: subject,
    aud: "https://oauth2.googleapis.com/token",
    iat,
    exp,
    scope: scopes.join(" "),
  };

  const name = `projects/-/serviceAccounts/${saEmail}`;
  const url = `https://iamcredentials.googleapis.com/v1/${name}:signJwt`;

  // 1. Sign the JWT using the IAM Credentials API
  const signRes = await client.request({
    url,
    method: 'POST',
    data: {
      payload: JSON.stringify(payload)
    }
  });

  const signedJwt = signRes.data.signedJwt;

  // 2. Exchange the signed JWT for an access token
  const tokenRes = await client.request({
    url: "https://oauth2.googleapis.com/token",
    method: 'POST',
    data: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt
    }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  return {
    token: tokenRes.data.access_token,
    res: tokenRes
  };
}

const setAuth = async (scopes = [], keyFile = null, mcpLoading = false) => {

  // suppress synclog if mcpLoading
  const mayLog = mcpLoading ? ()=>null : syncLog;

  // if scopes are the same as current auth, we dont need to do anything
  const hasCurrentAuth = hasAuth() && scopes.every((s) => _authScopes.has(s));

  if (!hasCurrentAuth) {
    mayLog(`...initializing auth and discovering project ID`);

    // this would be the user being impersonated if it was a service account or a workload identity
    const subject = process.env.GOOGLE_WORKSPACE_SUBJECT;

    // this would be the service account file if it was a service account
    const effectiveKeyFile = (keyFile || process.env.SERVICE_ACCOUNT_FILE);
    // mayLog(`...asking for scopes ${scopes.join(",")}`);

    // 3. Handle Service Account + DWD explicitly
    if (effectiveKeyFile && fs.existsSync(effectiveKeyFile)) {
      mayLog(`...loading Service Account from ${effectiveKeyFile}`);

      const keys = JSON.parse(fs.readFileSync(effectiveKeyFile, 'utf8'));

      // We create a JWT client directly for DWD impersonation.
      _authClient = new JWT({
        email: keys.client_email,
        key: keys.private_key,
        scopes: scopes,
        subject: subject,
      });

      // Still initialize GoogleAuth for helper methods like getProjectId
      _auth = new GoogleAuth({ scopes, keyFilename: effectiveKeyFile });

      if (subject) {
        mayLog(`...Impersonating Workspace user: ${subject}`);
      }

    } else {
      // Fallback for local ADC (works for your local user account) or workload identity

      _auth = new GoogleAuth({ scopes });
      _authClient = await _auth.getClient();



      if (subject) {

        if (typeof _authClient.setSubject === 'function') {
          mayLog('...using legacy method to set subject')
          _authClient.setSubject(subject);

        } else if (typeof _authClient.getServiceAccountEmail === 'function' || _authClient.constructor.name === 'Compute') {
          // Keyless DWD (Workload Identity)
          try {
            const saEmail = await _authClient.getServiceAccountEmail();
            mayLog(`...ADC metadata detected. Email: ${saEmail}`);

            // this would be the service account email 
            if (saEmail && saEmail.includes('@')) {

              mayLog(`...detected Service Account ${saEmail}, enabling keyless DWD for ${subject}`);
              
              // we need to change the way we.get the access token
              _authClient.getAccessToken = async () => {
                // avoid if we have a cached token
                if (_cachedDwdToken && Date.now() < _dwdTokenExpiresAt) {
                  const token = _cachedDwdToken;
                  mayLog ('...got token from cache')
                  return { token };
                }
                // need to refresh the token
                mayLog ('...refreshing token')
                const { token, res } = await getKeylessDwdToken(_authClient, saEmail, subject, scopes);
                _cachedDwdToken = token;
                // Use a 5-minute buffer
                const expiresIn = res.data.expires_in || 3600;
                _dwdTokenExpiresAt = Date.now() + (expiresIn - 300) * 1000;
                mayLog ('...got token from refresh')
                return { token, res };
              };
            } else {
              mayLog(`...ADC is active but email '${saEmail}' is not a valid service account. Check Cloud Run identity.`);
            }
          } catch (e) {
            mayLog(`...Error fetching Metadata Email: ${e.message}`);
          }
        }
      } else {
        mayLog(`...using ADC`)
      }
    }

    _projectId = await _auth.getProjectId();
    if (!_projectId) throw new Error("Failed to get project ID.");

    mayLog(`...discovered and set projectId to ${_projectId}`);
    scopes.forEach((s) => _authScopes.add(s));

    mayLog(`Is it keyless? ${typeof _authClient.getServiceAccountEmail === 'function'}`);
  }

  return getAuth();
};

/**
 * if we're doing a fetch on drive API we need a special header
 */
const googify = (options = {}) => {
  const { headers } = options;

  // no auth, therefore no need
  if (!headers || !hasAuth()) return options;

  // if no authorization, we dont need this either
  if (!Reflect.has(headers, "Authorization")) return options;

  // we'll need the projectID for this
  // note - you must add the x-goog-user-project header, otherwise it'll use some nonexistent project
  // see https://cloud.google.com/docs/authentication/rest#set-billing-project
  // this has been syncified
  const projectId = getProjectId();
  return {
    ...options,
    headers: {
      "x-goog-user-project": projectId,
      ...headers,
    },
  };
};

/**
 * this would have been set up when manifest was imported
 * @returns {string} the project id
 */
const getProjectId = () => {
  if (is.null(_projectId) || is.undefined(_projectId)) {
    throw new Error(
      "Project id not set - this means that the fxInit wasnt run"
    );
  }
  return _projectId;
};

/**
 * @returns {Boolean} checks to see if auth has bee initialized yet
 */
const hasAuth = () => Boolean(_auth);

/**
 * @returns {GoogleAuth.auth}
 */
const getAuth = () => {
  if (!hasAuth())
    throw new Error(`auth hasnt been intialized with setAuth yet`);

  // Return a wrapper that ensures getAccessToken returns a string, 
  // and uses the impersonated client if available.
  return {
    getAccessToken: async () => {
      const client = getAuthClient();
      const res = await client.getAccessToken();
      return typeof res === 'string' ? res : res.token;
    },
    getClient: async () => getAuthClient(),
    getProjectId: () => getProjectId()
  };
};

const setTokenInfo = (tokenInfo) => {
  _tokenInfo = tokenInfo;

  // FIX: Ensure 'sub' exists for the cache library to use as a User ID
  const subject = process.env.GOOGLE_WORKSPACE_SUBJECT;
  syncLog ('...subject from env is '+ subject)
  if (_tokenInfo) {
    // If we are doing DWD, the 'sub' is the person we are impersonating
    if (subject) {
      _tokenInfo.sub = _tokenInfo.sub || subject;
      _tokenInfo.email = _tokenInfo.email || subject;
      syncLog ('...tokenInfo is subject found'+ JSON.stringify(_tokenInfo))
    } else {
      syncLog ('...tokenInfo is subject not found'+ JSON.stringify(_tokenInfo))
    }

  }

  // Set expiry...
  if (tokenInfo && tokenInfo.expires_in) {
    setTokenExpiresAt(Date.now() + (tokenInfo.expires_in - 60) * 1000);
  } else {
    setTokenExpiresAt(0);
  }
};

/**
 * why is this here ?
 * because when we syncit, we import auth for each method and it needs this
 * if it was somewhere else we'd need to import that too.
 * we can't serialize a return object
 * so we just select a few props from it
 * @param {SyncApiResponse} result
 * @returns
 */
export const responseSyncify = (result) => {
  if (!result) {
    return {
      status: 503, // Service Unavailable, a good representation for a worker-level failure
      statusText: "Worker Error: No response object received from API call",
      error: {
        message: "Worker Error: No response object received from API call",
      },
    };
  }
  return {
    status: result.status,
    statusText: result.statusText,
    responseUrl: result.request?.responseURL,
    error: result.data?.error,
  };
};

/**
 * these are the ones that have been so far requested
 * @returns {Set}
 */
const getAuthedScopes = () => _authScopes;

export const Auth = {
  getAuth,
  hasAuth,
  getProjectId,
  setAuth,
  getAuthedScopes,
  googify,
  setProjectId,
  getUserId,
  setTokenInfo,
  getAccessToken,
  getTokenScopes,
  getScriptId,
  getDocumentId,
  setSettings,
  getCachePath,
  getPropertiesPath,
  getTokenInfo,
  getHashedUserId,
  setManifest,
  setClasp,
  getManifest,
  getClasp,
  getTimeZone,
  setAccessToken,
  isTokenExpired,
  getAuthClient
};
