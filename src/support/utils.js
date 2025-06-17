

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

const isByteArray = (arr) => {
  return Array.isArray(arr) && arr.every((n) => Number.isInteger(n) && n >= 0 && n <= 255);
}

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

const capital = (str) => str.substring(0, 1).toUpperCase() + str.substring(1)
const unCapital = (str) => str.substring(0, 1).toLowerCase() + str.substring(1)

const validateHex = (cssString) => {
  if (!is.nonEmptyString(cssString)) return null
  const hex = cssString.trim().toLowerCase()
  if (hex.length !== 7) return null
  if (hex.substring(0, 1) !== '#') return null
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

const robToHex = ({ red, green, blue }) => rgbToHex(red, green, blue)


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

/**
 * normally we'll have ".x.y.z" and we need to dig in to extract the value for x.y.z of the passed value
 * however we may also have x(y,z) in which case we just need to extract up to x - since the stuff after the brackets was for the benfit of the api
 */
const getPlucker = (props, defaultValue) => {

  // get any bracketed values
  // clean the props
  props = props.trim().replace(/\s/g, "").split(".").filter(f => f).join(".")

  // now extract all the bracketed stuff - this will turn x.y(a,b) 
  // into G1 - x.y G2 a,b
  // and x.y into just x.y
  const regex = /([^(]*)(.*)/
  const match = regex.exec(props);
  if (!match) {
    throw `undeciperable props ${props} for plucker`
  }
  // so this would be a.b(c,d)  main [a,b] sub [c,d]
  // right now only supporting single depth
  const main = match[1] && match[1].split(".")
  const subs = match[2] && match[2].replace(/\(/, "").replace(/\)/, "").split(",")

  const pluckSub = (v) => {
    if (!subs) return v
    return subs.reduce((p, c) => {
      p[c] = v && is.nonEmptyObject(v) && !isNU(v[c]) ? v[c] : defaultValue
      return p
    }, {})
  }

  // now we need a function that will extract fields to match these
  return (v) => {
    // if there are no main then we just return the plucked values from the sub
    if (!main) return pluckSub(v)

    const px = main.reduce((p, c) => {
      const t = p && p[c]
      return isNU(t) ? defaultValue : t
    }, v)
    return pluckSub(px)
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

const outside = (n, l, h) => n < l || n > h
const outsideInt = (n, l, h) => outside(n, l, h) || !is.integer(n)

const zeroizeTime = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // Month is 0-indexed
  const day = date.getDate();
  return new Date(year, month, day, 0, 0, 0, 0);
}
const isEnum = (a) => is.object(a) && Reflect.has(a, "compareTo") && is.function(a.compareTo)
const hasFunction = (a, b = toString) => !isNU(a) && a[b] && is.function(a[b])

const stringer = (value) => {
  let func = is.date(value) ? "toISOString" : "toString"
  if (!hasFunction(value, func)) {
    throw new Error(`dont know how to stringify ${value}`)
  }
  const t = value[func]()
  // drop time portion of iso date if that's what it is
  return is.date(value) ? t.slice(0, 10) : t

}
const WHITER = { red: 1, green: 1, blue: 1 }
const BLACKER = { red: 0, green: 0, blue: 0 }
const BLACK = '#000000'
const WHITE = '#ffffff'

const getEnumKeys = (value) => {
  if (!isEnum(value)) {
    throw `Expected value to be an Enum but got ${value}`
  }
  return Object.keys(value)
    .filter(f => f !== "UNSUPPORTED" && !is.function(value[f]))

}
export const Utils = {
  hexToRgb,
  stringToBytes,
  bytesToString,
  settleAsBytes,
  settleAsString,
  isByteArray,
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
  rgbToHex,
  getPlucker,
  validateHex,
  robToHex,
  outside,
  outsideInt,
  unCapital,
  zeroizeTime,
  isEnum,
  stringer,
  WHITE,
  BLACK,
  BLACKER,
  WHITER,
  getEnumKeys
}
