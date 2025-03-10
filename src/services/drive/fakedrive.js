import { Proxies } from '../../support/proxies.js'
import { newPeeker } from '../../support/peeker.js'
import { Utils } from '../../support/utils.js'
import is from '@sindresorhus/is';
import { folderType, minFields, isFolder } from '../../support/general.js'


import { Syncit } from '../../support/syncit.js'


/**
 * list  get any kind using the NODE client
 * @param {string} [parentId] the parent id 
 * @param {object|[object]} [qob] any additional queries
 * @param {string} [fields] the fields to fetch
 * @param {TODO} [options] mimic fetchapp options
 * @param {string} [pageToken=null] if we're doing a pagetoken kind of thing
 * @param {boolean} folderTypes whether to get foldertypes 
 * @param {boolean} fileTypes whether to get fileTypes 
 * @returns {object} a collection of files {response, data}
 */
const fileLister = ({
  qob, parentId, fields, folderTypes, fileTypes, pageToken = null
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
  let params = { q, fields }
  if (pageToken) {
    params.pageToken = pageToken
  }

  // this will have be synced from async
  try {
    const result = Drive.Files.list(params)
    return result
  } catch (err) {
    console.error(err)
    throw new Error(err)
  }

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
 * shared get any kind of file meta data by its id
 * @param {string} [parentId] the parent id 
 * @param {object[]} [qob] any additional queries
 * @param {boolean} folderTypes whether to get foldertypes 
 * @param {boolean} fileTypes whether to get fileTypes 
 * @returns {object} {Peeker}
 */
const getFilesIterator = ({
  qob,
  parentId = null,
  folderTypes,
  fileTypes
}) => {

  const { assert } = Utils
  // parentId can be null to search everywhere
  if (!is.null(parentId)) assert.nonEmptyString(parentId)
  assert.boolean(folderTypes)
  assert.boolean(fileTypes)

  // DriveApp doesnt give option to specify these so this will be fixes
  const fields = `files(${minFields}),nextPageToken`

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
      // if nothing in the tank, fill it upFdrive
      if (!tank.length) {
        const data = fileLister({
          qob, parentId, fields, folderTypes, fileTypes, pageToken
        })

        // the presence of a nextPageToken is the signal that there's more to come
        pageToken = data.nextPageToken


        // format the results into the folder or file object
        tank = data.files.map(
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
  const { assert } = Utils
  assert.object(file)
  assert.array(file.parents)

  function* filesink() {
    // the result tank, we just get them all by id
    let tank = file.parents.map(id => Drive.Files.get(id, {}, { allow404: false }))

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
    this.decorateWithFields("id")
    return this.meta.id
  }

  /**
   * get the file name
   * @returns {string} the file name
   */
  getName() {
    this.decorateWithFields("name")
    return this.meta.name
  }

  /**
   * get the file mimetype
   * @returns {string} the file mimetpe
   */
  getMimeType() {
    this.decorateWithFields("mimeType")
    return this.meta.mimeType
  }

  /**
   * get the ids of the parents
   * @returns {string[]} the file parents
   */
  getParents() {
    this.decorateWithFields("parents")
    return getParentsIterator({ file: this.meta })
  }

  /**
   * for enhancing the file with fields not retrieved by default
   * @param {string} fields='' the required fields
   * @return {FakeDriveMeta} self
   */
  decorateWithFields(fields) {
    // if we already have it nothing needed
    if (!is.nonEmptyString(fields)) {
      throw new Error('decorate fields was not a non empty string')
    }
    const sf = fields.split(",")

    if (sf.every(f => Reflect.has(this.meta, f))) {
      return this
    }

    const newMeta = Drive.Files.get(this.getId(), { fields }, { allow404: false })
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
    const d = parseInt(this.getDecorated("size"), 10)
    // folders dont return a size
    return isNaN(d) ? 0 : d
  }

  getDateCreated() {
    return new Date(this.getDecorated("createdTime"))
  }

  getDescription() {
    // the meta can be undefined so return null
    const d = this.getDecorated("description")
    return is.undefined(d) ? null : d
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

  toString() {
    return this.meta.name
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
    const file = Drive.Files.get(id, {}, { allow404: true })
    return file ? newFakeDriveFile(file) : null
  }

  /**
   * get folder by Id
   * folders can get files
   * @param {string} id 
   * @returns {FakeDriveFolder|null}
   */
  getFolderById(id) {
    const file = Drive.Files.get(id, {}, { allow404: true })
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

  /**
   *  get files by type
   * @param {string} type 
   * @return {FakeDriveFileIterator}
   */
  getFilesByType(type) {
    return getFilesIterator({
      parentId: this.getId(),
      fileTypes: true,
      folderTypes: false,
      qob: [`mimeType='${type}'`]
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
    const rf = Drive.Files.get('root', {}, { allow404: true })
    // because the parent folder prop isnt returned we'll spoof it
    this.__rootFolder = newFakeDriveFolder(rf)
  }

  toString() {
    return 'Drive'
  }

  /**
   * get folder by Id
   * folders can get files
   * @returns {FakeDriveFolder}
   */
  getRootFolder() {
    return this.__rootFolder
  }

  getFileById(id) {
    return this.getRootFolder().getFileById(id)
  }

  getFolderById(id) {
    return this.getRootFolder().getFolderById(id)
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

  /**
   *  get files by type
   * @param {string} type 
   * @return {FakeDriveFileIterator}
   */
  getFilesByType(type) {
    return getFilesIterator({
      fileTypes: true,
      folderTypes: false,
      qob: [`mimeType='${type}'`]
    })
  }

}

/* driveapp
='toString',
'getFileByIdAndResourceKey',
'getFolderByIdAndResourceKey',
'continueFolderIterator',
'getTrashedFiles',
'continueFileIterator',
'getFolderById',
'getTrashedFolders',
'getRootFolder',
'getStorageUsed',
'enforceSingleParent',
'getStorageLimit',
'getFileById',
'createShortcutForTargetIdAndResourceKey',
'addFolder',
='getFilesByType',
'createFolder',
'searchFolders',
='getFiles',
'removeFile',
'getFoldersByName',
'searchFiles',
'removeFolder',
='getFolders',
'getFilesByName',
'createShortcut',
'addFile',
'createFile',
'Access',
'Permission'
*/

/* folder
 ='toString',
  'getEditors',
  'getViewers',
  'getOwner',
  'getSecurityUpdateEligible',
  'getSecurityUpdateEnabled',
  'setSecurityUpdateEnabled',
  'moveTo',
  'getAccess',
  ='getLastUpdated',
  ='getDateCreated',
  'getUrl',
  ='isTrashed',
  'getResourceKey',
  ='getParents',
  'setSharing',
  'getSharingAccess',
  'setStarred',
  ='isStarred',
  'getSharingPermission',
  'setTrashed',
  'setDescription',
  ='getDescription',
  ='getName',
  'setName',
  ='getId',
  ='getSize',
  'createShortcutForTargetIdAndResourceKey',
  'createFolder',
  ='getFilesByName',
  'searchFiles',
  'removeFolder',
  'addFolder',
  'searchFolders',
  ='getFilesByType',
  ='getFolders',
  'removeFile',
  'getFoldersByName',
  'createShortcut',
  'getFiles',
  'addFile',
  'createFile',
  'setShareableByEditors',
  'isShareableByEditors',
  'revokePermissions',
  'setOwner',
  'addViewers',
  'removeViewer',
  'removeEditor',
  'addViewer',
  'addEditor',
  'addEditors' ]
*/