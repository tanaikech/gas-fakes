
import { Proxies } from '../../support/proxies.js'
import { isGood, throwResponse } from '../../support/helpers.js'
import { Syncit } from '../../support/syncit.js'

/**
 * these apply to Drive.apps
 * note that this can't work with ADC yet as it's blocked - waiting for feedback from google on the issue
 */
class FakeAdvDriveApps {
  constructor(drive) {
    this.drive = drive
    this.name = 'Drive.Apps'
    this.apiProp = 'apps'
    this.__fakeObjectType ="Drive.Apps"
  }

  toString() {
    return this.drive.toString()
  }

  get(appId, params = {}) {
    // sincify that call
    params = { ...params, appId }
    const { response, data } = Syncit.fxDrive({ prop: this.apiProp, method: 'get', params })

    // maybe we need to throw an error
    if (!isGood(response)) {
      throwResponse(response)
    }

    return data
  }

  list(params) {
    // sincify that call
    const { response, data } = Syncit.fxDrive({ prop: this.apiProp, method: 'list', params })

    // maybe we need to throw an error
    if (!isGood(response)) {
      throwResponse(response)
    }
    return data
  }

}

export const newFakeAdvDriveApps = (...args) => Proxies.guard(new FakeAdvDriveApps(...args))