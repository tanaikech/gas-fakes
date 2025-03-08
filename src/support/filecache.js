/**
 * things are pretty slow on node, especially repeatedly getting parents
 * so we'll cache that over here
 */

const _performance = {
  hits: 0,
  misses: 0,
  fieldHits: 0,
  fieldMisses: 0
}
export const getPerformance = () => _performance

const CACHE_ENABLED = true
const fileCache = new Map()
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
export const setInFileCache = (id, file) => {
  if (CACHE_ENABLED) {
    if (fileCache.has(id) && file === null || typeof file === typeof undefined) {
      fileCache.delete(id)
    } else {
      fileCache.set(id, file)
    }
  }
  return file
}

export const getFromFileCache = (id, fields = '') => {
  fields = fields.split (",")
  const cachedFile = _getFromCache(id)
  if (cachedFile && (!fields || fields.every(f => Reflect.has(cachedFile, f)))) {
    _performance.fieldHits++
    return cachedFile
  } else {
    if (cachedFile) _performance.fieldMisses++
    return null
  }
}
