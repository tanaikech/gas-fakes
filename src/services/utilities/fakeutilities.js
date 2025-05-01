import sleepSynchronously from 'sleep-synchronously';
import { Proxies } from '../../support/proxies.js'
import { newFakeBlob } from './fakeblob.js'
import { Utils } from '../../support/utils.js'
import { gzipType, zipType, argsMatchThrow, notYetImplemented } from '../../support/helpers.js'
import { randomUUID, createHash, createHmac } from 'node:crypto'
import { gzipSync , gunzipSync} from 'node:zlib'
import { Syncit } from '../../support/syncit.js';

class FakeUtilities {
  constructor() {
    this.Charset = Object.freeze({
      UTF_8: 'utf-8',
      US_ASCII: 'ascii'
    });

    this.isValidCharset = (charset) => {
      if (!Object.values(this.Charset).includes(charset)) {
        return false;
      }
      return true;
    }

    /**
     * Returns a new string, replacing non-ASCII characters
     * with the '?' character (ASCII code 63), similar to Apps Script behavior.
     * 
     * @param {string} text - The text to convert
     * @returns {string} - ASCII encoded string with replacements
     */
    this.replaceNonAscii = (text) => {
      const newChars = Array.from(text).map(char => {
        const code = char.charCodeAt(0);
        return code <= 127 ? code : 63; // 63 is '?' (replacement character)
      });
      return Buffer.from(newChars).toString();
    }

    this.DigestAlgorithm = Object.freeze({
      MD2: 'md2',
      MD5: 'md5',
      SHA_1: 'sha1',
      SHA_256: 'sha256',
      SHA_384: 'sha384',
      SHA_512: 'sha512'
    })

    this.isValidDigestAlgorithm = (algorithm) => {
      if (!Object.values(this.DigestAlgorithm).includes(algorithm)) {
        return false;
      }
      return true;
    }

    

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
    const unzipped = Syncit.fxUnzipper ({blob})
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

  /**
   * Compute a digest using the specified algorithm on the specified value with the (optional) character set. 
   * @param {DigestAlgorithm} algorithm to use
   * @param {string | number[]} value to use
   * @param {Charset} charset representing the input character set
   * @returns {number[]} Signed integer byte array
   */
  computeDigest(algorithm, value, charset) {
    // Ensure arguments are valid
    const args = Array.from(arguments);
    const matchThrow = () => argsMatchThrow(args, "Utilities.computeDigest");

    // args must be at least 2 and at most 3
    if (args.length < 2 || args.length > 3) matchThrow();
    
    // first arg must be string
    if (typeof algorithm !== 'string') {
      matchThrow();
    }

    // if second arg is not a string, cannot have charset defined
    if (typeof value !== 'string'  && typeof charset !== 'undefined') {
      matchThrow();
    }

    // if second arg is not a string, it must be an array of bytes
    if (typeof value !== 'string' && !Utils.isByteArray(value)) {
      throw new Error(`Cannot convert value: ${value} to array of bytes.`)
    }

    // digest algorithm must be valid
    if (!this.isValidDigestAlgorithm(algorithm)) {
      matchThrow();
    }

    // if charset is present, charset must be valid
    if (charset && !this.isValidCharset(charset)) {
      matchThrow();
    }

    // Node Crypto no longer supports MD2
    if (algorithm === 'md2') {
      return notYetImplemented();
    }

    // Convert inputs to appropriate format based on type
    // if charset is explicitly set to US_ASCII
    // or if charset is not set and the value and key are strings (i.e. not bytes)
    // then replace any non-ASCII characters
    // Create buffer out of encoded value to work with update() method in crypto
    const encodedValue = (charset === this.Charset.US_ASCII || (!charset && typeof value === 'string'))  ? this.replaceNonAscii(value) : value;
    const valueBuffer = Buffer.from(encodedValue, charset);

    // Get digest and convert to signed bytes to match Apps Script
    const digestBuffer = createHash(algorithm).update(valueBuffer).digest() 
    const signedByteArray = Array.from(new Int8Array(digestBuffer))
    
    return signedByteArray;
  }

  /**
   * Signs the provided value using HMAC-SHA256 with the given key and character set.
   * @param {string | number[]} value to sign
   * @param {string | number[]} key to use
   * @param {Charset} charset representing the input character set
   * @returns {number[]} Signed integer byte array
   */
  computeHmacSha256Signature(value, key, charset) {
    // Ensure arguments are valid
    const args = Array.from(arguments);
    const matchThrow = () => argsMatchThrow(args, "Utilities.computeHmacSha256Signature");

    // args must be at least 2 and at most 3
    if (args.length < 2 || args.length > 3) matchThrow();
    
    // args must be: string, string OR number[], number[]
    const stringArgs = args.slice(0, 2).filter((el) => typeof el === 'string');
    if (stringArgs.length === 1) {
      matchThrow();
    } 

    // if number[], number[], cannot have charset defined
    if (stringArgs.length === 0 && typeof charset !== 'undefined') {
      matchThrow();
    }

    // if number[], number[], must be valid byte arrays
    if (stringArgs.length === 0 && !Utils.isByteArray(value)) {
      throw new Error(`Cannot convert value: ${value} to array of bytes.`)
    }

    if (stringArgs.length === 0 && !Utils.isByteArray(key)) {
      throw new Error(`Cannot convert key: ${key} to array of bytes.`)
    }

    // if charset is present, charset must be valid
    if (charset && !this.isValidCharset(charset)) {
      matchThrow();
    }


    // Convert inputs to appropriate format based on type
    // if charset is explicitly set to US_ASCII
    // or if charset is not set and the value and key are strings (i.e. not bytes)
    // then replace any non-ASCII characters
    const encodedValue = (charset === this.Charset.US_ASCII || (!charset && typeof value === 'string'))  ? this.replaceNonAscii(value) : value;
    const encodedKey = (charset === this.Charset.US_ASCII || (!charset && typeof key === 'string')) ? this.replaceNonAscii(key) : key;
    const valueBuffer = Buffer.from(encodedValue, charset);
    const keyBuffer = Buffer.from(encodedKey, charset);
    
    // Get digest and convert to signed bytes to match Apps Script
    const digestBuffer = createHmac('sha256', keyBuffer).update(valueBuffer).digest();
    const signedByteArray = Array.from(new Int8Array(digestBuffer))
    
    return signedByteArray;
  }

}

export const newFakeUtilities = () => Proxies.guard(new FakeUtilities())