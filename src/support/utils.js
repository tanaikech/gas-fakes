

import is from '@sindresorhus/is';
import { assert } from '@sindresorhus/is';

const isNU = (item) => is.null(item) || is.undefined(item)

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

const signatureArgs = (received, method) => {
  const args = Array.from(received)
  const nargs = args.length
  const passedTypes = args.map(is)
  const matchThrow = (mess = method) => {
    throw new Error(`The parameters (${passedTypes}) don't match the method signature for ${mess}`)
  }
  return {
    nargs,
    passedTypes,
    matchThrow
  }
}

const isBlob = (item) => is.object(item) && Reflect.has(item, "copyBlob") && is.function(item.copyBlob)

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
  const a = makeParams(pob)
  return a.reduce((p, [k, v]) => {
    p[k] = v
    return p
  }, {})
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
    return bytesToString(Array.from(data), charset)
  } else if (is.array(data)) {
    return bytesToString(data, charset)
  } else {
    assert.string(data)
    return data
  }

}

const settleAsBytes = (data, charset) => {

  if (is.string(data)) {
    return stringToBytes(data, charset)
  } else if (is.buffer(data)) {
    return Array.from(data)
  } else {
    assert.array(data)
    return data
  }

}

const stringToBytes = (string, charset) => Array.from(Buffer.from(string, charset))
const bytesToString = (data, charset) => Buffer.from(data).toString(charset)

/**
 * merge something like
 * sa = "a,b,f(x,y),g(a,b),h(h)"
 * sb = "c,b,f(x,z),h(h,i)"
 * into "a,b,f(x,y,z),g(a,b),h(h,i) 
 * @param  {...string} any number of other strings to merge 
 * @returns {string}
 */
export const mergeParamStrings = (...args) => {

  const enhanceMap = (str, itemMap = new Map()) => {
    // extract all the items with subfields
    const rxSubs = /([^,(]*)(?=\()\(([^)]*)\)/g
    /**
     * 	[ [ 'f(x,y)', 'f', 'x,y' ],
    [ 'g(a,b)', 'g', 'a,b' ],
    [ 'h(h)', 'h', 'h' ] ]
     */
    const subs = Array.from(str.matchAll(rxSubs))

    // there should be 3 groups for each member
    // for example fields(a,b) fields a,b  - we want to set up an map that looks like fields, "a,b"

    subs.forEach(match => {
      if (match.length !== 3) {
        throw new Error(`Invalid format for subfield ${JSON.stringify(match)}`)
      }
      const [_, key, items] = match
      if (!itemMap.has(key)) itemMap.set(key, new Set())
      const item = itemMap.get(key)
      assert.set(item)
      items.split(",").forEach(f => itemMap.get(key).add(f))
    })

    // there should be 2 groups for each member
    // for example foo  - we want a map item with key foo and value null
    const rxPlains = /(?<!\([^)]*),?([^,(]+)(?=(?:,|$)(?![^(]*\)))/g;
    const plains = Array.from(str.matchAll(rxPlains))

    plains.forEach(match => {
      if (match.length !== 2) {
        throw new Error(`Invalid format for field ${JSON.stringify(match)}`)
      }
      const [_, key] = match
      const item = itemMap.get(key)
      // because whether it exists or not it should be null otherwise its a conflict a set
      if (itemMap.has(key)) {
        assert.null(item)
      } else {
        itemMap.set(key, null)
      }
    })

    return itemMap
  }

  const itemMap = new Map()
  args.forEach(f => {
    assert.string(f)
    return enhanceMap(f.replace(/\s/g, ""), itemMap)
  })

  // now just convert that into a string
  return Array.from(itemMap.entries()).map(([key, value]) => {

    return is.null(value)
      ? key
      : `${key}(${Array.from(value.keys()).sort().join(",")})`
  }).sort().join(",")
}

const capital = (str) => str.substring(0, 1).toLowerCase() + str.substring(1)

const validateHex = (cssString) => {
  if (!is.nonEmptyString(cssString)) return null
  const hex = cssString.trim().toLowerCase()
  if (hex.length !== 7) return null
  if (hex.substring(0, 1)  !== '#') return null
  const hexValue = hex.substring(1)
  if (!hexValue.match(/^[0-9a-f]{6}$/)) return null
  const rgb = hexToRgb(hex)

  return {
    cssString,
    hexValue,
    hex,
    ...rgb,
    r: Math.round(rgb.red * 255),
    g: Math.round(rgb.green * 255),
    b: Math.round(rgb.blue * 255),
  }

}

const rgbToHex = (r, g, b) => {
  const toHex = (c) => {
    if (!c) return '00';
    const val = Math.round(c * 255);
    const hex = val.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  const red = toHex(r);
  const green = toHex(g);
  const blue = toHex(b);
  return `#${red}${green}${blue}`;
}

const getPlucker = (props, defaultValue) => {
  const pex = props.split(".")
  return (v) => {
    const px = pex.reduce((p, c) => {
      const t = p && p[c]
      return isNU(t) ? defaultValue : t
    }, v)
    return px
  }
}

const hexToRgb = (hex) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return {
    red: r / 255,
    green: g / 255,
    blue: b / 255,
  };
}



export const Utils = {
  hexToRgb,
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
  assert,
  isBlob,
  capital,
  is,
  signatureArgs,
  rgbToHex,
  getPlucker,
  validateHex
}



