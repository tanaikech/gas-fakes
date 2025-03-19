import { Proxies } from '../../support/proxies.js'
import { notYetImplemented } from '../../support/helpers.js'

class FakeAdvDriveAbout {
  constructor(drive) {
    this.toString = drive.toString
  }

  // this is a schema and needs the fields parameter
  get() {
    return notYetImplemented()
  }
}

export const newFakeAdvDriveAbout = (...args) => Proxies.guard(new FakeAdvDriveAbout(...args))