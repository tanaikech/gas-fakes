import { Proxies } from '../../support/proxies.js'
import { Utils } from '../../support/utils.js'
const { is } = Utils
// see enum.MD for details of how all this works

const ordinalKeySymbol = Symbol('enum_ordinal')

class CircularEnum {
  constructor(name, ordinal) {
    this[ordinalKeySymbol] = ordinal
    this.ordinal = () => this[ordinalKeySymbol]
    this.name = () => name;
    this.toString = () => name;
    this.toJSON = () => name;
    this.compareTo = (e) => this.ordinal() - e.ordinal()
  }
}

const newCircularEnum = (...args) => {
  const e = new CircularEnum(...args)
  return Proxies.guard(e)
}

  /**
   * make an apps script style enum
   * @param {string[]} keys the valid key values for the enum
   * @param {string} [defaultKey] normally we use the 1st key in the keys array, but this would pick another by name
   * @return {CircularEnum}
   */
  export const makeCircularEnum = (keys, defaultKey) => {

    if (!is.nonEmptyArray(keys) || !keys.every(is.string)) {
      throw new Error (`expected keys argument to makeCircularEnum to be an array of strings`)
    }

    // we'll assume the default key is the first one if not specified
    let defaultIndex = 0

    // if one is specified then check it's in the list of valid values
    if (defaultKey) {
      if (!is.string(defaultKey)) {
        throw new Error (`expected defaultKey argument to makeCircularEnum to be a string if present`)
      }
      defaultIndex = keys.indexOf(defaultKey)
      if (defaultIndex === -1) throw new Error(`Failed to find default enum key`, defaultKey)
    }
    defaultKey = keys[defaultIndex]

    // the base property (for Example SpreadsheetApp.ColorType)
    const base = newCircularEnum(defaultKey, defaultIndex)

    // now one for each requried key
    const enums = keys.map((key, i) => new CircularEnum(key, i))

    // add properties to base
    enums.forEach(e => base[e.name()] = e)

    // add circularity
    enums.forEach(e => keys.forEach(key => e[key] = base[key]))

    return base

  }
