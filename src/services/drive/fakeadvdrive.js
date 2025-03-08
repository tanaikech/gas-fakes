/**
 * Advanced drive service
 */
import { Proxies } from '../../support/proxies.js'
import { notYetImplemented } from '../../support/constants.js'
import { getAuthedClient } from './drapis.js'
import { Syncit } from '../../support/syncit.js'
import { throwResponse, is404, isGood, minFields } from './drivehelpers.js'
import { getFromFileCache, setInFileCache } from '../../support/filecache.js';


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
    setInFileCache (id, null)
    
    if (!allow404 && is404 (response)) {
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
    return notYetImplemented
  }
  get Apps() {
    return notYetImplemented
  }
  get Changes() {
    return notYetImplemented
  }
  get Channels() {
    return notYetImplemented
  }
  get Comments() {
    return notYetImplemented
  }
  get Drives() {
    return notYetImplemented
  }
  get Operations() {
    return notYetImplemented
  }
  get Permissions() {
    return notYetImplemented
  }
  get Replies() {
    return notYetImplemented
  }
  get Revisions() {
    return notYetImplemented
  }
  get Teamdrives() {
    return notYetImplemented
  }

}

class FakeAdvDriveAbout {
  constructor(drive) {
    this.toString = drive.toString
  }

  // this is a schema and needs the fields parameter
  get() {
    return notYetImplemented
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
    return notYetImplemented
  }

  emptyTrash() {
    return notYetImplemented
  }

  update() {
    return notYetImplemented
  }

  list() {
    return notYetImplemented
  }
  remove() {
    return notYetImplemented
  }

  download() {
    return notYetImplemented
  }

  modifyLabels() {
    return notYetImplemented
  }

  watch() {
    return notYetImplemented
  }


  /**
   * get file by Id
   * @param {string} id 
   * @param {object} params Drive api params
   * @param {object} [fakeparams]
   * @param {boolean} [fakeparams.allow404=true] whether to allow 404 errors
   * @returns {Drive.File}
   */
  get(id, params = {}, {allow404= true} = {}) {
    
    // minimum fields can be replaced by params 
    const fields = params.fields || minFields

    // we'll only hit i in cache if the fields there at least match the required fields
    const cached = getFromFileCache (id, fields)
    if (cached) return cached

    // enhance the params
    params = {...params, fields, fileId: id}
    const {response, data: file} =  Syncit.fxDrive({ prop: this.apiProp, method: 'get', params })
    
    // maybe we need to throw an error
    checkResponse (id, response, allow404) 

    // finally register in cache for next time
    return setInFileCache (id, file)
  }

  create() {
    return notYetImplemented
  }

  generateIds() {
    return notYetImplemented
  }

  copy() {
    return notYetImplemented
  }

  export() {
    return notYetImplemented
  }

}

const newFakeAdvDriveFiles = (...args) => Proxies.guard(new FakeAdvDriveFiles(...args))
const newFakeAdvDriveAbout = (...args) => Proxies.guard(new FakeAdvDriveAbout(...args))
export const newFakeAdvDrive = (...args) => Proxies.guard(new FakeAdvDrive)



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
