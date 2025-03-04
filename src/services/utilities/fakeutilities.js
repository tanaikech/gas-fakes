import sleepSynchronously from 'sleep-synchronously';
import { Proxies } from '../../support/proxies.js'
import { newFakeBlob } from './fakeblob.js'
import { Utils } from '../../support/utils.js'
import { randomUUID } from 'node:crypto'

class FakeUtilities {
  constructor() {

  }
  /**
   * a blocking sleep to emulate Apps Script
   * @param {number} ms number of milliseconds to sleep
   */
  sleep(ms) {
    Utils.assert.number(ms, `Cannot convert ${ms} to int.`)
    sleepSynchronously(ms);
  }

  /*
  * @param {*} [data] data 
  * @param {string} [contentType]
  * @param {string} [name]
  * @returns {FakeBlob}
  */
  newBlob(data, contentType,name ) {
    return newFakeBlob (data, contentType, name)
  }
  /**
   * gets a uid
   * @returns {string}
   */
  getUuid() {
    return randomUUID()
  }
}

export const newFakeUtilities = ()=>Proxies.guard(new FakeUtilities())