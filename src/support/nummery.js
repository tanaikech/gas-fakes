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

  constructor(type) {
    this.__type = type
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

}