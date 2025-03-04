import { Proxies } from '../../support/proxies.js'
import { newFakeUtilities } from './fakeutilities.js';


// This will eventually hold a proxy for Utilities
let _app = null

/**
 * adds to global space to mimic Apps Script behavior
 */
const name = "Utilities"
if (typeof globalThis[name] === typeof undefined) {
  const getApp = () => {
    // if it hasnt been intialized yet then do that
    if (!_app) {
      console.log (`setting ${name} to global`)
      _app = newFakeUtilities()
    }
    // this is the actual driveApp we'll return from the proxy
    return _app
  }
  Proxies.registerProxy (name, getApp)
}
