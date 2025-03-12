/**
 * Advanced drive service
 */
import { Proxies } from '../../support/proxies.js'
import { notYetImplemented ,  minFields,  is404, isGood, throwResponse, minPermissionFields} from '../../support/helpers.js'
import { getAuthedClient } from './drapis.js'
import { Syncit } from '../../support/syncit.js'
import { getFromFileCache, improveFileCache, setInFileCache } from '../../support/filecache.js';
import is from '@sindresorhus/is';
import { mergeParamStrings } from '../../support/utils.js';


/**
 * tidy up a fields parameter
 * @param {object} p
 * @param {string} [p.fields=minFields] which fields to get
 * @return {string[]} an array of the fields required merged with the minimum fields required to support caching
 */
const tidyFieldsFar = ({ fields = "" } = {}, mf = minFields) => {
  if (!is.string(fields)) {
    throw new Error(`invalid fields definition`, fields)
  }

  return Array.from(
    new Set((mf.split(",").concat(fields.split(","))
      .map(f => f.replace(/\s/g, ""))
      .filter(f => f)))
      .keys()
  )
}

/**
 * enhance the array of required fields by adding any propertyies already in cache
 * @param {object} p
 * @param {File} p.cachedFile meta data
 * @returns {string} an enhanced fields as a string with the dedupped fields already in cache
 */
const enhanceFar = ({ cachedFile, far }) => {
  // we'll enhance the cache with the current value of any already fetched key by fetching it again
  far = cachedFile ? Array.from(new Set(far.concat(Reflect.ownKeys(cachedFile))).keys()) : far

  // now construct an appropriate fields arg
  return far.join(",")
}
/**
 * check response from sync is good and throw an error if requried 
 * @param {string} id 
 * @param {SyncApiResponse} response 
 * @returns {SyncApiResponse} response 
 */
const checkResponse = (id, response, allow404) => {

  // sometimes a 404 will be allowed, sometimes not
  if (!isGood(response)) {

    // scratch for next time
    setInFileCache(id, null)

    if (!allow404 && is404(response)) {
      throwResponse(response)
    } else {
      return null
    }
  }
}

class FakeAdvDrive {
  constructor() {
    this.client = Proxies.guard(getAuthedClient())
  }
  toString() {
    return `AdvancedServiceIdentifier{name=drive, version=v3}`
  }
  getVersion() {
    return 'v3'
  }
  get Files() {
    return newFakeAdvDriveFiles(this)
  }
  get About() {
    return newFakeAdvDriveAbout(this)
  }
  get Accessproposals() {
    return notYetImplemented()
  }
  get Apps() {
    return notYetImplemented()
  }
  get Changes() {
    return notYetImplemented()
  }
  get Channels() {
    return notYetImplemented()
  }
  get Comments() {
    return notYetImplemented()
  }
  get Drives() {
    return notYetImplemented()
  }
  get Operations() {
    return notYetImplemented()
  }
  get Permissions() {
    return newFakeDrivePermissions(this)
  }
  get Replies() {
    return notYetImplemented()
  }
  get Revisions() {
    return notYetImplemented()
  }
  get Teamdrives() {
    return notYetImplemented()
  }

}

class FakeAdvDriveAbout {
  constructor(drive) {
    this.toString = drive.toString
  }

  // this is a schema and needs the fields parameter
  get() {
    return notYetImplemented()
  }
}



class FakeAdvDriveFiles {
  constructor(drive) {
    this.drive = drive
    this.name = 'Drive.Files'
    this.apiProp = 'files'
  }

  toString() {
    return this.drive.toString()
  }

  listLabels() {
    return notYetImplemented()
  }

  emptyTrash() {
    return notYetImplemented()
  }

  update() {
    return notYetImplemented()
  }

  list(params = {}) {
    // this is pretty straightforward as the onus is on thecaller to provide a valid queryOb
    // and validation will be done by the api.
    // however to support caching, we'll fiddle with the fields parameter
    const fob = params.fields && params.fields.files
    if (fob) {
      const far = tidyFieldsFar(fob)
      params = {...params, fields: {
        ...params.fields,
        files: far.join(",") 
      }}
    }

    // sincify that call
    const { response, data } = Syncit.fxDrive({ prop: this.apiProp, method: 'list', params })

    // maybe we need to throw an error
    if (!isGood(response)) {
      throwResponse (response)
    }

    // lets improve cache with any enhanced data we've found
    data.files.forEach (f=> { 
      improveFileCache (f.id, f)
    })
    return data

  }
  remove() {
    return notYetImplemented()
  }

  download() {
    return notYetImplemented()
  }

  modifyLabels() {
    return notYetImplemented()
  }

  watch() {
    return notYetImplemented()
  }


