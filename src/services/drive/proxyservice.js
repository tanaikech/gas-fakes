import { getAuthedClient } from './drapis.js'
import { Proxies } from '../../support/proxies.js'

/**
 * when we access Drive.... we need to redirect to an authed api client
 * however any functions that are accessed need to be translated to a sync proxy
 */

/**
 * diverts the property get to another object returned by the getApp function
 * @param {function} a function to get the proxy object to substitutes
 * @returns {function} a handler for a proxy
 */
const getAppHandler = (getApp, name) => {
  return {
    // these are readonly, so we don't need a set
    get(_, prop) {
      // this will let the caller know we're not really running in Apps Script 
      return (prop === 'isFake') ? true : Reflect.get(getApp(), prop);
    },

    ownKeys(_) {
      return Reflect.ownKeys(getApp())
    }
  }
}
const _app = null


/**
 * adds to global space to mimic Apps Script behavior
 */
const name = "TD"
if (typeof globalThis[name] === typeof undefined) {

  const getApp = () => {
    // if it hasne been intialized yet then do that
    if (!_app) {
      _app = newFakeDriveApp()
    }
    // this is the actual driveApp we'll return from the proxy
    return _app
  }

  Proxies.registerProxy (name, getApp)

}


