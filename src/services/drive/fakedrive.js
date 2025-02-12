import { Proxies } from '../../support/proxies.js'
import { newPeeker } from '../../support/peeker.js'
import { Utils } from '../../support/utils.js'
import {
  handleError,
  decorateParams,
  minFields,
  minFieldsList,
  isFolder,
  throwResponse
} from './fakedrivehelpers.js'
import { Syncit } from '../../support/syncit.js'
import { folderType } from '../../support/constants.js'


/**
 * things are pretty slow on node, especially repeatedly getting parents
 * so we'll cache that over here
 */
const CACHE_ENABLED = true
const fileCache = new Map()
const getFromCache = (id) => {
  if (CACHE_ENABLED) {
    const file = fileCache.get(id)
    if (file) return file
  }
  return null
}

/**
 * create a new drive file instance
 * @param  {...any} args 
 * @returns {FakeDriveFile}
 */
const newFakeDriveFile = (...args) => {
  return Proxies.guard(new FakeDriveFile(...args))
}

/**
 * create a new drive folder instance
 * @param  {...any} args 
 * @returns {FakeDriveFolder}
 */
const newFakeDriveFolder = (...args) => {
  return Proxies.guard(new FakeDriveFolder(...args))
}

/**
 * create a new drive app instance
 * @param  {...any} args 
 * @returns {FakeDriveApp}
 */
export const newFakeDriveApp = (...args) => {
  return Proxies.guard(new FakeDriveApp(...args))
}


/**
 * list  get any kind using the NODE client
 * @param {string} [parentId] the parent id 
 * @param {function} [handler = handleError]
 * @param {object|[object]} [qob] any additional queries
 * @param {TODO} [fields] the fields to fetch
 * @param {TODO} [options] mimic fetchapp options
 * @param {string} [pageToken=null] if we're doing a pagetoken kind of thing
 * @param {boolean} folderTypes whether to get foldertypes 
 * @param {boolean} fileTypes whether to get fileTypes 
 * @returns {object} a collection of files {response, data}
 */
const fileLister = ({
  qob, parentId, fields, handler, folderTypes, fileTypes, pageToken = null, fileName
}) => {
  // enhance any already supplied query params
  qob = Utils.arrify(qob) || []
  if (parentId) {
    qob.push(`'${parentId}' in parents`)
  }

  // wheteher we're getting files,folders or both
  if (!(folderTypes || fileTypes)) {
    throw new Error(`Must specify either folder type,file type or both`)
  }

  // exclusive xor - if they're both true we dont need to do any extra q filtering
  if (folderTypes !== fileTypes) {
    qob.push(`mimeType${fileTypes ? "!" : ""}='${folderType}'`)
  }

  const q = qob.map(f => `(${f})`).join(" and ")
  let params = { q }
  if (pageToken) {
    params.pageToken = pageToken
  }

  params = decorateParams({ fields, params, min: minFieldsList })

  // this will have be synced from async
  try {
    const result = Syncit.fxDrive({ prop: "files", method: "list", params })
    return result
  } catch (err) {
    handler(err)
  }

  return result
}
/**
 * general getter by id
 * @param {object} p args
 * @param {string} p.id the id to get
 * @param {boolean} [p.allow404=true] normally a 404 doesnt throw an error 
 * @returns {FakeDriveFolder}
 */
const getFileById = ({ id, allow404 = true, fields }) => {

  // we'll pull this from cache if poss
  const cachedFile = getFromCache(id)
  if (cachedFile && (!fields || Utils.arrify(fields).every(f => Reflect.has(cachedFile, f)))) {
    return cachedFile
  }

  // it wasnt in cache
  const { file, response } = fetchFile({ id, fields })
  if (!file) {
    if (!allow404) {
      throwResponse(response)
    } else {
      return null
    }
  }
  if (CACHE_ENABLED) {
    fileCache.set(id, file)
  }
  return file
}


/**
 * shared get any kind of file meta data by its id
 * @param {string} [parentId] the parent id 
 * @param {function} [handler = handleError]
 * @param {object[]} [qob] any additional queries
 * @param {object|object[]} [fields] the fields to fetch
 * @param {TODO} [options] mimic fetchapp options
 * @param {boolean} folderTypes whether to get foldertypes 
 * @param {boolean} fileTypes whether to get fileTypes 
 * @returns {object} {Peeker}
 */
