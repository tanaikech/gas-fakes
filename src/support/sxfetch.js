/**
 * all these functions run as subprocesses and wait fo completion
 * thus turning async operations into sync
 * note 
 * - since the subprocess starts afresh it has to reimport all dependecies
 * - there is nocontext inhertiance
 * - arguments and returns must be serializable ie. primitives or plain objects
 * 
 * TODO - this slows down debuggng significantly as it has to keep restarting the debugger
 * - need to research how to get over that
 */

/**
 * fetch stomething 
 * @param {string} url  the url to fetch
 * @param {object} options any fetch options
 * @param {string[]} responseFields which fields to extract from the got response
 * @returns {object} an http type response
 */
export const sxFetch = async (url, options, responseFields) => {
  const { default: got } = await import('got')
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