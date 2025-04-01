/**
 * these are utilities to create and run sync versions of services
 * the sx versions are all async in separate files so they can be tested async if necessary
 * they are made sync when called from here
 * move all caching logic to here so we can forget anbout it higher up
 */

import makeSynchronous from 'make-synchronous';
import path from 'path'
import { Auth } from "./auth.js"
import { randomUUID } from 'node:crypto'
import mime from 'mime';
import { sxStreamUpMedia,  sxDriveMedia } from './sxdrive.js';
import { sxApi } from './sxapi.js';
import { sxStore } from './sxstore.js'
import { sxInit } from './sxauth.js'
import { sxZipper, sxUnzipper } from './sxzip.js';
import { sxFetch } from './sxfetch.js';
import { minFields } from './helpers.js'
import { mergeParamStrings } from './utils.js'
import { improveFileCache, checkResponse, getFromFileCache } from "./filecache.js"

const authPath = "../support/auth.js"
const drapisPath = "../services/driveapp/drapis.js"
const shapisPath = "../services/spreadsheetapp/shapis.js"
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
 * check and register a result in cache
 * @param {import('./sxdrive.js').SxResult} the result of a sync api call
 * @return {import('./sxdrive.js').SxResult} 
 */
const registerSx = (result, allow404 = false, fields) => {
  const { data, response } = result
  checkResponse(data?.id, response, allow404)
  if (data?.id) {
    return {
      ...result,
      data: improveFileCache(data.id, data, fields)
    }
  } else {
    return result
  }
}
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
 * @return {import('./sxdrive.js').SxResult} from the drive api
 */
const fxStreamUpMedia = ({ file = {}, blob, fields = "", method = "create", fileId, params = {} }) => {

  // scopes are already set
  const scopes = Array.from(Auth.getAuthedScopes().keys())

  // merge the required fields with the minimum
  fields = mergeParamStrings(minFields, fields)

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
  // check result and register in cache
  return registerSx(result, false,fields)
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
 * sync a call to sheets api
 * @param {object} p pargs
 * @param {string} p.prop the prop of sheet eg 'spreadsheets' for sheets.spreadsheets
 * @param {string} p.method the method of drive eg 'get' for sheets.spreadsheets.get
 * @param {object} p.params the params to add to the request
 * @return {SheetsResponse} from the sheets api
 */
const fxSheets = ({ prop, method, params }) => {


  const scopes = Array.from(Auth.getAuthedScopes().keys())
  return fxApi({
    prop,
    method,
    apiPath: shapisPath,
    authPath,
    scopes,
    params
  })

}

/**
 * sync a call to Drive api get
 * @param {object} p pargs
 * @param {string} p.id the file id
 * @param {boolean} [p.allowCache=true] whether to allow the result to come from cache
 * @param {boolean} [p.allow404=false] whether to allow 404 errors
 * @param {object} p.params the params to add to the request
 * @return {DriveResponse} from the drive api
 */
const fxDriveGet = ({ id, params, allow404 = false, allowCache = true }) => {

  // fixup the fields param
  // we'll fiddle with the scopes to populate cache
  params.fields = mergeParamStrings(minFields, params.fields || "")
  params.fileId = id

  // now we check if it's in cache and already has the necessary fields
  // the cache will check the fields it already has against those requested
  if (allowCache) {
    const { cachedFile, good } = getFromFileCache(id, params.fields)
    if (good) return {
   
      data: cachedFile,
      // fake a good sxresponse
      response: {
        status: 200,
        fromCache: true
      }
    }
  }
 
  // so we have to hit the API
  // these would have been set from the manifest
  const scopes = Array.from(Auth.getAuthedScopes().keys())
  const result = fxApi({
    prop: "files",
    method: "get",
    apiPath: drapisPath,
    authPath,
    scopes,
    params
  })

  // check result and register in cache
  return registerSx(result, allow404,params.fields)
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
  fxStreamUpMedia,
  fxDriveGet,
  fxSheets
}