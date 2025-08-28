/**
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */
import got from 'got';


/**
 * fetch stomething 
 * @param {string} url  the url to fetch
 * @param {object} options any fetch options
 * @param {string[]} responseFields which fields to extract from the got response
 * @returns {object} an http type response
 */
export const sxFetch = async (Auth, url, options, responseFields) => {
  // we need special headers if we're calling google apis
  options = Auth.googify(options)

  const response = await got(url, {
    ...options
  })
  // we cant return the response from this as it cant be serialized
  // so we;ll extract oout the fields required
  return responseFields.reduce((p, c) => {
    p[c] = response[c]
    return p
  }, {})
}