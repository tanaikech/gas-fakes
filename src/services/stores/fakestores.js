import { Proxies } from '../../support/proxies.js'
import { Syncit } from '../../support/syncit.js'
import { Auth } from '../../support/auth.js'
import { deflateSync } from 'zlib'
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
  return Math.max(1, Math.min (MAXIMUM_CACHE_EXPIRY * 1000, secs * 1000))
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
 * fix up for partialfunction names
 * @param {string} name 
 * @returns {string} eg ABC -> Abc
 */
const lc = (name) => name.substring(0,1).toUpperCase() + name.substring(1).toLowerCase() 

/**
 * @class FakePropertiesService
 */
class FakePropertiesService {
  constructor() {
    this.kind = StoreType.PROPERTIES
    Reflect.ownKeys(StoreType)
      .forEach(type => this[`get${lc(StoreType[type])}Properties`] = () => Proxies.guard(new FakeProperties(type)))
  }
}

/**
 * @class FakePropertiesService
 */
class FakeCacheService {
  constructor() {
    this.kind = StoreType.PROPERTIES
    Reflect.ownKeys(StoreType)
      .forEach(type => this[`get${lc(StoreType[type])}Cache`] = () => Proxies.guard(new FakeCache(type)))
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

    // storeDir = .kind
    // filename = .u-scriptId-userId or .s-scriptId or .d-scriptId-documentId
    // tmpdir = somewhere local
    // namespace is not used as we'll split all into separate files
    const prefix = `.${type.substring(0,1).toLowerCase()}-`

    let subId = ""
    if (type !== "SCRIPT") {
      subId +=  "-" + (type === "USER" ? Auth.getUserId() : Auth.getDocumentId ())
    }
    this.storeArgs = {
      inMemory: false,
      fileName: `${prefix}${Auth.getScriptId()}${subId}`,
      tmpDir: './.gas-fakes/store'
    }
  }
  /**
   * @returns {StoreType}
   */
  get type() {
    return this._type
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
  constructor (type) {
    super(type)
    // these are use to construct the cahce file name
    this.storeArgs = {
      ...this.storeArgs,
      storeDir: 'props'
    }
  }

  deleteAllProperties () {

  }
  /**
   * delete the entry associated with the given key
   * @param {string} key 
   * @returns {FakeProperties} in Apps Script this is returned for chaining
   */
  deleteProperty (key) {
    Syncit.fxStore (this.storeArgs, "delete", key)
    return this
  }
  getKeys () {

  }
  getProperties () {

  }
  /**
   * get a value from prop store
   * @param {string} key 
   * @returns {string| null}
   */
  getProperty (key) {
    return fixun(Syncit.fxStore (this.storeArgs, "get", key))
  }
  setProperties (properties, deleteAllOthers) {

  }
  /**
   * set the entry associated with the given key
   * @param {string} key 
   * @param {string} value 
   * @returns {FakeProperties} in Apps Script this is returned for chaining
   */
  setProperty (key, value) {
    Syncit.fxStore (this.storeArgs, "set", key, value)
    return this
  }

}

class FakeCache extends FakeStore {
  constructor (type) {
    super(type)
    this.storeArgs = {
      ...this.storeArgs,
      storeDir: 'cache'
    }
  }
  getAll (keys) {

  }

  /**
   * set the entry associated with the given key
   * @param {string} key 
   * @param {string} value 
   * @param {number} expirationInSeconds 
   * @returns null
   */
  put (key, value, expirationInSeconds ) {
    Syncit.fxStore (this.storeArgs, "set", key, value, normExpiry(expirationInSeconds))
    return null
  }

  putAll (values, expirationInSeconds) {
    
  }

  /**
   * delete the entry associated with the given key
   * @param {string} key 
   * @returns {FakeCache} in Apps Script this is returned for chaining
   */
  remove (key) {
    Syncit.fxStore (this.storeArgs, "delete", key)
    return null
  }

  removeAll (keys) {
    
  }
  get (key) {
    return fixun(Syncit.fxStore (this.storeArgs, "get", key))
  }

}


