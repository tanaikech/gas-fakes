import { Proxies } from './proxies.js'
/**
 * @file
 * @imports ../typedefs.js
 */
/**
 * we can use this to partially mimic the complex enummery stuff in gas
 * @param  {...any} args 
 * @returns {Nummery}
 */
export const newNummery = (...args) => {
  return Proxies.guard(new Nummery(...args))
}
class Nummery {
  // TODO - we can implement a fake ordinal by passing over the original gas enum
  constructor(type,frozen = {}) {
    this.__type = type
    this.__frozen = frozen
  }

  name () {
    return this.__type
  }
  toString() {
    return this.name()
  }
  toJSON() {
    return this.name()
  }
  ordinal() {
    return Reflect.ownKeys(this.__frozen).findIndex(f=>f=== this.name())
  }

}