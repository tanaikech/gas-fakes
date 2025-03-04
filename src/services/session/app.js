
/**
 * fake Apps Script Session
 * the idea here is to create a global entry for the singleton 
 * before we actually have everything we need to create it. 
 * We do this by using a proxy, intercepting calls to the 
 * initial sigleton and diverting them to a completed one
 */

import { Proxies } from '../../support/proxies.js'
import { newFakeSession } from './fakesession.js'

let _app = null

/**
 * adds to global space to mimic Apps Script behavior
 */
const name = "Session"
if (typeof globalThis[name] === typeof undefined) {

  const getApp = () => {
    // if it hasn't been intialized yet then do that
    if (!_app) {
      console.log(`setting ${name} to global`)
      _app = newFakeSession()
    }
    // this is the actual driveApp we'll return from the proxy
    return _app
  }

  Proxies.registerProxy(name, getApp)

}
