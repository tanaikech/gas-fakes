import { GoogleAuth } from 'google-auth-library'
import is from '@sindresorhus/is'

const _authScopes = new Set([])

// all this stuff gets populated by the initial synced fxInit
let _auth = null
let _projectId = null
let _tokenInfo = null
let _accessToken = null

// TODO figure out how to make a scriptId/documentId locally
let _scriptId = 'todo:script'
let _documentId = 'todo:doc'

const getScriptId = () => _scriptId
const getDocumentId = () => _documentId

const setProjectId = (projectId) => _projectId = projectId
const setTokenInfo = (tokenInfo) => _tokenInfo = tokenInfo
const setAccessToken = (accessToken) => _accessToken = accessToken

const getTokenInfo = () => {
  if (!_tokenInfo) throw `token info isnt set yet`
  return _tokenInfo
}

const getAccessToken= () => {
  if (!_accessToken) throw `access token isnt set yet`
  return _accessToken
}


const getUserId = () => getTokenInfo().sub
const getTokenScopes = () => getTokenInfo().scope



/**
 * we'll be using adc credentials so no need for any special auth here
 * the idea here is to keep addign scopes to any auth so we have them all
 * @param {string[]} [scopes=[]] the required scopes will be added to existing scopes already asked for
 * @returns {GoogleAuth.auth}
 */
const setAuth = (scopes = []) => {

  if (!hasAuth() || !scopes.every(s => _authScopes.has(s))) {
    _auth = new GoogleAuth({
      scopes
    })
    scopes.forEach(s => _authScopes.add(s))
  }
  return getAuth()
}


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
    throw new Error ('Project id not set - this means that the fxInit wasnt run')
  }
  return _projectId
}

/** 
 * @returns {Boolean} checks to see if auth has bee initialized yet
 */
const hasAuth = () => Boolean (_auth)

/**
 * @returns {GoogleAuth.auth}
 */
const getAuth = () => {
  if (!hasAuth()) throw new Error(`auth hasnt been intialized with setAuth yet`)
  return _auth
}


/**
 * we can't serialize a return object from sheets api
 * so we just select a few props from it
 * @param {SyncApiResponse} result 
 * @returns 
 */
export const responseSyncify = (result) => ({
  status: result.status,
  statusText: result.statusText,
  responseUrl: result.request?.responseURL
})


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
  setAccessToken,
  getAccessToken,
  getTokenScopes,
  getScriptId,
  getDocumentId
}