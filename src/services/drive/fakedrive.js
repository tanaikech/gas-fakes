import { Proxies } from '../../support/proxies.js'
import { newPeeker } from '../../support/peeker.js'
import { Utils } from '../../support/utils.js'
import is from '@sindresorhus/is';
import { folderType, minFields, isFolder, notYetImplemented, wontBeImplemented } from '../../support/helpers.js'
import { newFakeUser } from '../session/fakeuser.js';

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
 * get the file sharers
 * @returns {FakeUser} the file viewers
 */
const getSharers = (id, role) => {
  const pit = getPermissionIterator({ id })
  const viewers = []
  while (pit.hasNext()) {
    const permission = pit.next()
    if (permission.role === role && permission.type === "user") viewers.push(makeUserFromPermission(permission))
  }
  return viewers
}

const makeUserFromPermission = (permission) => {
  return newFakeUser({
    email: permission.emailAddress,
    photoUrl: permission.photoLink,
    name: permission.displayName,
    domain: permission.domain
  })
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

// we can get all the permissions - need iterate in case theres more than a page (unlikely)
const getPermissionIterator = ({
  id

}) => {
  const { assert } = Utils
  assert.string(id)

  /**
 * this generator will get chunks of matching permissions for a given file
 * and yield them 1 by 1 and handle paging if required
 */
  function* permissionsInk() {
    // the result tank
    let tank = []
    // the next page token
    let pageToken = null

    do {
      // if nothing in the tank, fill it upFdrive
      if (!tank.length) {
        const data = Drive.Permissions.list(id, { fields: "nextPageToken,permissions(emailAddress,photoLink,domain,displayName)" })
        const { permissions, nextPageToken } = data

        // the presence of a nextPageToken is the signal that there's more to come
        pageToken = nextPageToken

        // format the results into the folder or file object
        tank = permissions
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
  const fileit = permissionsInk()

  // a regular iterator doesnt support the same methods 
  // as Apps Script so we'll fake that too
  return newPeeker(fileit)
}
/**
 * shared get any kind of file meta data 
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

  // shared between folder and file
  toString() {
    return this.getName()
  }

  /**
   * get the file id
   * @returns {string} the file id
   */
  getId() {
    return this.getDecorated("id")
  }

  /**
   * get the file name
   * @returns {string} the file name
   */
  getName() {
    return this.getDecorated("name")
  }

  isStarred() {
    return this.getDecorated("starred")
  }

  isTrashed() {
    return this.getDecorated("trashed")
  }

  getLastUpdated() {
    return new Date(this.getDecorated("modifiedTime"))
  }

  getDescription() {
    // the meta can be undefined so return null
    const d = this.getDecorated("description")
    return is.undefined(d) ? null : d
  }

  getDateCreated() {
    return new Date(this.getDecorated("createdTime"))
  }
  getSize() {
    // the meta is actually a string so convert
    const d = parseInt(this.getDecorated("size"), 10)
    // folders dont return a size
    return isNaN(d) ? 0 : d
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
   * get the file owner
   * @returns {FakeUser} the file owner
   */
  getOwner() {
    const sharers = getSharers(this.getId(), 'owner')
    if (sharers.length !== 1) throw new Error('couldnt find single owner for ${this.getId()} ${this.getName()}')
    return sharers[0]
  }


  /**
   * get the file viewers
   * @returns {FakeUser} the file viewers
   */
  getViewers() {
    return getSharers(this.getId(), 'reader')
  }

  /**
   * get the file editors
   * @returns {FakeUser} the file editors
   */
  getEditors() {
    return getSharers(this.getId(), 'writer')
  }

  getUrl() {
    return this.getDecorated("webViewLink")
  }

  // TODO-----------

  setDescription() {
    return notYetImplemented('setDescription')
  }



  getSharingPermission() {
    return notYetImplemented('getSharingPermission')
  }
  setTrashed() {
    return notYetImplemented('setTrashed')
  }

  getSharingAccess() {
    return notYetImplemented('getSharingAccess')
  }

  setStarred() {
    return notYetImplemented('setStarred')
  }
  getResourceKey() {
    return notYetImplemented('getResourceKey')
  }

  setSharing() {
    return notYetImplemented('setSharing')
  }
  getSecurityUpdateEligible() {
    return notYetImplemented('getSecurityUpdateEligible')
  }
  getSecurityUpdateEnabled() {
    return notYetImplemented('getSecurityUpdateEnabled')
  }
  setSecurityUpdateEnabled() {
    return notYetImplemented('setSecurityUpdateEnabled')
  }
  getAccess() {
    return notYetImplemented('getAccess')
  }
  moveTo() {
    return notYetImplemented('moveTo')
  }

  setName() {
    return notYetImplemented('setName')
  }


  revokePermissions() {
    return notYetImplemented('revokePermissions')
  }
  isShareableByEditors() {
    return notYetImplemented('isShareableByEditors')
  }
  setShareableByEditors() {
    return notYetImplemented('setShareableByEditors')
  }
  setOwner() {
    return notYetImplemented('setOwner')
  }
  addViewers() {
    return notYetImplemented('addViewers')
  }
  addViewer() {
    return notYetImplemented('addViewer')
  }
  removeEditor() {
    return notYetImplemented('removeEditor')
  }
  addEditor() {
    return notYetImplemented('addEditor')
  }
  removeViewer() {
    return notYetImplemented('removeViewer')
  }
  addEditors() {
    return notYetImplemented('addEditors')
  }
}


/**
 * basic fake File
 * mainly shared between folder and file
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
   * get the file mimetype
   * @returns {string} the file mimetpe
   */
  getMimeType() {
    return this.getDecorated("mimeType")
  }
  /**
   * 
   * @returns {FakeBlob}
   */

  getBlob() {
    // spawn child process to syncify getting content as by array
    const { data } = Syncit.fxDriveMedia({ id: this.getId() })
    // and blobify
    return Utilities.newBlob(data, this.getMimeType(), this.getName())
  }

}

/**
 * methods shared between driveapp and folder
 * @class FakeDriveFile
 * @extends FakeDriveMeta
 * @returns {FakeDriveFile}
 */
class FakeFolderApp {

  // shared between folder and driveapp
  constructor() {

  }
  /**
   * get files in this folder
   * @return {FakeDriveFileIterator}
   */
  getFiles({ parentId, folderTypes }) {
    return getFilesIterator({
      parentId,
      folderTypes,
      fileTypes: !folderTypes
    })
  }

  /**
   * get folders/files by name
   * @param {string} name 
   * @return {FakeDriveFileIterator}
   */
  getFilesByName({ parentId, name, folderTypes }) {
    return getFilesIterator({
      parentId,
      fileTypes: !folderTypes,
      folderTypes,
      qob: [`name='${name}'`]
    })
  }

  /**
   *  get files by type
   * @param {string} type 
   * @return {FakeDriveFileIterator}
   */
  getFilesByType({ parentId, type, folderTypes }) {
    return getFilesIterator({
      parentId,
      fileTypes: !folderTypes,
      folderTypes,
      qob: [`mimeType='${type}'`]
    })

  }



  createShortcutForTargetIdAndResourceKey() {
    return notYetImplemented('createShortcutForTargetIdAndResourceKey')
  }

  searchFolders() {
    return notYetImplemented('searchFolders')
  }


  searchFiles() {
    return notYetImplemented('searchFiles')
  }


  removeFolder() {
    return notYetImplemented('removeFolder')
  }
  removeFile() {
    return notYetImplemented('removeFile')
  }
  addFolder() {
    return notYetImplemented('addFolder')
  }
  createShortcut() {
    return notYetImplemented('createShortcut')
  }
  createFolder() {
    return notYetImplemented('createFolder')
  }
  addFile() {
    return notYetImplemented('addFile')
  }
  createFile() {
    return notYetImplemented('createFile')
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
    // these are methods shared between driveapp and folder
    this.folderApp = Proxies.guard(new FakeFolderApp())
  }


  /**
   * get files in this folder
   * @return {FakeDriveFileIterator}
   */
  getFiles() {
    return this.folderApp.getFiles({ parentId: this.getId(), folderTypes: false })
  }

  /**
   * get folders in this folder
   * @return {FakeDriveFileIterator}
   */
  getFolders() {
    return this.folderApp.getFiles({ parentId: this.getId(), folderTypes: true })
  }

  /**
   * get folders by name
   * @param {string} name 
   * @return {FakeDriveFileIterator}
  */
  getFoldersByName(name) {
    return this.folderApp.getFilesByName({ parentId: this.getId(), folderTypes: true, name })
  }

  /**
   * get files by name
   * @param {string} name 
   * @return {FakeDriveFileIterator}
   */
  getFilesByName(name) {
    return this.folderApp.getFilesByName({ parentId: this.getId(), folderTypes: false, name })
  }

  /**
   * get files by name
   * @param {string} name 
   * @return {FakeDriveFileIterator}
   */
  getFilesByType(type) {
    return this.folderApp.getFilesByType({ parentId: this.getId(), folderTypes: false, type })
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
    this.folderApp = Proxies.guard(new FakeFolderApp())
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
  * get files in this folder
  * @return {FakeDriveFileIterator}
  */
  getFiles() {
    return this.folderApp.getFiles({ folderTypes: false })
  }

  /**
   * get folders in this folder
   * @return {FakeDriveFileIterator}
   */
  getFolders() {
    return this.folderApp.getFiles({ folderTypes: true })
  }

  /**
   * get folders by name
   * @param {string} name 
   * @return {FakeDriveFileIterator}
  */
  getFoldersByName(name) {
    return this.folderApp.getFilesByName({ folderTypes: true, name })
  }

  /**
   * get files by name
   * @param {string} name 
   * @return {FakeDriveFileIterator}
   */
  getFilesByName(name) {
    return this.folderApp.getFilesByName({ folderTypes: false, name })
  }

  /**
   * get files by name
   * @param {string} name 
   * @return {FakeDriveFileIterator}
   */
  getFilesByType(type) {
    return this.folderApp.getFilesByType({ folderTypes: false, type })
  }

  //-- TODO ---

  getFolderByIdAndResourceKey() {
    return notYetImplemented('getFolderByIdAndResourceKey')
  }
  getFileByIdAndResourceKey() {
    return notYetImplemented('getFileByIdAndResourceKey')
  }

  continueFileIterator() {
    return notYetImplemented('continueFileIterator')
  }
  continueFolderIterator() {
    return notYetImplemented('continueFolderIterator')
  }
  getTrashedFiles() {
    return notYetImplemented('getTrashedFiles')
  }
  getTrashedFolders() {
    return notYetImplemented('getTrashedFolders')
  }

  getStorageLimit() {
    return notYetImplemented('getStorageLimit')
  }
  getStorageUsed() {
    return notYetImplemented('getStorageUsed')
  }
  enforceSingleParent() {
    return notYetImplemented('enforceSingleParent')
  }
  get Access() {
    return notYetImplemented('Access')
  }
  get Permission() {
    return notYetImplemented('Permission')
  }

}