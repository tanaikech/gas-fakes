/**
 * a File type returned from the json api with my default fields applied
 * there could be others if custom fields are returned
 * @typedef File
 * @property {string} id the id
 * @property {string} name the name
 * @property {string} mimeType the mimetype
 * @property {string[]} parents ids of parents
 */

import is from '@sindresorhus/is';
import { isFolder, notYetImplemented, argsMatchThrow, isFakeFolder } from '../../support/helpers.js'
import { getParentsIterator, getPermissionIterator } from './fakedriveiterators.js';
import { newFakeUser } from '../session/fakeuser.js';
import { improveFileCache } from "../../support/filecache.js"

/**
 * basic fake File meta data
 * these are shared between folders and files
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
    this.__gas_fake_service = "DriveApp"
  }

  /**
   * for enhancing the file with fields not retrieved by default
   * @param {string} fields='' the required fields
   * @return {FakeDriveMeta} self
   */
  __decorateWithFields(fields) {
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
   * this will return the type DriveApp.Folder or DriveApp.File
   * return {string}
   */
  __getFakeType() {
    return isFolder(this.meta) ? "DriveApp.Folder" : "DriveApp.File"
  }
  /**
   * the meta data for the following fields are not fetched by default
   */
  __getDecorated(prop) {
    return this.__decorateWithFields(prop).meta[prop]
  }

  /** 
   * __updateMeta - used to set simple felds using update
   * @param {string} prop the meta data to set
   * @param {*} value what to set it to
   * @param {string} type whhat type it should be
   * @param {object} args array like item with what was passed to the original function
   * @returns this self
   */
  __updateMeta(prop, value, type, ...args) {

    const matchThrow = () => argsMatchThrow(args)
    if (!is[type](value)) {
      matchThrow()
    }
    const file = {}
    file[prop] = value

    const data = Drive.Files.update(file, this.getId(), null, prop)
    this.meta = {...this.meta, ...data}
    improveFileCache (this.getId(), data)
    
    return this
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
    return this.__getDecorated("id")
  }

  /**
   * get the file name
   * @returns {string} the file name
   */
  getName() {
    return this.__getDecorated("name")
  }

  isStarred() {
    return this.__getDecorated("starred")
  }

  isTrashed() {
    return this.__getDecorated("trashed")
  }

  getLastUpdated() {
    return new Date(this.__getDecorated("modifiedTime"))
  }

  getDescription() {
    // the meta can be undefined so return null
    const d = this.__getDecorated("description")
    return is.undefined(d) ? null : d
  }

  getDateCreated() {
    return new Date(this.__getDecorated("createdTime"))
  }
  getSize() {
    // the meta is actually a string so convert
    const d = parseInt(this.__getDecorated("size"), 10)
    // folders dont return a size
    return isNaN(d) ? 0 : d
  }

  /**
   * get the ids of the parents
   * @returns {string[]} the file parents
   */
  getParents() {
    this.__decorateWithFields("parents")
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

  /**
   * get the file url
   * @returns {string} the webviewlink
   */
  getUrl() {
    return this.__getDecorated("webViewLink")
  }

  /**
   * moves a file to a mew destination
   * @param {FakeDriveFolder} destination
   * @returns self for chaining
   */
  moveTo(destination) {
    // prepare for any arg errors
    const matchThrow = () => argsMatchThrow(Array.from(arguments))
    if (!isFakeFolder(destination)) {
      matchThrow()
    }
    // pick up parents for destination if not already known
    const addParents = destination.__getDecorated("parents")

    // we cant just fix the resource parents, we have to add and remove
    // so that's a 2 step
    const removeParents = this.__getDecorated("parents")

    const data = Drive.Files.update({ addParents, removeParents }, this.getId())

    // merge this with already known fields and improve cache
    this.meta = { ...this.meta, ...data }
    improveFileCache(this.getId(), this.meta)
    return this

  }

  /**
   * @param {string} value the updated value
   * @returns {FakeDriveFile|FakeDriveFolder} this self
   */
  setDescription(value) {
    return this.__updateMeta("description", value, "string", arguments)
  }

  /**
   * @param {string} value the updated value
   * @returns {FakeDriveFile|FakeDriveFolder} this self
   */
  setName(value) {
    return this.__updateMeta("name", value, "string", arguments)
  }

  /**
   * Sets whether users with edit permissions to the Folder are allowed to share with other users or change the permissions. 
   * @param {boolean} value the updated value
   * @returns {FakeDriveFile|FakeDriveFolder} this self
   */
  setShareableByEditors(value) {
    return this.__updateMeta("writersCanShare", value, "boolean", arguments)
  }

  /**
   * Determines whether users with edit permissions to the Folder/File are allowed to share with other users or change the permissions
   * @returns {Boolean}
   */
  isShareableByEditors() {
    return this.__getDecorated("writersCanShare")
  }

  /**
   * Sets whether the Folder/File is starred in the user's Drive. 
   * @param {boolean} value the updated value
   * @returns {FakeDriveFile|FakeDriveFolder} this self
   */
  setStarred(value) {
    return this.__updateMeta("starred", value, "boolean", arguments)
  }

  /**
   * Whether the file has been trashed, either explicitly or from a trashed parent folder
   * @param {boolean} value the updated value
   * @returns {FakeDriveFile|FakeDriveFolder} this self
   */
  setTrashed(value) {
    return this.__updateMeta("trashed", value, "boolean", arguments)
  }

  // TODO-----------

  getSharingPermission() {
    return notYetImplemented('getSharingPermission')
  }


  getSharingAccess() {
    return notYetImplemented('getSharingAccess')
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


  revokePermissions() {
    return notYetImplemented('revokePermissions')
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