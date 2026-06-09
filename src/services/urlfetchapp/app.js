// fake Apps Script UrlFetchApp

import { Syncit } from '../../support/syncit.js'
import { Proxies } from '../../support/proxies.js'

/**
 * Helper function to fix and normalize HTTP headers.
 * @param {object} response - The raw response object.
 * @returns {object} Normalized headers object.
 */
const fixHeaders = (response) => {
  // it's a map with a pair of values
  const headers = (response.rawHeaders || [])
  if (headers.length % 2 !== 0) {
    throw `fixHeaders:invalid number of header value pairs - ${headers.length}`
  }
  // split into pairs and return as object
  const mapHeaders = new Map(headers.flatMap((_, i, a) => i % 2 ? [] : [a.slice(i, i + 2)]));
  return Object.fromEntries(mapHeaders)
}

/**
 * Helper function to convert raw response data into a FakeBlob.
 * Assumes Utilities.newBlob is available in the scope.
 * @param {object} response - The raw response object.
 * @param {object} headers - The normalized headers.
 * @returns {object} A FakeBlob representation.
 */
const blobify = (response, headers) => {
  if (!headers) return null
  // the name is buried in the Conent-Disposition
  const disp = headers["Content-Disposition"]
  const filename = disp && disp.replace(/.*filename="([^"]*).*/, "$1")
  const name = filename || ""
  const contentType = headers["Content-Type"]?.replace(/([^;]*).*/, "$1").trim()
  const bytes = response.rawBody || response.body || null
  // Assuming Utilities is available globally or imported elsewhere
  return Utilities.newBlob(bytes, contentType, name)
}


/**
 * Represents a fake HTTP response object, mimicking UrlFetchApp's response structure.
 */
export class FakeHTTPResponse {
  /**
   * @param {object} response - The raw response data from Syncit.
   */
  constructor(response) {
    this._response = response
    this._headers = null
  }

  /**
   * @returns {object} Attribute/value map of headers.
   */
  getAllHeaders() {
    if (!this._response) return {}
    if (!this._headers) {
      this._headers = fixHeaders(this._response)
    }
    return this._headers
  }

  /**
   * @returns {number} The HTTP status code.
   */
  getResponseCode() {
    if (!this._response) return 500
    return this._response.statusCode || this._response.status || 500
  }

  /**
   * @returns {string} The content of an HTTP response encoded as a string.
   */
  getContentText() {
    if (!this._response) return "UrlFetchApp: No response data available."
    const headers = this.getAllHeaders()
    const blob = blobify(this._response, headers)
    return blob ? blob.getDataAsString() : ""
  }

  /**
   * @returns {object} Attribute/value map of headers.
   */
  getHeaders() {
    return this.getAllHeaders()
  }

  /**
   * @returns {ArrayBuffer | Uint8Array} The raw binary content of an HTTP response.
   */
  getContent() {
    if (!this._response) return []
    return this._response.rawBody || this._response.body
  }

  /**
   * @returns {object} A FakeBlob representing the content.
   */
  getBlob() {
    if (!this._response) return null
    const headers = this.getAllHeaders()
    return blobify(this._response, headers)
  }
}

/**
 * Represents a fake UrlFetchApp service, mimicking the global Apps Script service.
 */
export class FakeUrlFetchApp {
  /**
   * @param {object} [options] - Configuration options (optional).
   */
  constructor(options = {}) {
    this.options = options
  }

  /**
   * Performs a GET request.
   * @param {string} url - The URL to fetch.
   * @param {object} [options] - Request options.
   * @returns {FakeHTTPResponse} The response object.
   */
  fetch(url, options = {}) {
    // check options for method and provide default
    options.method = options.method || "get"

    const responseFields = [
      'rawHeaders',
      'statusCode',
      'body',
      'headers',
      'rawBody'
    ]

    const { data } = Syncit.fxFetch(url, options, responseFields)
    return new FakeHTTPResponse(data)
  }

  /**
   * Performs multiple requests concurrently.
   * @param {Array<object>} requests - Array of request configurations.
   * @returns {Array<FakeHTTPResponse>} Array of response objects.
   */
  fetchAll(requests) {
    const responseFields = [
      'rawHeaders',
      'statusCode',
      'body',
      'headers',
      'rawBody'
    ]

    const responses = Syncit.fxFetchAll(requests, responseFields)
    return responses.map(({ data }) => new FakeHTTPResponse(data))
  }

  /**
   * Generates a standardized request object for UrlFetchApp.
   * @param {string} url - The target URL.
   * @param {object} [options] - Request options.
   * @returns {object} The standardized request object.
   */
  getRequest(url, options = {}) {
    const defaultMethod = 'get';
    const request = {
      url: url,
      method: (options.method || defaultMethod).toLowerCase(),
      headers: options.headers || {},
    };

    // Apps Script defaults
    if (options.contentType) {
      request.contentType = options.contentType;
    }

    if (options.payload !== undefined && options.payload !== null) {
      const payload = options.payload;

      // 1. Handle Blob payload
      if (typeof payload.getDataAsString === 'function') {
        request.payload = payload.getDataAsString();
      }
      // 2. Handle Byte[] array payload (Array of numbers)
      else if (Array.isArray(payload) && payload.every(item => typeof item === 'number')) {
        // Convert byte array to UTF-8 string
        request.payload = Buffer.from(payload).toString('utf8');
      }
      // 3. Handle plain JavaScript object payload
      else if (typeof payload === 'object' && !Buffer.isBuffer(payload)) {
        // Serialize object to form-encoded string
        const params = new URLSearchParams();
        for (const key in payload) {
          if (Object.prototype.hasOwnProperty.call(payload, key)) {
            params.append(key, payload[key]);
          }
        }
        request.payload = params.toString();
        
        // Set default content type for form data
        if (!request.contentType) {
          request.contentType = 'application/x-www-form-urlencoded';
        }
      }
      // Default case: pass payload directly (e.g., string, Buffer, etc.)
      else {
        request.payload = payload;
      }
    } else if (options.payload === null) {
      request.payload = null;
    }

    if (options.useIntranet !== undefined) {
      request.useIntranet = options.useIntranet;
    }

    // Add standard fetch behavior
    if (request.method === 'post' || request.method === 'put' || request.method === 'patch') {
      if (!request.contentType) {
        request.contentType = 'application/x-www-form-urlencoded';
      }
    }

    return request;
  }
}

/**
 * Helper function to create and return a new instance of FakeUrlFetchApp.
 * @returns {FakeUrlFetchApp}
 */
export const newFakeUrlFetchApp = () => new FakeUrlFetchApp();


// This will eventually hold a proxy for DriveApp
let _app = null

/**
 * Gets the singleton instance of FakeUrlFetchApp.
 * @returns {FakeUrlFetchApp}
 */
const getApp = () => {
  // if it hasn't been initialized yet then do that
  if (!_app) {
    _app = newFakeUrlFetchApp()
  }
  // return the actual driveApp we'll return from the proxy
  return _app
}

/**
 * Adds to global space to mimic Apps Script behavior
 */
const name = "UrlFetchApp"
if (typeof globalThis[name] === typeof undefined) {
  Proxies.registerProxy(name, getApp)
}