const getFilesIterator = ({
  qob,
  parentId = null,
  fields = [],
  handler = handleError,
  folderTypes,
  fileTypes
}) => {

  // parentId can be null to search everywhere
  if (!Utils.isNull(parentId)) Utils.assertType(parentId, "string")
  Utils.assertType(handler, "function")
  Utils.assertType(fields, "object")
  Utils.assertType(folderTypes, "boolean")
  Utils.assertType(fileTypes, "boolean")


  /**
   * this generator will get chunks of matching files from the drive api
   * and yield them 1 by 1 and handle paging if required
   */
  function* filesink() {
    // the result tank
    let tank = []
    // the next page token
    let pageToken = null

    do {
      // if nothing in the tank, fill it up
      if (!tank.length) {

        const result = fileLister({
          qob, parentId, fields, handler, folderTypes, fileTypes, pageToken
        })

        // the presence of a nextPageToken is the signal that there's more to come
        pageToken = result.data.nextPageToken

        // format the results into the folder or file object
        tank = result.data.files.map(
          f => isFolder(f) ? newFakeDriveFolder(f) : newFakeDriveFile(f)
        )
      }

      // if we've got anything in the tank send back the oldest one
      if (tank.length) {
        yield tank.splice(0, 1)[0]
      }
      // if there's still anything left in the tank, 
      // or there's a page token to get more continue
    } while (pageToken || tank.length)
  }

  // create the iterator
  const fileit = filesink()

  // a regular iterator doesnt support the same methods 
  // as Apps Script so we'll fake that too
  return newPeeker(fileit)

}

/**
 * this gets an intertor to fetch all the parents meta data
 * @param {FakeDriveMeta} {file} the meta data
 * @returns {object} {Peeker}
 */
const getParentsIterator = ({
  file
}) => {

  Utils.assertType(file, "object")
  Utils.assertType(file.parents, "array")

  function* filesink() {
    // the result tank, we just get them all by id
    let tank = file.parents.map(id => getFileById({ id, allow404: false }))

    while (tank.length) {
      yield newFakeDriveFolder(tank.splice(0, 1)[0])
    }
  }

  // create the iterator
  const parentsIt = filesink()

  // a regular iterator doesnt support the same methods 
  // as Apps Script so we'll fake that too
  return newPeeker(parentsIt)

}

/**
 * shared get any kind of file meta data by its id
 * @param {string} id the file id 
 * @param {function} [handler = handleError]
 * @param {TODO} [fields] the fields to fetch
 * @returns {object} {File, FakeHttpResponse}
 */
const fetchFile = ({ id, handler = handleError, fields }) => {
  Utils.assertType(id, "string")
  Utils.assertType(handler, "function")

  const params = decorateParams({
    fields, min: minFields, params: { fileId: id }
  })

  // TODO need to handle muteHttpExceptions and any other options
  // use the sync version of the drive gapi api
  const { data, response } = Syncit.fxDrive({ prop: "files", method: "get", params })
  return {
    file: data,
    response
  }
}


/**
 * a File type returned from the json api with my default fields applied
 * there could be others if custom fields are returned
 * @typedef File
 * @property {string} id the id
 * @property {string} name the name
 * @property {string} mimeType the mimetype
 * @property {string[]} parents ids of parents
 */

/**
 * basic fake File meta data
 * @class FakeDriveMeta
 * @returns {FakeDriveMeta}
 */
export class FakeDriveMeta {
  /**
   * 
   * @constructor 
   * @param {File} meta data from json api
   * @returns {FakeDriveMeta}
   */
  constructor(meta) {
    this.meta = meta
  }


  /**
   * get the file id
   * @returns {string} the file id
   */
  getId() {
    return this.meta.id
  }

  /**
   * get the file name
   * @returns {string} the file name
   */
  getName() {
    return this.meta.name
  }

  /**
   * get the file mimetype
   * @returns {string} the file mimetpe
   */
  getMimeType() {
    return this.meta.mimeType
  }

  /**
   * get the ids of the parents
   * @returns {string[]} the file parents
   */
  getParents() {
    return getParentsIterator({ file: this.meta })
  }

  /**
   * for enhancing the file with fields not retrieved by default
   * @param {string|string[]} [field=[]] the required fields
   * @return {FakeDriveMeta} self
   */
  decorateWithFields(fields = []) {
    const newMeta = getFileById({ id: this.getId(), fields, allow404: false })
    // need to merge this with already known fields
    this.meta = { ...this.meta, ...newMeta }
    return this
  }

  /**
   * the meta data for the following fields are not fetched by default
   */
  getDecorated(prop) {
    return this.decorateWithFields(prop).meta[prop]
  }


  getSize() {
    // the meta is actually a string so convert
    return parseInt(this.getDecorated("size"), 10)
  }

  getDateCreated() {
    return new Date(this.getDecorated("createdTime"))
  }

  getDescription() {
    // the meta can be undefined so return null
    const d = this.getDecorated("description")
    return Utils.isUndefined(d) ? null : d
  }

