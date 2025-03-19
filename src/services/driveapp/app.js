// fake Apps Script DriveApp
/**
 * the idea here is to create a global entry for the singleton 
 * before we actually have everything we need to create it. 
 * We do this by using a proxy, intercepting calls to the 
 * initial sigleton and diverting them to a completed one
 */
import { newFakeDriveApp} from './fakedrive.js'
import { Proxies } from '../../support/proxies.js'

// This will eventually hold a proxy for DriveApp
let _app = null

/**
 * adds to global space to mimic Apps Script behavior
 */
const name = "DriveApp"
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
