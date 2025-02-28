

import is from '@sindresorhus/is';
import {assert} from '@sindresorhus/is';

const isNU = (item) => is.null(item) || is.undefined (item)

const arrify = (item) => is.array(item)
  ? item
  : (isNU(item) ? item : [item])

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


const settleAsString = (data, charset) => {
  if (is.buffer(data)) {
    return bytesToString (Array.from(data), charset)
  } else if (is.array(data)) {
    return bytesToString (data, charset)
  } else {
    assert.string (data)
    return data
  }

}

const settleAsBytes = (data, charset) => {

  if (is.string(data)) {
    return stringToBytes (data, charset)
  } else if (is.buffer(data)) {
    return Array.from (data)
  } else { 
    assert.array (data)
    return data
  }

}

const stringToBytes = (string, charset) => Array.from(Buffer.from(string, charset))
const bytesToString = (data, charset) => Buffer.from(data).toString (charset)

export const Utils = {
  stringToBytes,
  bytesToString,
  settleAsBytes,
  settleAsString,
  fromJson,
  arrify,
  makeUrlParams,
  makeParams,
  makeParamOb,
  isNU,
  assert
}



