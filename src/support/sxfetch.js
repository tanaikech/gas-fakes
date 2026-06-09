import { sxRetry } from './sxretry.js';
import got from 'got';


/**
 * fix options as apps script is different
 * @param {object} options 
 * @returns {object} fixed options
 */
const fixOptions = (options) => {
  let fixedOptions = {}
  if (options) {
    fixedOptions = { ...options }

    // --- 1. Handle specific advanced parameters ---

    // 1.1. Timeout
    if (typeof fixedOptions.timeoutSeconds === 'number') {
      fixedOptions.timeout = { request: fixedOptions.timeoutSeconds * 1000 };
      delete fixedOptions.timeoutSeconds;
    }

    // 1.2. Redirects
    if (typeof fixedOptions.followRedirects === 'boolean') {
      fixedOptions.followRedirect = fixedOptions.followRedirects;
      delete fixedOptions.followRedirects;
    }

    // 1.3. HTTPS Certificate Validation
    if (typeof fixedOptions.validateHttpsCertificates === 'boolean') {
      fixedOptions.https = fixedOptions.https || {};
      fixedOptions.https.rejectUnauthorized = fixedOptions.validateHttpsCertificates;
      delete fixedOptions.validateHttpsCertificates;
    }

    // 1.4. Escaping (Note: got handles escaping natively, this is primarily for documentation/acceptance)
    if (typeof fixedOptions.escaping === 'boolean') {
      // If escaping is false, we assume the URL provided is already fully escaped/raw.
      // We accept the parameter but rely on got's default behavior unless we manually modify the URL, 
      // which is complex and usually unnecessary for standard fetch implementations.
      delete fixedOptions.escaping; 
    }

    // 1.5. Payload Handling (Blob or Byte Array)
    if (fixedOptions.payload) {
      const payload = fixedOptions.payload;
      
      // Check for Blob-like object (has getBytes and getContentType)
      if (typeof payload === 'object' && payload !== null && typeof payload.getBytes === 'function' && typeof payload.getContentType === 'function') {
        const bytes = payload.getBytes();
        fixedOptions.body = Buffer.from(bytes);
        
        // Set Content-Type if not already specified
        const contentType = payload.getContentType();
        if (!fixedOptions.headers || !fixedOptions.headers['Content-Type'] || fixedOptions.headers['Content-Type'] !== contentType) {
          fixedOptions.headers = fixedOptions.headers || {};
          fixedOptions.headers['Content-Type'] = contentType;
        }
        delete fixedOptions.payload;
        
      // Check for Byte Array (Array of numbers)
      } else if (Array.isArray(payload) && payload.every(item => typeof item === 'number')) {
        fixedOptions.body = Buffer.from(payload);
        delete fixedOptions.payload;
      }
    }


    // --- 2. Handle existing options (Content-Type, payload object, muteHttpExceptions) ---

    Object.keys(fixedOptions).forEach(k => {
      // Content-Type handling
      if (k.match(/Content-Type|contentType/i)) {
        fixedOptions.headers = fixedOptions.headers || {}
        fixedOptions.headers['Content-Type'] = fixedOptions[k]
        delete fixedOptions[k]
      }
      // Payload object handling (for application/x-www-form-urlencoded)
      if (k.match(/payload/i)) {
        fixedOptions.body = fixedOptions[k]
        delete fixedOptions[k]
      }
      // Mute HTTP Exceptions
      if (k.match(/muteHttpExceptions/i)) {
        fixedOptions.throwHttpErrors = !fixedOptions[k]
        delete fixedOptions[k]
      }
    })

    // Apps Script UrlFetchApp behavior: 
    // If the payload is an object and no content type is specified, 
    // it defaults to application/x-www-form-urlencoded.
    if (fixedOptions.body && typeof fixedOptions.body === 'object' && !fixedOptions.contentType) {
      // If it's a Buffer or Stream, we shouldn't convert it. 
      // But here we check for plain objects.
      if (!(fixedOptions.body instanceof Buffer)) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(fixedOptions.body)) {
          params.append(key, value);
        }
        fixedOptions.body = params.toString();
        fixedOptions.headers = fixedOptions.headers || {};
        fixedOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    }
  }
  return fixedOptions
}

/**
 * fetch stomething 
 * @param {string} url  the url to fetch
 * @param {object} options any fetch options
 * @param {string[]} responseFields which fields to extract from the got response
 * @returns {object} an http type response
 */
export const sxFetch = async (Auth, url, options, responseFields) => {

  const tag = `sxFetch for ${url}`;

  return sxRetry(Auth, tag, async () => {
    // we need special headers if we're calling google apis
    // notably, the token might be refreshed on retry, so googify must be inside
    const googOptions = Auth.googify(options)

    // Always fetch as a buffer to prevent corruption of binary data like images.
    // The caller (UrlFetchApp/HttpResponse) will be responsible for decoding to text if needed.
    const fixedOptions = fixOptions(googOptions)

    const response = await got(url, {
      ...fixedOptions,
      responseType: 'buffer'
    }).catch(err => {
      if (err.response) {
        const data = responseFields.reduce((p, c) => {
          p[c] = err.response[c]
          return p
        }, {})
        if (data.rawBody) data.rawBody = Array.from(data.rawBody);
        if (data.body && Buffer.isBuffer(data.body)) data.body = Array.from(data.body);
        err.data = data;
      }
      throw err;
    })

    // we cant return the response from this as it cant be serialized
    // so we;ll extract oout the fields required
    const result = responseFields.reduce((p, c) => {
      p[c] = response[c]
      return p
    }, {})

    // The rawBody is a Buffer. Convert it to a byte array for proper serialization across the worker boundary.
    if (result.rawBody) {
      result.rawBody = Array.from(result.rawBody);
    }
    // The body will also be a buffer
    if (result.body && Buffer.isBuffer(result.body)) {
      result.body = Array.from(result.body);
    }
    // we return what sxRetry expects: an object with data and response (or just the object if it's the result)
    // Actually sxRetry expects the result of the func to have .data and .response or it will use the result itself.
    // sxFetch returns the result fields directly in the GAS implementation.
    // Let's wrap it for sxRetry
    return { data: result, response };

  });
}

/**
 * fetch multiple things
 * @param {object} Auth 
 * @param {object[]} requests 
 * @param {string[]} responseFields 
 * @returns {object[]}
 */
export const sxFetchAll = async (Auth, requests, responseFields) => {
  return Promise.all(requests.map(r => {
    const isString = typeof r === 'string'
    const url = isString ? r : r.url
    const options = isString ? {} : { ...r }
    if (!isString) delete options.url
    return sxFetch(Auth, url, options, responseFields)
  }))
}