  getLastUpdated() {
    return new Date(this.getDecorated("modifiedTime"))
  }

  isStarred() {
    return this.getDecorated("starred")
  }

  isTrashed() {
    return this.getDecorated("trashed")
  }
}


/**
 * basic fake File
 * TODO add lots more methods
 * @class FakeDriveFile
 * @extends FakeDriveMeta
 * @returns {FakeDriveFile}
 */
export class FakeDriveFile extends FakeDriveMeta {
  /**
   * 
   * @constructor 
   * @param {File} meta data from json api
   * @returns {FakeDriveFile}
   */
  constructor(meta) {
    super(meta)
    if (isFolder(meta)) {
      throw new Error(`file cant be a folder:` + JSON.stringify(meta))
    }

  }
  /**
   * 
   * @returns {FakeBlob}
   */
  getBlob() {
    // spawn child process to syncify getting content as by array
    const { data } = Syncit.fxDriveMedia({ id: this.getId() })
    // and blobify
    return Utilities.newBlob(data, this.getName(), this.getMimeType())
  }

}

/**
 * basic fake Folder
 * TODO add lots more methods
 * @class FakeDriveFolder
 * @extends FakeDriveFile
 * @returns {FakeDriveFolder}
 */
export class FakeDriveFolder extends FakeDriveMeta {

  /**
   * 
   * @constructor 
   * @param {File} meta data from json api
   * @returns {FakeDriveFile}
   */
  constructor(meta) {
    super(meta)
    if (!isFolder(meta)) {
      throw new Error(`file must be a folder:` + JSON.stringify(meta))
    }
  }

  //TODO something wrong with this
  get _isRoot() {
    return Boolean(this.getParents() || !this.getParents().length)
  }

  /**
   * get files in this folder
   * @return {FakeDriveFileIterator}
   */
  getFiles() {
    return getFilesIterator({
      parentId: this.getId(),
      folderTypes: false,
      fileTypes: true
    })
  }

  /**
   * get folders in this folder
   * @return {FakeDriveFileIterator}
   */
  getFolders() {
    return getFilesIterator({
      parentId: this.getId(),
      fileTypes: false,
      folderTypes: true
    })
  }

  /**
   * get file by Id
   * folders can get files
   * @param {string} id 
   * @returns {FakeDriveFile|null}
   */
  getFileById(id) {
    const file = getFileById({ id })
    return file ? newFakeDriveFile(file) : null
  }

  /**
   * get folder by Id
   * folders can get files
   * @param {string} id 
   * @returns {FakeDriveFolder|null}
   */
  getFolderById(id) {
    const file = getFileById({ id })
    return file ? newFakeDriveFolder(file) : null
  }

  /**
   * get folders by name
   * @param {string} name 
   * @return {FakeDriveFileIterator}
  */
  getFoldersByName(name) {
    return getFilesIterator({
      parentId: this.getId(),
      fileTypes: false,
      folderTypes: true,
      qob: [`name='${name}'`]
    })
  }
  /**
   * get files by name
   * @param {string} name 
   * @return {FakeDriveFileIterator}
   */
  getFilesByName(name) {
    return getFilesIterator({
      parentId: this.getId(),
      fileTypes: true,
      folderTypes: false,
      qob: [`name='${name}'`]
    })
  }

}

/**
 * basic fake DriveApp
 * TODO add lots more methods
 * @class FakeDriveApp
 * @extends FakeDriveFolder
 * @returns {FakeDriveApp}
 */
export class FakeDriveApp {

  constructor() {
    const file = getFileById({ id: 'root', allow404: false })
    this.rootFolder = newFakeDriveFolder(file)
  }

  /**
   * get folder by Id
   * folders can get files
   * @returns {FakeDriveFolder}
   */
  getRootFolder() {
    const file = getFileById({ id: 'root', allow404: false })
    return newFakeDriveFolder(file)
  }

  getFileById(id) {
    return this.rootFolder.getFileById(id)
  }

  getFolderById(id) {
    return this.rootFolder.getFolderById(id)
  }
  
  /**
   * get folders by name
   * @param {string} name 
   * @return {FakeDriveFileIterator}
  */
  getFoldersByName(name) {
    return getFilesIterator({
      fileTypes: false,
      folderTypes: true,
      qob: [`name='${name}'`]
    })
  }

  /**
   * get folders by name
   * @param {string} name 
   * @return {FakeDriveFileIterator}
  */
  getFilesByName(name) {
    return getFilesIterator({
      fileTypes: true,
      folderTypes: false,
      qob: [`name='${name}'`]
    })
  }

}