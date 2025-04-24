
import { Syncit } from '../../support/syncit.js'
import { checkResponse } from '../../support/filecache.js';
import { mergeParamStrings } from '../../support/utils.js';
import { notYetImplemented,  minPermissionFields } from '../../support/helpers.js'
import { Proxies } from '../../support/proxies.js'

class FakeAdvDrivePermissions {
  constructor(drive) {
    this.drive = drive
    this.apiProp = "permissions"
    this.__fakeObjectType ="Drive.Permissions"
  }
  create() {
    return notYetImplemented('create')
  }
  delete() {
    return notYetImplemented('delete')
  }
  get() {
    return notYetImplemented('get')
  }
  list(fileId, params = {}) {
    params = { ...params, fileId }
    params.fields = mergeParamStrings(params.fields || "", `permissions(${minPermissionFields})`)
    const { response, data } = Syncit.fxDrive({ prop: this.apiProp, method: 'list', params })
    // maybe we need to throw an error
    checkResponse(fileId, response, false)
    return data
  }
  update() {
    return notYetImplemented('update')
  }
}

export const newFakeDrivePermissions = (...args) => Proxies.guard(new FakeAdvDrivePermissions(...args))