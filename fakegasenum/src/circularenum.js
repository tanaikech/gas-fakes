import { guard } from './proxies.js'
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

export const newCircularEnum = (keys, defaultKey) => {
  return guard(new CircularEnum(keys, defaultKey))
}

