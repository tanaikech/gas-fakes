// fake Apps Script UrlFetchApp

import { Auth } from '../../support/auth.js'
import { Syncit } from '../../support/syncit.js'
import { Proxies } from '../../support/proxies.js'
// Note that all async type functions have been converted to synch ro make it Apps Script like


/**
 * make got response look like UrlFetchApp response
 * @param {Response} reponse
 * @return {FakeHTTPResponse} UrlFetchApp flavor 
 */
const responsify = (response) => {

  // TODO test all these
  // getAllHeaders()	Object	Returns an attribute/value map of headers for the HTTP response, with headers that have multiple values returned as arrays.
  // need to identify the difference between this and getHeaders
  const getAllHeaders = () => response.rawHeaders

  // getResponseCode()	Integer	Get the HTTP status code (200 for OK, etc.) of an HTTP response
  const getResponseCode = () => response.statusCode

  // getContentText()	String	Gets the content of an HTTP response encoded as a string.

  const getContentText = () => response.body

  // getHeaders()	Object	Returns an attribute/value map of headers for the HTTP response.
  const getHeaders = () => response.headers

  /* TODO
  getAs(contentType)	Blob	Return the data inside this object as a blob converted to the specified content type.
  getBlob()	Blob	Return the data inside this object as a blob.
  getContent()	Byte[]	Gets the raw binary content of an HTTP response.
  getContentText(charset)	String	Returns the content of an HTTP response encoded as a string of the given charset.
  */
  return {
    getAllHeaders,
    getResponseCode,
    getContentText,
    getHeaders
  }
}

// this has been syncified
const fetch =  (url, options = {}) => {

  // check options for method and provide default
  options.method = options.method || "get"
  options = Auth.googify(options)

  const responseFields = [
    'rawHeaders',
    'statusCode',
    'body',
    'headers'
  ]

  const response = Syncit.fxFetch(url, options, responseFields)
  return responsify(response)
}


// This will eventually hold a proxy for DriveApp
let _app = null

/**
 * adds to global space to mimic Apps Script behavior
 */
const name = "UrlFetchApp"
if (typeof globalThis[name] === typeof undefined) {

  const getApp = () => {
    // if it hasne been intialized yet then do that
    if (!_app) {
      _app = {
        fetch
      }
    }
    // this is the actual driveApp we'll return from the proxy
    return _app
  }

  Proxies.registerProxy (name, getApp)

}


/** got reponse props
  [ '_events', 'object' ],
  [ '_readableState', 'object' ],
  [ '_writableState', 'object' ],
  [ 'allowHalfOpen', 'boolean' ],
  [ '_destroy', 'function' ],
  [ '_maxListeners', 'undefined' ],
  [ '_eventsCount', 'number' ],
  [ 'socket', 'object' ],
  [ 'httpVersionMajor', 'number' ],
  [ 'httpVersionMinor', 'number' ],
  [ 'httpVersion', 'string' ],
  [ 'complete', 'boolean' ],
  [ 'rawHeaders', 'object' ],
  [ 'rawTrailers', 'object' ],
  [ 'joinDuplicateHeaders', 'undefined' ],
  [ 'aborted', 'boolean' ],
  [ 'upgrade', 'boolean' ],
  [ 'url', 'string' ],
  [ 'method', 'object' ],
  [ 'statusCode', 'number' ],
  [ 'statusMessage', 'string' ],
  [ 'client', 'object' ],
  [ '_consuming', 'boolean' ],
  [ '_dumped', 'boolean' ],
  [ 'req', 'object' ],
  [ 'timings', 'object' ],
  [ 'headers', 'object' ],
  [ 'setTimeout', 'function' ],
  [ 'trailers', 'object' ],
  [ 'requestUrl', 'object' ],
  [ 'redirectUrls', 'object' ],
  [ 'request', 'object' ],
  [ 'isFromCache', 'boolean' ],
  [ 'ip', 'string' ],
  [ 'retryCount', 'number' ],
  [ 'ok', 'boolean' ],
  [ 'rawBody', 'object' ],
  [ 'body', 'string' ]
 */