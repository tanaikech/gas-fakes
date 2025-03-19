/**
 * Advanced drive service
 */
import { Proxies } from '../../support/proxies.js'
import { notYetImplemented } from '../../support/helpers.js'
import { getAuthedClient } from '../driveapp/drapis.js'
import { newFakeAdvDriveAbout } from './fakeadvdriveabout.js'
import { newFakeAdvDriveFiles } from './fakeadvdrivefiles.js';
import { newFakeAdvDriveApps } from './fakeadvdriveapps.js'
import { newFakeDrivePermissions } from './fakeadvdrivepermissions.js'

/**
 * the advanced Drive Apps Script service faked
 * @class FakeAdvDrive
 */

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
    return newFakeAdvDriveApps(this)
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
    return blanketProxy(
      "GoogleJsonResponseException: API call to drive.operations.list failed with error: Operation is not implemented, or supported, or enabled."
    )
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


// will always fail no matter which method is selected
const blanketProxy = (message) => Proxies.blanketProxy(() => {
  throw new Error(message)
})


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
