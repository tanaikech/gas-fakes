// fake Apps Script SpreadsheetApp
/**
 * the idea here is to create a global entry for the singleton 
 * before we actually have everything we need to create it. 
 * We do this by using a proxy, intercepting calls to the 
 * initial sigleton and diverting them to a completed one
 */
import { newFakeSpreadsheetApp} from './fakesheet.js'
import { Proxies } from '../../support/proxies.js'

// This will eventually hold a proxy for DriveApp
let _app = null

/**
 * adds to global space to mimic Apps Script behavior
 */
const name = "SpreadsheetApp"

if (typeof globalThis[name] === typeof undefined) {

  /**
   * @returns {FakeSpreadsheetApp}
   */
  const getApp = () => {
    // if it hasnt been intialized yet then do that
    if (!_app) {
       console.log (`setting ${name} to global`)
      _app = newFakeSpreadsheetApp()
    }
    // this is the actual driveApp we'll return from the proxy
    return _app
  }


  Proxies.registerProxy (name, getApp)

}
