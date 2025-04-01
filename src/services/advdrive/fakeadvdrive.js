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
