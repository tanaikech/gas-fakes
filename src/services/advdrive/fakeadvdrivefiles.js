import { Proxies } from '../../support/proxies.js'
import { notYetImplemented, isGood, throwResponse, minFields } from '../../support/helpers.js'
import { Syncit } from '../../support/syncit.js'
import { getFromFileCache, improveFileCache, checkResponse } from '../../support/filecache.js';
import {Utils} from '../../support/utils.js'
const {is} = Utils

/**
 * these apply to Drive.files
 */
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
      params = {
        ...params, fields: {
          ...params.fields,
          files: far.join(",")
        }
      }
    }

    // sincify that call
    const { response, data } = Syncit.fxDrive({ prop: this.apiProp, method: 'list', params })

    // maybe we need to throw an error
    if (!isGood(response)) {
      throwResponse(response)
    }

    // lets improve cache with any enhanced data we've found
    data.files.forEach(f => {
      improveFileCache(f.id, f)
    })
    return data

  }
  remove() {
    return notYetImplemented()
  }

  /**
   * this is fairly pointless in apps script as it returns an operation, and Drive.Operations are not supported
   * TODO - look into what actually happens to the operation - it may be possible to do something with it using the operations ap directly
   * for the moment we'll just return a fake operation that looks like adv returns
   * @param {string} fileId 
   * @param {object} params 
   * @returns {object}
   */
  download(fileId, params = {}) {

    // this just gets the meta data which we'll use to enhance cache


    // we'll just do a get to populate cache with any new meta data
    const file = this.get(fileId, params, { allow404: false })

    // the download uri us just constructed from the id - doesnt appear to be in any of the properties of file
    return {
      metadata: {
        "@type": "type.googleapis.com/google.apps.drive.v3.DownloadFileMetadata"
      },
      // this is an operation name
      name: "operation name not implemented as drive.operations not supported by advanced drive anyway",
      response: {
        // the only thing of interest here for now
        partialDownloadAllowed: true,
        downloadUri: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&source=downloadUrl`,
        "@type": "type.googleapis.com/google.apps.drive.v3.DownloadFileResponse"
      },
      done: true
    }

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

  /**
   * ceate a file and optionally upload some data
   * @param {File} [file] file resource
   * @param {Blob} [blob] the mediadata 
   */
  create(file = {}, blob) {
    if (!is.undefined(blob) && !Utils.isBlob(blob)) {
      throw new Error("The mediaData parameter only supports Blob types for upload.")
    }
    const mimeType = file.mimeType || blob?.getContentType()
    const name = file.name || blob?.getName() || (isFolder({ mimeType }) ? "New Folder" : "Untitled")
    const result = Syncit.fxStreamUpMedia({ fields: minFields, blob, file: { ...file, mimeType, name } })
    const { data, response } = result
    checkResponse(data?.id, response, false)
    improveFileCache(data.id, data)
    return data
  }

  generateIds() {
    return notYetImplemented()
  }

  /**
   * ceate a file and optionally upload some data
   * @param {File} [file] file resource to patch
   * @param {string} fileId the file to copy 
   * @param {object} [options] request options
   */
  copy(file, fileId, options) {
    if (!is.nonEmptyString(fileId)) {
      throw new Error ("API call to drive.files.copy failed with error: Required")
    }
    const params = {
      fields: minFields,
      fileId,
      resource: file
    }

    const { response, data } =  Syncit.fxDrive({ prop: this.apiProp, method: 'copy', params, options })
    checkResponse(data?.id, response, false)
    improveFileCache(data.id, data)
    return data
  }

  export() {
    return notYetImplemented()
  }

}


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

export const newFakeAdvDriveFiles = (...args) => Proxies.guard(new FakeAdvDriveFiles(...args))