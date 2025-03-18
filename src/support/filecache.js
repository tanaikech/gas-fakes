/**
 * things are pretty slow on node, especially repeatedly getting parents
 * so we'll cache that over here
 */
import {  is404, isGood, throwResponse } from './helpers.js'
import is from '@sindresorhus/is';
const _performance = {
  hits: 0,
  misses: 0,
  fieldHits: 0,
  fieldMisses: 0
}
export const getPerformance = () => _performance

const CACHE_ENABLED = true
const fileCache = new Map()

/**
 * check response from sync is good and throw an error if requried 
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

export const improveFileCache = (id, file) => {

  if (CACHE_ENABLED && id) {
    const cachedFile = fileCache.get (id) || {}
    const improved = {...cachedFile, ...file}
    file = setInFileCache (id, improved)
  }
  return file
}

export const setInFileCache = ( id, file) => {

  if (CACHE_ENABLED && id) {
    if (fileCache.has(id) && file === null || typeof file === typeof undefined) {
      fileCache.delete(id)
    } else {
      // fake the parents if not given because that'll be the root
      fileCache.set(id, {parents:[], ...file})
    }
  }
  return file
}

export const getFromFileCache = (id, fields = []) => {

  // get the thing from cache
  const cachedFile = _getFromCache(id)

  if (cachedFile) {
    // if we already have all the fields needed
    if (fields.every(f => Reflect.has(cachedFile, f))) {
      _performance.fieldHits++
      return {
        cachedFile,
        good: true
      }
    }
    _performance.fieldMisses++
    return {
      cachedFile,
      good:false
    }
  }
  // missed or didnt have enough fields
  return {
    cachedFile,
    good: false
  }


}
