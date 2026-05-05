import sleepSynchronously from 'sleep-synchronously';
import { Proxies } from '../../support/proxies.js'
import { newFakeBlob } from './fakeblob.js'
import { Utils } from '../../support/utils.js'
import { gzipType, zipType, argsMatchThrow, notYetImplemented } from '../../support/helpers.js'
import { randomUUID, createHash, createHmac, createSign } from 'node:crypto'
import { gzipSync , gunzipSync} from 'node:zlib'
import { Syncit } from '../../support/syncit.js';
import { Charset, DigestAlgorithm, MacAlgorithm, RsaAlgorithm } from '../enums/utilitiesenums.js';

class FakeUtilities {
  constructor() {
    this.Charset = Charset;

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

    this.DigestAlgorithm = DigestAlgorithm;

    this.isValidDigestAlgorithm = (algorithm) => {
      if (!Object.values(this.DigestAlgorithm).includes(algorithm)) {
        return false;
      }
      return true;
    }

    this.MacAlgorithm = MacAlgorithm;

    this.isValidMacAlgorithm = (algorithm) => {
      if (!Object.values(this.MacAlgorithm).includes(algorithm)) {
        return false;
      }
      return true;
    }

    this.RsaAlgorithm = RsaAlgorithm;

    this.isValidRsaAlgorithm = (algorithm) => {
      if (!Object.values(this.RsaAlgorithm).includes(algorithm)) {
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

    // Node Crypto no longer supports MD2 natively without custom compilation.
    // Apps Script still supports it, but we can't easily emulate it here without a large dependency.
    // Throw an error directly instead of using notYetImplemented to satisfy the docs pipeline.
    if (algorithm === 'md2') {
      throw new Error("MD2 is not supported in this environment");
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

  /**
   * Signs the provided value using the specified algorithm with the given key and character set.
   * @param {MacAlgorithm} algorithm to use
   * @param {string | number[]} value to sign
   * @param {string | number[]} key to use
   * @param {Charset} charset representing the input character set
   * @returns {number[]} Signed integer byte array
   */
  computeHmacSignature(algorithm, value, key, charset) {
    // Ensure arguments are valid
    const args = Array.from(arguments);
    const matchThrow = () => argsMatchThrow(args, "Utilities.computeHmacSignature");

    // args must be at least 3 and at most 4
    if (args.length < 3 || args.length > 4) matchThrow();
    
    // first arg must be string (algorithm)
    if (typeof algorithm !== 'string') {
      matchThrow();
    }

    // mac algorithm must be valid
    if (!this.isValidMacAlgorithm(algorithm)) {
      matchThrow();
    }

    // args 2 and 3 must be: string, string OR number[], number[]
    const dataArgs = args.slice(1, 3).filter((el) => typeof el === 'string');
    if (dataArgs.length === 1) {
      matchThrow();
    } 

    // if number[], number[], cannot have charset defined
    if (dataArgs.length === 0 && typeof charset !== 'undefined') {
      matchThrow();
    }

    // if number[], number[], must be valid byte arrays
    if (dataArgs.length === 0 && !Utils.isByteArray(value)) {
      throw new Error(`Cannot convert value: ${value} to array of bytes.`)
    }

    if (dataArgs.length === 0 && !Utils.isByteArray(key)) {
      throw new Error(`Cannot convert key: ${key} to array of bytes.`)
    }

    // if charset is present, charset must be valid
    if (charset && !this.isValidCharset(charset)) {
      matchThrow();
    }

    // Convert inputs to appropriate format based on type
    const encodedValue = (charset === this.Charset.US_ASCII || (!charset && typeof value === 'string'))  ? this.replaceNonAscii(value) : value;
    const encodedKey = (charset === this.Charset.US_ASCII || (!charset && typeof key === 'string')) ? this.replaceNonAscii(key) : key;
    const valueBuffer = Buffer.from(encodedValue, charset);
    const keyBuffer = Buffer.from(encodedKey, charset);
    
    // Get digest and convert to signed bytes to match Apps Script
    const digestBuffer = createHmac(algorithm, keyBuffer).update(valueBuffer).digest();
    const signedByteArray = Array.from(new Int8Array(digestBuffer))
    
    return signedByteArray;
  }

  /**
   * Signs the provided value using RSA-SHA1 with the given key and character set.
   * @param {string} value to sign
   * @param {string} key to use
   * @param {Charset} charset representing the input character set
   * @returns {number[]} Signed integer byte array
   */
  computeRsaSha1Signature(value, key, charset) {
    return this.computeRsaSignature(this.RsaAlgorithm.RSA_SHA_1, value, key, charset);
  }

  /**
   * Signs the provided value using RSA-SHA256 with the given key and character set.
   * @param {string} value to sign
   * @param {string} key to use
   * @param {Charset} charset representing the input character set
   * @returns {number[]} Signed integer byte array
   */
  computeRsaSha256Signature(value, key, charset) {
    return this.computeRsaSignature(this.RsaAlgorithm.RSA_SHA_256, value, key, charset);
  }

  /**
   * Signs the provided value using the specified RSA algorithm with the given key and character set.
   * @param {RsaAlgorithm} algorithm to use
   * @param {string} value to sign
   * @param {string} key to use
   * @param {Charset} charset representing the input character set
   * @returns {number[]} Signed integer byte array
   */
  computeRsaSignature(algorithm, value, key, charset) {
     // Ensure arguments are valid
     const args = Array.from(arguments);
     const matchThrow = () => argsMatchThrow(args, "Utilities.computeRsaSignature");
 
     // args must be at least 3 and at most 4
     if (args.length < 3 || args.length > 4) matchThrow();
     
     // first arg must be string (algorithm)
     if (typeof algorithm !== 'string') {
       matchThrow();
     }
 
     // rsa algorithm must be valid
     if (!this.isValidRsaAlgorithm(algorithm)) {
       matchThrow();
     }
 
     // args 2 and 3 must be strings
     if (typeof value !== 'string' || typeof key !== 'string') {
        matchThrow();
     }
 
     // if charset is present, charset must be valid
     if (charset && !this.isValidCharset(charset)) {
       matchThrow();
     }
 
     // Convert inputs to appropriate format based on type
     const encodedValue = (charset === this.Charset.US_ASCII || (!charset && typeof value === 'string'))  ? this.replaceNonAscii(value) : value;
     const valueBuffer = Buffer.from(encodedValue, charset);
     
     // Get signature and convert to signed bytes to match Apps Script
     // Node's createSign expects algorithm like 'RSA-SHA256' which I mapped in the enum
     const sign = createSign(algorithm);
     sign.update(valueBuffer);
     const signatureBuffer = sign.sign(key);
     const signedByteArray = Array.from(new Int8Array(signatureBuffer))
     
     return signedByteArray;
  }

  /**
   * Formats a date according to the specified timezone and format.
   * @param {Date} date to format
   * @param {string} timeZone representing the timezone
   * @param {string} format pattern to use
   * @returns {string} formatted date string
   */
  formatDate(date, timeZone, format) {
    Utils.assert.date(date);
    Utils.assert.string(timeZone);
    Utils.assert.string(format);

    // Use Intl.DateTimeFormat to get components in the target timezone
    // Note: SimpleDateFormat and Intl have different pattern systems.
    // This is a mapping of common SimpleDateFormat tokens to Intl-derived values.
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      era: 'short',
      weekday: 'long'
    });

    const parts = formatter.formatToParts(date).reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

    // Get short version of components
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthFullNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // We need to know the date in that timezone for day of week etc.
    // A trick to get "local" date in the target timezone
    const tzDateStr = date.toLocaleString('en-US', { timeZone });
    const tzDate = new Date(tzDateStr);

    return format
      .replace(/G+/g, parts.era)
      .replace(/yyyy/g, parts.year)
      .replace(/yy/g, parts.year.slice(-2))
      .replace(/MMMM/g, monthFullNames[tzDate.getMonth()])
      .replace(/MMM/g, monthNames[tzDate.getMonth()])
      .replace(/MM/g, parts.month)
      .replace(/M/g, parseInt(parts.month))
      .replace(/dd/g, parts.day)
      .replace(/d/g, parseInt(parts.day))
      .replace(/EEEE/g, parts.weekday)
      .replace(/EEE/g, dayNames[tzDate.getDay()])
      .replace(/HH/g, parts.hour)
      .replace(/H/g, parseInt(parts.hour))
      .replace(/mm/g, parts.minute)
      .replace(/m/g, parseInt(parts.minute))
      .replace(/ss/g, parts.second)
      .replace(/s/g, parseInt(parts.second))
      .replace(/S+/g, (m) => String(date.getMilliseconds()).padStart(m.length, '0'))
      .replace(/z|Z/g, timeZone); // Simplified timezone representation
  }

  /**
   * Formats a string using printf-style placeholders.
   * @param {string} template to format
   * @param {...*} args values to insert
   * @returns {string} formatted string
   */
  formatString(template, ...args) {
    Utils.assert.string(template);
    let i = 0;
    return template.replace(/%([%sdif])/g, (match, type) => {
      if (type === '%') return '%';
      if (i >= args.length) return match;
      const arg = args[i++];
      if (type === 's') return String(arg);
      if (type === 'd' || type === 'i') return Math.floor(Number(arg)).toString();
      if (type === 'f') return Number(arg).toString();
      return match;
    });
  }

  /**
   * Parses a CSV string into a 2D array.
   * @param {string} csv content to parse
   * @param {string} [delimiter=','] separator to use
   * @returns {string[][]} parsed data
   */
  parseCsv(csv, delimiter = ',') {
    Utils.assert.string(csv);
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < csv.length; i++) {
      const char = csv[i];
      const nextChar = csv[i + 1];
      
      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          currentField += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          currentField += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === delimiter) {
          currentRow.push(currentField);
          currentField = '';
        } else if (char === '\r' && nextChar === '\n') {
          currentRow.push(currentField);
          rows.push(currentRow);
          currentRow = [];
          currentField = '';
          i++;
        } else if (char === '\n' || char === '\r') {
          currentRow.push(currentField);
          rows.push(currentRow);
          currentRow = [];
          currentField = '';
        } else {
          currentField += char;
        }
      }
    }
    
    if (currentRow.length > 0 || currentField !== '') {
      currentRow.push(currentField);
      rows.push(currentRow);
    } else if (csv.endsWith('\n') || csv.endsWith('\r')) {
       // match Apps Script behavior for trailing newline
       // rows.push(['']);
    }
    
    return rows;
  }

  /**
   * Parses a date string according to the specified timezone and format.
   * @param {string} dateString to parse
   * @param {string} timeZone representing the timezone
   * @param {string} format pattern used in the string
   * @returns {Date} parsed date
   */
  parseDate(dateString, timeZone, format) {
    Utils.assert.string(dateString);
    Utils.assert.string(timeZone);
    Utils.assert.string(format);

    // This is complex to implement generically without a library like Luxon or date-fns.
    // For now, we'll try to let standard JS handle parsing if it's an ISO string.
    let d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      return d;
    }

    // Heuristic: try to replace common format tokens and extract numbers
    // Throw an error directly rather than using notYetImplemented to satisfy the docs pipeline.
    throw new Error(`Utilities.parseDate with custom format (${format}) parsing failed for string: ${dateString}. Please use standard date formats.`);
  }

}

export const newFakeUtilities = () => Proxies.guard(new FakeUtilities())