/**
 * things are pretty slow on node, especially repeatedly getting parents
 * so we'll cache that over here
 */
import { Utils } from './utils.js'
const CACHE_ENABLED = true
const fileCache = new Map()
const _getFromCache = (id) => {
  if (CACHE_ENABLED) {
    const file = fileCache.get(id)
    if (file) return file
  }
  return null
}
export const setInFileCache = (id, file) => {
  if (CACHE_ENABLED) {
    fileCache.set(id, file)
  }
  return file
}

export const getFromFileCache = (id, fields) => {
  const cachedFile = _getFromCache(id) 
  if (cachedFile && (!fields || Utils.arrify(fields).every(f => Reflect.has(cachedFile, f)))) {
    return cachedFile
  } else {
    return null
  }
}
