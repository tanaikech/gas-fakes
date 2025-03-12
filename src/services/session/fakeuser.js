import { Proxies } from '../../support/proxies.js'

/**
 * returned by Session.getActiveUser,getEffectiveUser()
 * the only method documented nowadays is getEmail()
 * @class FakeUser
 */
class FakeUser {
  /**
   * @param {object} p tokeninfo
   * @param {string} p.email email
   * @returns {FakeUser}
   */
  constructor ({email,name,photoUrl,domain}) {
    this.__email = email
    this.__domain = domain
    this.__photoUrl = photoUrl
    this.__name = name
  }
  getEmail () {
    return this.__email
  }
  toString () {
    return this.getEmail()
  }
  getDomain() {
    return this.__domain
  }
  getPhotoUrl() {
    return this.__photoUrl
  }
  getName() {
    return this.__name
  }
}

/**
 * create a new FakeUser instance
 * @param  {...any} args 
 * @returns {FakeUser}
 */
export const newFakeUser = (...args) => {
  return Proxies.guard(new FakeUser(...args))
}