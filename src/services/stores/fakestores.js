import { Proxies } from '../../support/proxies.js'
import { Syncit } from '../../support/syncit.js'
import { Auth } from '../../support/auth.js'
import { Utils } from '../../support/utils.js'
import { storeModels } from './gasflex.js'
import { newCacheDropin } from '@mcpher/gas-flex-cache'
import { notYetImplemented } from '../../support/helpers.js'
const { is } = Utils

/**
 * caching support uses node files storage by default, but can also use upstash redis
 */

/**
 * default expiration of cache in seconds
 * @constant 
 * @type {number}
 */
const DEFAULT_CACHE_EXPIRY = 600
/**
 * maximum expiration time in secs
 * @constant 
 * @type {number}
 */
const MAXIMUM_CACHE_EXPIRY = 21600

/**
 * set expiry time to apps script ranges
 * Apps Script doesnt mind if the value provided is outside these ranges - it just silently applies them
 * @param {number} secs  
 * @returns {number}
 */
const normExpiry = (secs) => {
  if (typeof secs === typeof undefined || secs === null) secs = DEFAULT_CACHE_EXPIRY
  return Math.max(1, Math.min(MAXIMUM_CACHE_EXPIRY * 1000, secs * 1000))
}

/**
 * apps script often returns null instead of undefined
 * @param {*} value 
 * @returns {value|null}
 */
const fixun = (value) => typeof value === typeof undefined ? null : value

/**
 * types of store supported
 * @enum {string}
 */
const StoreType = Object.freeze({
  SCRIPT: 'SCRIPT',
  USER: 'USER',
  DOCUMENT: 'DOCUMENT'
})

/**
 * kinds of store service supported
 * @enum {string}
 */
export const ServiceKind = Object.freeze({
  PROPERTIES: 'property',
  CACHE: 'cache'
})

/**
 * check store type is valid
 * @param {StoreType} type 
 * @returns {StoreType}
 */
const checkStoreType = (type) => {
  if (!Reflect.has(StoreType, type)) {
    throw new Error(`invalid store type ${type}`)
  }
  return type
}

// this checks to see if we want to override a service with gas-flex-cache
const whichCache = () => {
  const type = (process.env.STORE_TYPE || "file").toLowerCase()
  if (!["file", "upstash"].includes(type)) {
    throw new Error(`invalid store type ${type} found in .env file`)
  }
  if (type === "upstash") {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    if (!is.nonEmptyString(token)) throw new Error('UPSTASH_REDIS_REST_TOKEN not found or invalid in .env file')
    if (!is.nonEmptyString(url)) throw new Error('upstash UPSTASH_REDIS_REST_URL not found or invalid in .env file')
    return {
      url,
      token,
      type: "upstash"
    }
  }
  return {
    type
  }
}
/**
 * check store kind is valid
 * @param {ServiceKind} kind  
 * @returns {ServiceKind}
 */
const checkServiceKind = (kind) => {
  if (!ServiceKind[kind]) {
    throw new Error(`invalid store kind ${kind}`)
  }
  return ServiceKind[kind]
}
/**
 * create a new FakeService instance
 * @param {ServiceKind} kind of service
 * @returns {FakePropertiesService || FakeCacheService}
 */
export const newFakeService = (kind) => {
  kind = checkServiceKind(kind)
  return Proxies.guard(kind === ServiceKind.CACHE ? new FakeCacheService() : new FakePropertiesService())
}

const selectCache = (cacheType, kind, defaultExpirationSeconds) => {
  // actually we might be overriding the type of service
  const which = whichCache()
  if (which.type === "upstash") {
    const model = storeModels[cacheType]
    if (!model) {
      throw new Error(`invalid store type model for ${cacheType}`) 
    }
    return newCacheDropin ({ creds: {
      ...model,
      ...which,
      kind,
      defaultExpirationSeconds
    }})
  } else if (which.type === "file") {
    return Proxies.guard(new FakeProperties(cacheType))
  } else {
    throw new Error(`invalid store type ${which.type} found in .env file`)
  }
}

/**
 * @class FakePropertiesService
 */
class FakePropertiesService {
  constructor() {
    this.kind = ServiceKind.PROPERTIES

  }
  getDocumentProperties() {
    // apps script needs a bound document to use this store
    if (!Auth.getDocumentId()) return null
    return selectCache(StoreType.DOCUMENT, this.kind)
  }
  getUserProperties() {
    return selectCache(StoreType.USER, this.kind)
  }
  getScriptProperties() {
     return selectCache(StoreType.SCRIPT, this.kind)
  }
}

