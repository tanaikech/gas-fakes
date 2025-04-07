import { newFakeUser} from './fakeuser.js'
import { Auth } from '../../support/auth.js'
import { Proxies } from '../../support/proxies.js'

class FakeSession {
  constructor () { 
    this._activeUser = newFakeUser (Auth.getTokenInfo())
  }
  getActiveUser() {
    return this._activeUser
  }
  /**
   * there's no difference between active/effective on node
   * @returns {string}
   */
  getEffectiveUser() {
    return this.getActiveUser()
  }
  /**
   * @returns {string}
   */
  getActiveUserLocale() {
    const lang = process.env.LANG || ''
    // it'll be a format like en_US.UTF-8 so we need to drop the encoding to be like apps script
    return lang.replace(/\_.*/,'')
  }
  /**
   * this'll come from the manifest on Node (on Apps Script it'll be where the user is running from)
   * it's the same as the timezone
   * @returns {string}
   */
  getScriptTimeZone() {
    return Auth.getTimeZone()
  }
  /**
   * this'll be an encrypted user ID - same as the one used for property/cache stores identification
   * it's the same as the timezone
   * @returns {string}
   */
  getTemporaryActiveUserKey() {
    return Auth.getHashedUserId()
  }
}

export const newFakeSession = (...args) => Proxies.guard (new FakeSession(...args))