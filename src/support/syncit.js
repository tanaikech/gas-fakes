/**
 * these are utilities to return sync versions of functions
 */
import makeSynchronous from 'make-synchronous';
import path from 'path'
import { Auth } from "./auth.js"

const authPath = "../support/auth.js"
const drapisPath = "../services/drive/drapis.js"

/**
 * note that the relpath of exports file 
 * is relative from the entrypoint, since all this sync stuff runs in a subprocess
 * @constant
 * @type {string}
 * @default
 */

/**
 * @param {string} [relTarget=relExports] the target module relative to this script 
 * @returns {string} the full path
 */
const getModulePath = (relTarget) => path.resolve(import.meta.dirname, relTarget)



/**
 * sync a call to Drive api
 * @param {object} p pargs
 * @param {string} p.prop the prop of drive eg 'files' for drive.files
 * @param {string} p.method the method of drive eg 'list' for drive.files.list
 * @param {object} p.params the params to add to the request
 * @return {DriveResponse} from the drive api
 */
const fxDrive = ({ prop, method, params }) => {

  // this will run a node child process
  // note that nothing is inherited, so consider it as a standalone script
  const fx = makeSynchronous(async ({ prop, method, drapisPath, authPath, scopes, params }) => {

    const { Auth } = await import(authPath)
    const { getDriveClient, responseSyncify } = await import(drapisPath)

    // the scopes are required to set up an appropriate auth
    Auth.setAuth(scopes)
    const auth = Auth.getAuth()

    // this is the node drive service
    const drive = getDriveClient(auth)
    const response = await drive[prop][method](params)

    return {
      data: response.data,
      response: responseSyncify(response)
    }
  })

  const scopes = Array.from(Auth.getAuthedScopes().keys())
  const result = fx({
    prop,
    method,
    drapisPath: getModulePath(drapisPath),
    authPath: getModulePath(authPath),
    scopes,
    params
  })
  return result
}

/**
 * sync a call to Drive api to stream a download
 * @param {object} p pargs
 * @param {string} p.prop the prop of drive eg 'files' for drive.files
 * @param {string} p.method the method of drive eg 'list' for drive.files.list
 * @param {object} p.params the params to add to the request
 * @return {DriveResponse} from the drive api
 */
const fxDriveMedia = ({ id }) => {

  // this will run a node child process
  // note that nothing is inherited, so consider it as a standalone script
  const fx = makeSynchronous(async ({ id, drapisPath, authPath, scopes }) => {

    const { Auth } = await import(authPath)
    const { getDriveClient, responseSyncify } = await import(drapisPath)
    const { getStreamAsBuffer } = await import('get-stream');

    // the scopes are required to set up an appropriate auth
    Auth.setAuth(scopes)
    const auth = Auth.getAuth()

    // this is the node drive service
    const drive = getDriveClient(auth)
    const streamed = await drive.files.get({
      fileId: id,
      alt: 'media'
    }, {
      responseType: 'stream'
    })
    const response =  responseSyncify(streamed)

    if (response.status === 200) {
      const buf = await getStreamAsBuffer(streamed.data)
      const data = Array.from(buf)
 
      return {
        data,
        response
      }
    } else {
      return {
        data: null,
        response
      }
    }
    
  })

  const scopes = Array.from(Auth.getAuthedScopes().keys())
  const result = fx({
    id,
    drapisPath: getModulePath(drapisPath),
    authPath: getModulePath(authPath),
    scopes
  })
  return result
}

const fxGetManifest = (manifestPath = './appsscript.json') => {

  const fx = makeSynchronous(async (manifestFile) => {
    const { readFile } = await import('node:fs/promises')
    console.log(`using manifest file:${manifestFile}`)
    const contents = await readFile(manifestFile, { encoding: 'utf8' })
    return JSON.parse(contents)
  })

  // we assume that the manifest file is in the same path as the executing main
  // TODO allow a yargs option to put it somewhere else
  const mainDir = path.dirname(process.argv[1])
  const manifestFile = path.resolve(mainDir, manifestPath)
  const result = fx(manifestFile)
  return result
}
/**
 * get any prop from an auth object, syncjronously
 * @param {prop} prop the prop that should be executed
 * @returns {*} the value of the prop
 */
const fxGet = (prop) => {

  // now turn all that into a synchronous function - it runs as a subprocess, so we need to start from scratch
  const fx = makeSynchronous(async (scopes, prop, authPath) => {
    const { Auth } = await import(authPath)

    // these are the scopes needed from the manifest file
    Auth.setAuth(scopes)
    const auth = Auth.getAuth()
    const value = await auth[prop]()
    return value
  })


  // these will already have been set from the manifest
  const scopes = Array.from(Auth.getAuthedScopes().keys())
  const result = fx(scopes, prop, getModulePath(authPath))
  return result
}

/**
 * wrap function in synch convertor, run and get access token
 * @returns {string}
 */
const fxGetAccessToken = () => {
  return fxGet("getAccessToken")
}
/**
 * wrap function in synch convertor, run and get access token
 * @returns {string}
 */
const fxGetProjectId = () => {
  return fxGet("getProjectId")
}
/**
 * a sync version of token checking
 * @param {string} token the token to check
 * @returns {object} access token info
 */
const fxCheckToken = (accessToken) => {

  // now turn all that into a synchronous function - it runs as a subprocess, so we need to start from scratch
  const fx = makeSynchronous(async accessToken => {
    const { default: got } = await import('got')
    const tokenInfo = await got(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`).json()
    return tokenInfo
  })

  const result = fx(accessToken)
  return result
}

/**
 * a sync version of fetching
 * @param {string} url the url to check
 * @param {object} options the options
 * @param {string[]} responseField the reponse fields to extract (we cant serialize native code)
 * @returns {reponse} urlfetch style reponse
 */
const fxFetch = (url, options, responseFields) => {
  // TODO need to handle muteHttpExceptions
  // now turn all that into a synchronous function - it runs as a subprocess, so we need to start from scratch
  const fx = makeSynchronous(async (url, options, responseFields) => {
    const { default: got } = await import('got')
    const response = await got(url, {
      ...options
    })
    // we cant return the response from this as it cant be serialized
    // so we;ll extract oout the fields required
    return responseFields.reduce((p, c) => {
      p[c] = response[c]
      return p
    }, {})
  })
  return fx(url, options, responseFields)
}

export const Syncit = {
  fxGetAccessToken,
  fxCheckToken,
  fxFetch,
  fxGetManifest,
  fxGetProjectId,
  fxDrive,
  fxDriveMedia
}