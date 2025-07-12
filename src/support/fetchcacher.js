/**
 * keeps a separatecache for each doc
 * has multiple entries for each cached doc depending on the params selected
 */
const USE_CACHE = true
import { Proxies } from './proxies.js'

class FetchCacher {

  constructor(useCache = USE_CACHE) {
    this.__performance = {
      hits: 0,
      misses: 0,
      numberOfCaches: 0
    }
    this.__docsMap = new Map()
    this.__useCache = useCache

  }

  getPerformance = () => ({
    ...this.__performance,
    numberOfCaches: this.__docsMap.size,
    useCache: this.__useCache
  })

  get(id) {
    if (!this.__useCache) return null
    if (!this.__docsMap.has(id)) {
      this.__docsMap.set(id, new Map())
    }
    return this.__docsMap.get(id)
  }

  deleteEntry(id, params) {
    if (!this.__useCache) return null
    const cache = this.getFetchCacher(id)
    const key = this.digest(params)
    cache.delete(key)
    return null
  }

  clear(id) {
    if (!this.__useCache) return null
    this.__docsMap.delete(id)
    return null
  }

  setEntry(id, params, value) {
    if (!this.__useCache) return null
    const cache = this.get(id)
    const key = digest(params)
    cache.set(key, value)
    return value
  }

  getEntry(id, params) {
    if (!this.__useCache) return null
    const cache = this.get(id)
    const key = digest(params)
    if (cache.has(key)) {
      this.__performance.hits++
      return cache.get(key)
    } else {
      this.__performance.misses++
      return null
    }
  }

}

export const digest = (params) => {
  const str = JSON.stringify(params)
  return Utilities.base64Encode(Utilities.computeDigest('md5', str))
}


/**
 * create a new FetchCacher instance
 * @param  {...any} args
 * @returns {FetchCacher}
 */
export const newFetchCacher = (...args) => {
  return Proxies.guard(new FetchCacher(...args))
}