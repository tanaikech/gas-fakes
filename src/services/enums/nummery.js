import { Proxies } from '../../support/proxies.js'


/**
 * we can use this to partially mimic the complex enummery stuff in gas
 * @param  {...any} args 
 * @returns {Nummery}
 */
export const newNummery = (...args) => {
  return Proxies.guard(new Nummery(...args))
}
class Nummery {
  #__parent
  #__type
  // TODO - we can implement a fake ordinal by passing over the original gas enum
  constructor(type, parent) {
    this.#__type = type
    this.#__parent = parent
  }

  // TODO compareto
  compareTo(other) {
    return this.#__parent.__compareTo (this.#__type, other)
  }
  name() {
    return this.#__type
  }
  toString() {
    return this.name()
  }
  toJSON() {
    return this.name()
  }
  ordinal() {
    return this.#__parent.__ordinal (this.#__type)
  }

}