import { Proxies } from '../../support/proxies.js'
import { newNummery } from '../../support/nummery.js'

/**
 * create a new FakeTextDirection 
 * @param  {...any} args 
 * @returns {FakeProtectionType}
 */
const newFakeProtectionType = (...args) => {
  return Proxies.guard(new FakeProtectionType(...args))
}


class FakeProtectionType {
  constructor(value) {
    const types = [
      'SHEET',
      'RANGE',
    ]
    if (!types.includes(value)) {
      throw new Error(`${value} is not a valid text protection type`)
    }

    return newNummery(value, types)
  }
}

export const ProtectionType = {
  SHEET: newFakeProtectionType('SHEET'),
  RANGE: newFakeProtectionType('RANGE')
}