/**
 * @class FakePropertiesService
 */
class FakeCacheService {
  constructor() {
    this.kind = ServiceKind.CACHE
  }
  getDocumentCache() {
    // apps script needs a bound document to use this store
    if (!Auth.getDocumentId()) return null
    return selectCache(StoreType.DOCUMENT, this.kind, DEFAULT_CACHE_EXPIRY)
  }
  getUserCache() {
    return selectCache(StoreType.USER, this.kind,DEFAULT_CACHE_EXPIRY)
  }
  getScriptCache() {
     return selectCache(StoreType.SCRIPT, this.kind, DEFAULT_CACHE_EXPIRY)
  }
}

/**
 * bas class for property and cache stores
 * @class FakeStore
 */
class FakeStore {
  /**
   * @constructor
   * @param {StoreType} type 
   */
  constructor(type) {
    checkStoreType(type)
    this._type = type
  }

  /**
   * @returns {StoreType}
   */
  get type() {
    return this._type
  }

  getFileName(kind) {

    const t = this.type.substring(0, 1).toLowerCase()
    const k = kind.substring(0, 1).toLowerCase()
    const scriptId = Auth.getScriptId()
    const documentId = Auth.getDocumentId()

    let fileName = `${k}${t}-${scriptId}`
    if (this.type === StoreType.USER) {
      fileName += `-${Auth.getHashedUserId()}`
    }
    else if (this.type === StoreType.DOCUMENT && documentId) {
      fileName += `-${documentId}`
    }

    return fileName
  }


}


/**
 * @class FakeProperties
 */
class FakeProperties extends FakeStore {
  /**
   * @constructor
   * @param {StoreType} type 
   */
  constructor(type) {
    super(type)
    this._storeArgs = {
      inMemory: false,
      fileName: this.getFileName(ServiceKind.PROPERTIES),
      storeDir: Auth.getPropertiesPath()
    }
  }


  deleteAllProperties() {
    return notYetImplemented('....try using gas-flex-cache store instead')
  }
  /**
   * delete the entry associated with the given key
   * @param {string} key 
   * @returns {FakeProperties} in Apps Script this is returned for chaining
   */
  deleteProperty(key) {
    Syncit.fxStore(this._storeArgs, "delete", key)
    return this
  }
  getKeys() {
    return notYetImplemented('....try using gas-flex-cache store instead')
  }
  getProperties() {
    return notYetImplemented('....try using gas-flex-cache store instead')
  }
  /**
   * get a value from prop store
   * @param {string} key 
   * @returns {string| null}
   */
  getProperty(key) {
    return fixun(Syncit.fxStore(this._storeArgs, "get", key))


  }
  setProperties(properties, deleteAllOthers) {
    return notYetImplemented('....try using gas-flex-cache store instead')
  }
  /**
   * set the entry associated with the given key
   * @param {string} key 
   * @param {string} value 
   * @returns {FakeProperties} in Apps Script this is returned for chaining
   */
  setProperty(key, value) {
    Syncit.fxStore(this._storeArgs, "set", key, value)
    return this
  }

}

class FakeCache extends FakeStore {
  constructor(type) {
    super(type)
    this._storeArgs = {
      inMemory: false,
      fileName: this.getFileName(ServiceKind.CACHE),
      storeDir: Auth.getCachePath()
    }
  }
  getAll(keys) {
    return notYetImplemented('....try using gas-flex-cache store instead')
  }

  /**
   * set the entry associated with the given key
   * @param {string} key 
   * @param {string} value 
   * @param {number} expirationInSeconds 
   * @returns null
   */
  put(key, value, expirationInSeconds) {
    Syncit.fxStore(this._storeArgs, "set", key, value, normExpiry(expirationInSeconds))
    return null
  }

  putAll(values, expirationInSeconds) {
    return notYetImplemented('....try using gas-flex-cache store instead')
  }

  /**
   * delete the entry associated with the given key
   * @param {string} key 
   * @returns {FakeCache} in Apps Script this is returned for chaining
   */
  remove(key) {
    Syncit.fxStore(this._storeArgs, "delete", key)
    return null
  }

  removeAll(keys) {
    return notYetImplemented('....try using gas-flex-cache store instead')
  }
  get(key) {
    return fixun(Syncit.fxStore(this._storeArgs, "get", key))
  }

}
