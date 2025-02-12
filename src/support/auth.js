import { GoogleAuth } from 'google-auth-library'
import {readFile} from 'node:fs/promises'
import got from 'got'
import path from 'path'
import {Utils} from './utils.js'

const _authScopes = new Set([])
let _auth = null
let _projectId = null

const setProjectId = (projectId) => _projectId = projectId
const setManifestScopes = (manifest) => setAuth(Utils.arrify(manifest.oauthScopes))

/**
 * get the manifest scopes and set them
 * @param {string} [manifestParh] the manifest file path
 * @returns {Promise <string[]>} the scopes
 */
const initManifestScopes = async (manifestParh) => {
  const scopes = await getManifestScopes(manifestParh)
  setAuth (scopes)
  // we also set the project id to avoid catching that every time
  // the project id is required for fetches to workspace apis using application default credentials
  _projectId = await authProjectId()
  return scopes
}
/**
 * get the manifest content and parse
 * @param {string} [manifestPath] the manifest file path
 * @returns {Promise <object>} the manifest
 */
const getManifest = async (manifestPath='./appsscript.json') => {
  const mainDir = path.dirname(process.argv[1])
  const manifestFile = path.resolve ( mainDir, manifestPath) 
  console.log (`using manifest file:${manifestFile}`) 
  const contents = await readFile(manifestFile, { encoding: 'utf8' })
  return JSON.parse (contents)
}

/**
 * get the scopes from the manifest
 * @param {string} [path] the manifest file path
 * @returns {Promise <string[]>} the scopes required by the manifest 
 */
const getManifestScopes = async (path) => {
  const manifest = await getManifest(path)
  return Utils.arrify(manifest.oauthScopes)
}
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
 * @returns {Promise <string>} the projectId
 */
const authProjectId = async () => {
  return getAuth().getProjectId()
}

/**
 * this would have been set up when manifest was imported
 * @returns {string} the project id
 */
const getProjectId = () => {
  if (Utils.isNU(_projectId)) {
    throw new Error ('Project id not set - did you forget to run initManifestScopes?')
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
 * gets the info about an access token
 * @param {string} accessToken the accessToken to check
 * @returns {Promise <object>} access toekn info
 */

const checkToken = async (accessToken) => {
  const pack = await got(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`).json()
  return pack
}

/**
 * these are the ones that have been so far requested
 * @returns {Set}
 */
const getAuthedScopes = () => _authScopes

export const Auth = {
  checkToken,
  getAuth,
  hasAuth,
  getProjectId,
  setAuth,
  getManifestScopes,
  getManifest,
  initManifestScopes,
  getAuthedScopes,
  googify,
  setProjectId,
  setManifestScopes
}