import sleepSynchronously from 'sleep-synchronously';
import { Proxies } from '../../support/proxies.js'
import { newFakeBlob } from './fakeblob.js'
import { Utils } from '../../support/utils.js'
import { gzipType, zipType } from '../../support/general.js'
import { randomUUID } from 'node:crypto'
import { gzipSync , gunzipSync} from 'node:zlib'
import { Syncit } from '../../support/syncit.js';

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
  newBlob(data, contentType, name) {
    return newFakeBlob(data, contentType, name)
  }
  /**
   * gets a uid
   * @returns {string}
   */
  getUuid() {
    return randomUUID()
  }
  /**
   * gzip-compresses the provided Blob data and returns it in a new Blob object.
   * @param {FakeBlob} blob 
   * @param {string} [name]
   * @returns {FakeBlob}
   */
  gzip(blob, name) {
    // can set the name if required
    const buffer = Buffer.from (blob.getBytes())
    return this.newBlob (gzipSync(buffer), gzipType, (name || blob.getName() || 'archive.gz'))
  }
  /**
   * Creates a new Blob object that is a zip file containing the data from the Blobs passed in.
   * @param {FakeBlob[]} blobs
   * @param {string} [name=archive.zip]
   * @returns {FakeBlob}
   */
  zip(blobs, name = "archive.zip") {
    // decided to use 'archiver' rather than zlib for this as the objective may be to create a file containing multiple files
    // zlib only supports singe files
    const zipped = Syncit.fxZipper ({blobs})
    return newFakeBlob (zipped, zipType , name)
  }

  /**
   * Takes a Blob representing a zip file and returns its component blobs.
   * @param {FakeBlob} blob 
   * @param {string} [name]
   * @returns {FakeBlob[]}
   */
  unzip (blob) {
    const unzipped = Syncit.fxUnZipper ({blob})
    // the content type is lost in a zipped file, same as Apps Script behavior - which seems to be to use the extension to reassert content type
    return unzipped.map (f=> newFakeBlob (f.bytes, null, f.name)).map(f=>f.setContentTypeFromExtension())
  }

  /**
   * Uncompresses a Blob object and returns a Blob containing the uncompressed data.
   * @param {FakeBlob} blob 
   * @returns {FakeBlob}
  */
  ungzip(blob) {
    const buffer = Buffer.from (blob.getBytes())
    const name = blob.getName()
    const newName =  name ? name.replace(/\.gz$/,"") : null
    return this.newBlob (gunzipSync(buffer), null, newName)
  }

  base64Encode (data, charset) {
    return Buffer.from(Utils.settleAsBytes(data,charset)).toString('base64')
  }

  base64EncodeWebSafe (data, charset) {
    return Buffer.from(Utils.settleAsBytes(data,charset)).toString('base64url')
  }

  base64Decode (b64) {
    return Utils.settleAsBytes (Buffer.from (b64, 'base64')) 
  }

  base64DecodeWebSafe (b64) {
    return Utils.settleAsBytes (Buffer.from (b64, 'base64url')) 
  }

}

export const newFakeUtilities = () => Proxies.guard(new FakeUtilities())