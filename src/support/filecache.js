/**
 * things are pretty slow on node, especially repeatedly getting parents
 * so we'll cache that over here
 */
import {  is404, isGood, throwResponse } from './helpers.js'
import { Utils } from './utils.js'
const {assert, is} = Utils

const _performance = {
  hits: 0,
  misses: 0,
  fieldHits: 0,
  fieldMisses: 0
}
export const getDrivePerformance = () => _performance

const CACHE_ENABLED = true
const fileCache = new Map()

/**
 * create an object from a comma delimited field and set all values to null
 * @param {string} str 
 * @returns {object}
 */
const createModel = (str="") => {
  assert.string (str)
  if (!str.length) return {}
  const ob = Object.fromEntries(str.split(",").map(f=>[f,null]));
  return ob
}
/**
 * check response from sync is good, throw an error if requried, and remove anything we have from cache
 * @param {string} id 
 * @param {SyncApiResponse} response 
 * @returns {SyncApiResponse} response 
 */
export const checkResponse = (id, response, allow404) => {

  // sometimes a 404 will be allowed, sometimes not
  if (!isGood(response)) {

    // scratch for next time
    if (is.nonEmptyString(id)) setInFileCache(id, null)

    if (!allow404 && is404(response)) {
      throwResponse(response)
    } else {
      return null
    }
  } else if (!is.nonEmptyString(id)) {
    throw new Error ("id was not provided to cache sanitizer checkresponse")
  }
}

/**
 * get whatever we have in cache for a file
 * @param {string} id 
 * @returns {File|null} file metadata
 */
const _getFromCache = (id) => {
  if (CACHE_ENABLED) {
    const has = fileCache.has (id)
    if (has) {
      _performance.hits++
    } else {
      _performance.misses ++
    }
    return has ? fileCache.get (id) : null
  }
  return null
}

/**
 * add/replace any newly discovered fields to cache
 * if a field is not in cache and not in the file, then add them wih null
 * this is because he api sometimes returns missing fields instea dof null values
 * @param {string} id 
 * @param {string} fields comma sep list of the fields expected 
 * @returns {File|null} updated file metadata
 */
export const improveFileCache = (id, file, fields = "") => {

  if (CACHE_ENABLED && id) {

    const model = createModel(fields)
    const cachedFile = fileCache.get (id) || {}
    const improved = {...cachedFile, ...model,...file}
    file = setInFileCache (id, improved)
  }
  return file
}

/**
 *set value of a file in cache
 * @param {string} id 
 * @returns {File|null} updated file metadata
 */
export const setInFileCache = ( id, file) => {

  if (CACHE_ENABLED && id) {
    if (fileCache.has(id) && (is.null(file) || is.undefined(file)) ) {
      // a null file means delete it
      fileCache.delete(id)
      return null

    } else {
      // TODO - check if we can get away with leaving parents as null if it is here and avoid a loop of trying to complete the fields over and over
      // fake the parents if not given because that'll be the root
      //fileCache.set(id, {parents:[], ...file})
      fileCache.set (id, file)
      return fileCache.get (id)
    }
  }
  return file
}

/**
 * get value of file from cache, but only if
 * @param {string} id 
 * @param {string|[]} fields the fields to check
 * @returns {File|null} updated file metadata
 */
export const getFromFileCache = (id, fields = []) => {

  // get the thing from cache
  const cachedFile = _getFromCache(id)

  if (cachedFile) {
    // suppor both a array or a string as the list
    fields = is.string(fields) ? fields.split (",") : fields

    // if we already have all the fields needed
    if (fields.every(f => Reflect.has(cachedFile, f))) {
      _performance.fieldHits++
      return {
        cachedFile,
        good: true
      }
    }

    // we found the entry, but there were required fields missing 
    _performance.fieldMisses++
    return {
      cachedFile,
      good:false
    }
  } else {
    // didnt have an entry for this file at all
    return {
      cachedFile: null,
      good: false
    }
  }
}
