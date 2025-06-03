
import { newCircularEnum } from './circularenum.js'

const isArray = (a) => Array.isArray(a)
const isNonEmptyArray = (a) => isArray(a) && a.length > 0
const isString = (a) => typeof a === 'string'

/**
 * make an apps script style enum
 * @param {string[]} keys the valid key values for the enum
 * @param {string} [defaultKey] normally we use the 1st key in the keys array, but this would pick another by name
 * @return {CircularEnum}
 */
const makeCircularEnum = (keys, defaultKey) => {

  if (!isNonEmptyArray(keys) || !keys.every(isString)) {
    throw new Error(`expected keys argument to makeCircularEnum to be an array of strings`)
  }

  // we'll assume the default key is the first one if not specified
  let defaultIndex = 0

  // if one is specified then check it's in the list of valid values
  if (defaultKey) {
    if (!isString(defaultKey)) {
      throw new Error(`expected defaultKey argument to makeCircularEnum to be a string if present`)
    }
    defaultIndex = keys.indexOf(defaultKey)
    if (defaultIndex === -1) throw new Error(`Failed to find default enum key`, defaultKey)
  }
  defaultKey = keys[defaultIndex]

  // the base property (for Example SpreadsheetApp.ColorType)
  const base = newCircularEnum(defaultKey, defaultIndex)

  // now one for each requried key
  const enums = keys.map((key, i) => newCircularEnum(key, i))

  // add properties to base
  enums.forEach(e => base[e.name()] = e)

  // add circularity
  enums.forEach(e => keys.forEach(key => e[key] = base[key]))

  return base

}

/**
 * make an apps script style enum
 * @param {string[]} keys the valid key values for the enum
 * @param {string} [defaultKey] normally we use the 1st key in the keys array, but this would pick another by name
 * @return {CircularEnum}
 */
export const newFakeGasEnum = (keys, defaultKey) => makeCircularEnum(keys, defaultKey)