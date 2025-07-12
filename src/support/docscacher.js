/**
 * avoid going to api if we already have it
 * anything other than a get should jusr delete the whiole map for the spreadsheet
 */
const USE_CACHE = true
import { is404, isGood, throwResponse } from './helpers.js'
import { newFetchCacher } from "./fetchcacher.js"
import { Utils } from './utils.js'
const { is } = Utils

export const docsCacher = newFetchCacher(USE_CACHE)

/**
 * check response from sync is good, throw an error if requried, and remove anything we have from cache
 * @param {string} id 
 * @param {SyncApiResponse} response 
 * @returns {SyncApiResponse} response 
 */
export const checkDocsResponse = (id, response, allow404) => {

  // sometimes a 404 will be allowed, sometimes not
  if (!isGood(response)) {

    // scratch for next time
    if (is.nonEmptyString(id)) docsCacher.clear(id)

    if (!allow404 && is404(response)) {
      throwResponse(response)
    } else {
      return null
    }
  } else if (!is.nonEmptyString(id)) {
    throw new Error("id was not provided to cache sanitizer checkresponse")
  }
  return response
}