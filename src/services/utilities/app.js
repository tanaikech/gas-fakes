import sleepSynchronously from 'sleep-synchronously';
import { Utils } from '../../support/utils.js'
import { Proxies } from '../../support/proxies.js'
import { newBlob } from './fakeblob.js'
/**
 * a blocking sleep to emulate Apps Script
 * @param {number} ms number of milliseconds to sleep
 */
const sleep = (ms) => {
  sleepSynchronously(Utils.assertType (ms, 'number',`Cannot convert ${ms} to int.`));
}


// This will eventually hold a proxy for DriveApp
let _app = null

/**
 * adds to global space to mimic Apps Script behavior
 */
const name = "Utilities"
if (typeof globalThis[name] === typeof undefined) {

  const getApp = () => {
    // if it hasne been intialized yet then do that
    if (!_app) {
      _app = {
        sleep,
        newBlob
      }
    }
    // this is the actual driveApp we'll return from the proxy
    return _app
  }

  Proxies.registerProxy (name, getApp)

}
