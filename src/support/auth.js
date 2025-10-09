import { GoogleAuth } from 'google-auth-library'
import is from '@sindresorhus/is'
import { createHash } from 'node:crypto'
import { syncLog } from './workersync/synclogger.js'

const _authScopes = new Set([])

// all this stuff gets populated by the initial synced fxInit
let _auth = null
let _projectId = null
let _tokenInfo = null
let _accessToken = null;
let _tokenExpiresAt = null;
let _manifest = null
let _clasp = null

let _settings = null
const setManifest = (manifest) => _manifest = manifest
const setClasp = (clasp) => _clasp = clasp
const getManifest = () => _manifest
const getClasp = () => _clasp
const getSettings = () => _settings
const getScriptId = () => getSettings().scriptId
const getDocumentId = () => getSettings().documentId
const setProjectId = (projectId) => _projectId = projectId
const setAccessToken = (accessToken) => _accessToken = accessToken
const setSettings = (settings) => _settings = settings
const getCachePath = () => getSettings().cache
const getPropertiesPath = () => getSettings().properties
const setTokenExpiresAt = (expiresAt) => _tokenExpiresAt = expiresAt;
const setTokenInfo = (tokenInfo) => {
  _tokenInfo = tokenInfo;
  // set expiry time with a 60 second buffer
  if (tokenInfo && tokenInfo.expires_in) {
    setTokenExpiresAt(Date.now() + ((tokenInfo.expires_in - 60) * 1000));
  } else {
    // no expiry info, so we'll have to fetch a new one next time
    setTokenExpiresAt(0);
  }
}
const getTokenInfo = () => {
  if (!_tokenInfo) throw `token info isnt set yet`
  return _tokenInfo
}

const getTimeZone = () => getManifest().timeZone
const getUserId = () => getTokenInfo().sub
const getTokenScopes = () => getTokenInfo().scope
const getHashedUserId = () => createHash('md5').update(getUserId() + 'hud').digest().toString('hex')


const getAccessToken = () => _accessToken;

const isTokenExpired = () => !_accessToken || !_tokenExpiresAt || Date.now() >= _tokenExpiresAt;
/**
 * we'll be using adc credentials so no need for any special auth here
 * the idea here is to keep addign scopes to any auth so we have them all
 * @param {string[]} [scopes=[]] the required scopes will be added to existing scopes already asked for
 * @returns {GoogleAuth.auth}
 */
let _authClient = null
const getAuthClient = () => _authClient
const setAuth = async (scopes = [], keyFile = null) => {
  const hasCurrentAuth = hasAuth() && scopes.every(s => _authScopes.has(s));
  
  
  if (!hasCurrentAuth) {
    syncLog(`...initializing auth and discovering project ID`); 
    
    // 1. Create the GoogleAuth manager instance (this instance has getProjectId)
    _auth = new GoogleAuth({ scopes });
    
    // 2. Use the manager to get the authenticated client (this is passed to API methods)
    _authClient = await _auth.getClient();
    
    // 3. Use the manager to reliably get the project ID
    _projectId = await _auth.getProjectId();
    
    if (!_projectId) {
      throw new Error('Failed to get project ID from Application Default Credentials.');
    }
    
    syncLog(`...discovered and set projectId to ${_projectId}`);
    scopes.forEach(s => _authScopes.add(s));
  }
  return getAuth();
};


/**
 * if we're doing a fetch on drive API we need a special header
 */
const googify = (options = {}) => {
  const { headers } = options

  // no auth, therefore no need
  if (!headers || !hasAuth()) return options

  // if no authorization, we dont need this either
  if (!Reflect.has(headers, "Authorization")) return options

  // we'll need the projectID for this
  // note - you must add the x-goog-user-project header, otherwise it'll use some nonexistent project
  // see https://cloud.google.com/docs/authentication/rest#set-billing-project
  // this has been syncified
  const projectId = getProjectId()
  return {
    ...options,
    headers: {
      "x-goog-user-project": projectId,
      ...headers
    }
  }

}


/**
 * this would have been set up when manifest was imported
 * @returns {string} the project id
 */
const getProjectId = () => {
  if (is.null(_projectId) || is.undefined(_projectId)) {
    throw new Error('Project id not set - this means that the fxInit wasnt run')
  }
  return _projectId
}

/** 
 * @returns {Boolean} checks to see if auth has bee initialized yet
 */
const hasAuth = () => Boolean(_auth)

/**
 * @returns {GoogleAuth.auth}
 */
const getAuth = () => {
  if (!hasAuth()) throw new Error(`auth hasnt been intialized with setAuth yet`)
  return _auth
}


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
      statusText: 'Worker Error: No response object received from API call',
      error: { message: 'Worker Error: No response object received from API call' }
    };
  }
  return {
    status: result.status,
    statusText: result.statusText,
    responseUrl: result.request?.responseURL,
    error: result.data?.error
  };
}


/**
 * these are the ones that have been so far requested
 * @returns {Set}
 */
const getAuthedScopes = () => _authScopes

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
}