  /**
   * get file by Id
   * @param {string} id 
   * @param {object} params Drive api params
   * @param {object} [fakeparams]
   * @param {boolean} [fakeparams.allow404=true] whether to allow 404 errors
   * @returns {Drive.File}
   */
  get(id, params = {}, { allow404 = true } = {}) {

    // now clean up 
    let far = tidyFieldsFar(params)

    // the cache will check the fields it already has against those requested
    const { cachedFile, good } = getFromFileCache(id, far)
    if (good) return cachedFile


    // we'll enhance the cache with the current value of any already fetched field by fetching it again
    params = { ...params, fileId: id, fields: enhanceFar({ cachedFile, far }) }

    // run as a sub process to unasync it
    const { response, data: file } = Syncit.fxDrive({ prop: this.apiProp, method: 'get', params })

    // maybe we need to throw an error
    checkResponse(id, response, allow404)

    // finally register in cache for next time
    return improveFileCache(id, file)
  }

  create() {
    return notYetImplemented()
  }

  generateIds() {
    return notYetImplemented()
  }

  copy() {
    return notYetImplemented()
  }

  export() {
    return notYetImplemented()
  }

}

class FakeAdvDrivePermissions {
  constructor (drive) {
    this.drive = drive
    this.apiProp ="permissions"
  }
  create () {
    return notYetImplemented('create')
  }
  delete () {
    return notYetImplemented('delete')
  }
  get () {
    return notYetImplemented('get')
  }
  list (fileId, params = {}) {
    params = {...params,   fileId }
    params.fields = mergeParamStrings (params.fields || "", `permissions(${minPermissionFields})`)  
    const { response, data } = Syncit.fxDrive({ prop: this.apiProp, method: 'list', params })
    // maybe we need to throw an error
    checkResponse(fileId, response, false)
    return data
  }
  update () {
    return notYetImplemented('update')
  }
}

const newFakeDrivePermissions= (...args) => Proxies.guard(new FakeAdvDrivePermissions(...args))
const newFakeAdvDriveFiles = (...args) => Proxies.guard(new FakeAdvDriveFiles(...args))
const newFakeAdvDriveAbout = (...args) => Proxies.guard(new FakeAdvDriveAbout(...args))
export const newFakeAdvDrive = (...args) => Proxies.guard(new FakeAdvDrive(...args))



/* methods to implement
toString: [Function],
  getVersion: [Function],
  newTeamDriveRestrictions: [Function],
  newTeamDrive: [Function],
  newLabelFieldModification: [Function],
  newFileImageMediaMetadataLocation: [Function],
  newRevision: [Function],
  newComment: [Function],
  newFile: [Function],
  newContentRestriction: [Function],
  newDrive: [Function],
  newDriveCapabilities: [Function],
  newFileVideoMediaMetadata: [Function],
  newDriveBackgroundImageFile: [Function],
  newResolveAccessProposalRequest: [Function],
  newFileLabelInfo: [Function],
  newTeamDriveBackgroundImageFile: [Function],
  newFileContentHints: [Function],
  newPermission: [Function],
  newFileLinkShareMetadata: [Function],
  newFileImageMediaMetadata: [Function],
  newFileCapabilities: [Function],
  newCommentQuotedFileContent: [Function],
  newReply: [Function],
  newFileContentHintsThumbnail: [Function],
  newModifyLabelsRequest: [Function],
  newUser: [Function],
  newLabel: [Function],
  newDownloadRestriction: [Function],
  newLabelModification: [Function],
  newPermissionPermissionDetails: [Function],
  newDriveRestrictions: [Function],
  newPermissionTeamDrivePermissionDetails: [Function],
  newFileShortcutDetails: [Function],
  newChannel: [Function],
  newTeamDriveCapabilities: [Function],
  About: { toString: [Function], get: [Function] },




  Accessproposals: 
   { toString: [Function],
     resolve: [Function],
     get: [Function],
     list: [Function] },
  Apps: { toString: [Function], get: [Function], list: [Function] },
  Changes: 
   { toString: [Function],
     getStartPageToken: [Function],
     watch: [Function],
     list: [Function] },
  Channels: { toString: [Function], stop: [Function] },
  Comments: 
   { toString: [Function],
     get: [Function],
     create: [Function],
     update: [Function],
     list: [Function],
     remove: [Function] },
  Drives: 
   { toString: [Function],
     hide: [Function],
     get: [Function],
     create: [Function],
     update: [Function],
     list: [Function],
     remove: [Function],
     unhide: [Function] },
  Files: 
   { toString: [Function],
     listLabels: [Function],
     emptyTrash: [Function],
     update: [Function],
     list: [Function],
     remove: [Function],
     download: [Function],
     modifyLabels: [Function],
     watch: [Function],
     get: [Function],
     create: [Function],
     generateIds: [Function],
     copy: [Function],
     export: [Function] },
  Operations: 
   { toString: [Function],
     cancel: [Function],
     get: [Function],
     list: [Function],
     remove: [Function] },
  Permissions: 
   { toString: [Function],
     get: [Function],
     create: [Function],
     update: [Function],
     list: [Function],
     remove: [Function] },
  Replies: 
   { toString: [Function],
     get: [Function],
     create: [Function],
     update: [Function],
     list: [Function],
     remove: [Function] },
  Revisions: 
   { toString: [Function],
     get: [Function],
     update: [Function],
     list: [Function],
     remove: [Function] },
  Teamdrives: 
   { toString: [Function],
     get: [Function],
     create: [Function],
     update: [Function],
     list: [Function],
     remove: [Function] } }
*/
