import { Proxies } from '../../support/proxies.js'
import { Syncit } from '../../support/syncit.js'
import { Auth } from '../../support/auth.js'

/**
 * caching support uses node files storage
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
  PROPERTIES: 'PROPERTIES',
  CACHE: 'CACHE'
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


/**
 * check store kind is valid
 * @param {ServiceKind} kind  
 * @returns {ServiceKind}
 */
const checkServiceKind = (kind) => {
  if (!ServiceKind[kind]) {
    throw new Error(`invalid store kind ${kind}`)
  }
  return kind
}
/**
 * create a new FakeService instance
 * @param {ServiceKind} kind of service
 * @returns {FakePropertiesService || FakeCacheService}
 */
export const newFakeService = (kind) => {
  checkServiceKind(kind)
  return Proxies.guard(kind === ServiceKind.CACHE ? new FakeCacheService() : new FakePropertiesService())
}


/**
 * @class FakePropertiesService
 */
class FakePropertiesService {
  constructor() {
    this.kind = StoreType.PROPERTIES

  }
  getDocumentProperties() {
    // apps script needs a bound document to use this store
    if (!Auth.getDocumentId()) return null
    return Proxies.guard(new FakeProperties(StoreType.DOCUMENT))
  }
  getUserProperties() {
    return Proxies.guard(new FakeProperties(StoreType.USER))
  }
  getScriptProperties() {
    return Proxies.guard(new FakeProperties(StoreType.SCRIPT))
  }
}

/**
 * @class FakePropertiesService
 */
class FakeCacheService {
  constructor() {
    this.kind = StoreType.CACHE
  }
  getDocumentCache() {
    // apps script needs a bound document to use this store
    if (!Auth.getDocumentId()) return null
    return Proxies.guard(new FakeCache(StoreType.DOCUMENT))
  }
  getUserCache() {
    return Proxies.guard(new FakeCache(StoreType.USER))
  }
  getScriptCache() {
    return Proxies.guard(new FakeCache(StoreType.SCRIPT))
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

    let fileName = `${k}-${t}-${scriptId}`
    if (this.type === StoreType.USER) {
      fileName += `-${Auth.getUserId()}`
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
    this._storeArgs =  {
      inMemory: false,
      fileName: this.getFileName (ServiceKind.PROPERTIES),
      storeDir:  Auth.getPropertiesPath()
    }
  }


  deleteAllProperties() {

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

  }
  getProperties() {

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
    this._storeArgs =  {
      inMemory: false,
      fileName: this.getFileName (ServiceKind.CACHE),
      storeDir:  Auth.getCachePath()
    }
  }
  getAll(keys) {

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

  }
  get(key) {
    return fixun(Syncit.fxStore(this._storeArgs, "get", key))
  }

}


