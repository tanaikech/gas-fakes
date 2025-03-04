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
  constructor ({email}) {
    this.__email = email
  }
  getEmail () {
    return this.__email
  }
  toString () {
    return this.getEmail()
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