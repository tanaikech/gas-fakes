const isUndefined = (item) => typeof item === typeof undefined
const isNull = (item) => item === null
const isNU = (item) => isNull(item) || isUndefined(item)
const isObject = (item) => typeof item === 'object'
const isFunction = (item) => typeof item === 'function'
const isArray = (item) => Array.isArray(item)
const isString = (item) => typeof item === "string"
const isNumber = (item) => Number.isFinite(item)
const isBoolean = (item) => typeof item === "boolean"
const isBuffer = (item) => Buffer.isBuffer (item)
const arrify = (item) => isArray(item)
  ? item
  : (isNU(item) ? item : [item])

const isPromise = (item) => !isNU(item) && (isObject(item) || isFunction(item)) && isFunction(item.then)
const fromJson = (text, failOnError = false) => {
  try {
    return JSON.parse(text)
  } catch (err) {
    console.log(text)
    if (failOnError) {
      throw err
    }
    return null
  }
}

/**
 * merge a series of url params 
 * @param {object|object[]} pob an object eg [{pa:a,pb:b},{pc:c}] 
 * @returns {string} would return pa=a&pb=pb&pc=c and encoded URI
 */
const makeUrlParams = (pob) => {
  return makeParams(pob).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")
}
/**
 * merge a series of url params 
 * @param {object|object[]} pob an object eg [{pa:a,pb:b},{pc:c}] 
 * @returns {object} merged and dedupped paramaters reduced
 */
const makeParamOb = (pob) => {
  const a = makeParams (pob)
  return a.reduce ((p, [k,v])=>{
    p[k] = v
    return p
  },{})
}
/**
 * merge a series of url params 
 * @param {object|object[]} pob an object eg [{pa:a,pb:b},{pc:c}] 
 * @returns {object[]} merged and dedupped paramaters
 */
const makeParams = (pob = []) => {
  // dups will be removed
  const mapob = arrify(pob).reduce((p, c) => {
    Reflect.ownKeys(c).forEach(k => p.set(k, c[k]))
    return p
  }, new Map())
  return Array.from(mapob.entries())
}
const is = {
  nu: isNU,
  null: isNull,
  undefined: isUndefined,
  object: isObject,
  function: isFunction,
  array: isArray,
  promise: isPromise,
  string: isString,
  number: isNumber,
  boolean: isBoolean,
  buffer: isBuffer
}

/**
 * assert is of correct type
 * @param {} value 
 * @param {string} type 
 * @param {string} [mess] override default thrown message 
 * @returns {*} value-
 */
const assertType = (value, type, mess) => {
  if (!Reflect.has(is, type)) {
    throw new Error(`dont know how to check asserted type ${type}`)
  }
  mess = mess || `value is not asserted ${type} : it's a ${typeof value}`
  if (!is[type](value)) {
    throw new Error(mess)
  }
  return value
}

const settleAsString = (data, charset) => {
  if (isBuffer(data)) {
    return bytesToString (Array.from(data), charset)
  } else if (isArray(data)) {
    return bytesToString (data, charset)
  } else {
    return assertType (data, "string")
  }

}

const settleAsBytes = (data, charset) => {

  if (isString(data)) {
    return stringToBytes (data, charset)
  } else if (isBuffer(data)) {
    return Array.from (data)
  } else {
    return assertType (data, "array")
  }

}

const stringToBytes = (string, charset) => Array.from(Buffer.from(string, charset))
const bytesToString = (data, charset) => Buffer.from(data).toString (charset)

export const Utils = {
  stringToBytes,
  bytesToString,
  settleAsBytes,
  settleAsString,
  is,
  isBuffer,
  isNU,
  isNull,
  isUndefined,
  isObject,
  isFunction,
  isArray,
  isPromise,
  isNumber,
  isString,
  fromJson,
  arrify,
  assertType,
  makeUrlParams,
  makeParams,
  makeParamOb
}



