/**
 * these are utilities to create and run sync versions of services
 * the sx versions are all async in separate files so they can be tested async if necessary
 * they are made sync when called from here
 */
import makeSynchronous from 'make-synchronous';
import path from 'path'
import { Auth } from "./auth.js"
import { randomUUID } from 'node:crypto'
import mime from 'mime';
import { sxStreamUpMedia,  sxApi, sxDriveMedia } from './sxdrive.js';
import { sxStore } from './sxstore.js'
import { sxInit } from './sxauth.js'
import { sxZipper, sxUnzipper } from './sxzip.js';
import { sxFetch } from './sxfetch.js';

const authPath = "../support/auth.js"
const drapisPath = "../services/driveapp/drapis.js"
const shapisPath = "../services/drive/shapis.js"
const kvPath = '../support/kv.js'
const manifestDefaultPath = './appsscript.json'
const claspDefaultPath = "./.clasp.json"
const settingsDefaultPath = "./gasfakes.json"
const propertiesDefaultPath = "/tmp/gas-fakes/properties"
const cacheDefaultPath = "/tmp/gas-fakes/cache"

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
 * sync a call to Drive api to stream a download
 * @param {object} p pargs
 * @param {string} p.method - update or create
 * @param {string} [p.file] the file meta data
 * @param {blob} [p.blob] the content
 * @param {string} [p.fields] the fields to return
 * @param {string} [p.mimeType] the mimeType to assign
 * @param {string} [p.fileId] the fileId - required of patching
 * @param {object} [p.params] any extra params
 * @return {DriveResponse} from the drive api
 */
const fxStreamUpMedia = ({ file = {}, blob, fields, method = "create", fileId, params={} }) => {

  // scopes are already set
  const scopes = Array.from(Auth.getAuthedScopes().keys())

  // get a sync version of this async function
  const fx = makeSynchronous(sxStreamUpMedia)

  // run in a subprocess
  const result = fx({
    resource: file,
    bytes: blob ? blob.getBytes() : null,
    drapisPath: getModulePath(drapisPath),
    authPath: getModulePath(authPath),
    scopes,
    fields,
    method,
    mimeType: file.mimeType || blob?.getContentType(),
    fileId,
    params
  })

  return result
}

/**
 * zipper
 * @param {object} p
 * @param {FakeBlob} p.blobs an array of blobs to be zipped
 * @returns {FakeBlob} a combined zip file
 */
const fxZipper = ({ blobs }) => {

  const dupCheck = new Set()
  const blobsContent = blobs.map((f, i) => {
    const ext = mime.getExtension(f.getContentType())
    const name = f.getName() || `Untitled${i + 1}${ext ? "." + ext : ""}`
    if (dupCheck.has(name)) {
      throw new Error(`Duplicate filename ${name} not allowed in zip`)
    }
    dupCheck.add(name)
    return {
      name,
      bytes: f.getBytes()
    }
  })
  // get a sync version of this async function
  const fx = makeSynchronous(sxZipper)
  return fx({
    blobsContent
  })

}

/**
 * Unzipper
 * @param {object} p
 * @param {FakeBlob} p.blob the blob containing the zipped files
 * @returns {FakeBlob[]} each of the files unzipped
 */
const fxUnzipper = ({ blob }) => {
  const blobContent = {
    name: blob.getName(),
    bytes: blob.getBytes()
  }
  // get a sync version of this async function
  const fx = makeSynchronous(sxUnzipper)
  return fx({
    blobContent
  })
}

/**
 * initialize all the stuff at the beginning such as manifest content and settings
 * and register them all in Auth object for future reference
 * @param {object} p pargs
 * @param {string} p.manifestPath where to finfd the manifest by default
 * @param {string} p.claspPath where to find the clasp file by default
 * @param {string} p.settingsPath where to find the settings file
 * @param {string} p.cachePath the cache files
 * @param {string} p.propertiesPath the properties file location
 * @return {object} the finalized vesions of all the above 
 */
const fxInit = ({
  manifestPath = manifestDefaultPath,
  claspPath = claspDefaultPath,
  settingsPath = settingsDefaultPath,
  cachePath = cacheDefaultPath,
  propertiesPath = propertiesDefaultPath
} = {}) => {

  // this is the path of the runing main process
  const mainDir = path.dirname(process.argv[1])

  // get a sync version of this async function
  const fx = makeSynchronous(sxInit)

  // because this is all run in a synced subprocess it's not an async result
  const synced = fx({
    claspPath,
    settingsPath,
    manifestPath,
    authPath: getModulePath(authPath),
    mainDir,
    cachePath,
    propertiesPath,
    fakeId: randomUUID()
  })

  const {
    scopes,
    projectId,
    tokenInfo,
    accessToken,
    settings,
    manifest,
    clasp
  } = synced

  // set these values from the subprocess for the main project
  Auth.setAuth(scopes)
  Auth.setProjectId(projectId)
  Auth.setTokenInfo(tokenInfo)
  Auth.setAccessToken(accessToken)
  Auth.setSettings(settings)
  Auth.setClasp(clasp)
  Auth.setManifest(manifest)
  return synced

}

/**
 * sync a call to google api
 * @param {object} p pargs
 * @param {string} p.prop the prop of drive eg 'files' for drive.files
 * @param {string} p.method the method of drive eg 'list' for drive.files.list
 * @param {object} p.params the params to add to the request
 * @param {string} p.apiPath where to import the api from
 * @return {DriveResponse} from the drive api
 */
const fxApi = ({ prop, method, params, apiPath, options }) => {

  const scopes = Array.from(Auth.getAuthedScopes().keys())

  // get a sync version of this async function
  const fx = makeSynchronous(sxApi)

  const result = fx({
    prop,
    method,
    apiPath: getModulePath(apiPath),
    authPath: getModulePath(authPath),
    scopes,
    params,
    options
  })

  return result
}

/**
 * because we're using a file backed cache we need to syncit
 * it'll slow it down but it's necessary to emuate apps script behavior
 * @param {object} p params
 * @param {}
 * @returns {*}
 */
const fxStore = (storeArgs, method = "get", ...kvArgs) => {

  // get a sync version of this async function
  const fx = makeSynchronous(sxStore)

  const result = fx({
    kvPath: getModulePath(kvPath),
    method,
    kvArgs,
    storeArgs
  })

  return result
}

/**
 * sync a call to Drive api
 * @param {object} p pargs
 * @param {string} p.prop the prop of drive eg 'files' for drive.files
 * @param {string} p.method the method of drive eg 'list' for drive.files.list
 * @param {object} p.params the params to add to the request
 * @return {DriveResponse} from the drive api
 */
const fxDrive = ({ prop, method, params }) => {
  const scopes = Array.from(Auth.getAuthedScopes().keys())
  return fxApi({
    prop,
    method,
    apiPath: drapisPath,
    authPath,
    scopes,
    params
  })

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

  // get a sync version of this async function
  const fx = makeSynchronous(sxDriveMedia)
  const scopes = Array.from(Auth.getAuthedScopes().keys())
  const result = fx({
    id,
    drapisPath: getModulePath(drapisPath),
    authPath: getModulePath(authPath),
    scopes
  })
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
  const fx = makeSynchronous(sxFetch)
  return fx(url, options, responseFields)
}

export const Syncit = {
  fxFetch,
  fxDrive,
  fxDriveMedia,
  fxInit,
  fxStore,
  fxZipper,
  fxUnzipper,
  fxStreamUpMedia
}