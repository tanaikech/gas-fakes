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
import { notYetImplemented } from '../../support/helpers.js'
import { getParentsIterator} from './fditerators.js';
import { getSharers } from './fdworkers.js';
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
   * the meta data for the following fields are not fetched by default
   */
  __getDecorated(prop) {
    return this.__decorateWithFields(prop).meta[prop]
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

  getUrl() {
    return this.__getDecorated("webViewLink")
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