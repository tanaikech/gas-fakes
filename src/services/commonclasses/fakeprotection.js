import { Proxies } from '../../support/proxies.js'
import { notYetImplemented, signatureArgs } from '../../support/helpers.js'
import { Utils } from '../../support/utils.js'
const {is} = Utils



/**
 * create a new FakeBorder instance
 * @param  {...any} args 
 * @returns {FakeBorder}
 */
export const newFakeProtection = (...args) => {
  return Proxies.guard(new FakeProtection(...args))
}

class FakeProtection { 
  constructor(type) {
    this.__type = type

    const props = [
      "addEditor",
      "addEditors",
      "addTargetAudience",
      "canDomainEdit",
      "canEdit",
      "getDescription",
      "getEditors",
      "getProtectionType",
      "getRange",
      "getRangeName",
      "getTargetAudiences",
      "getUnprotectedRanges",
      "isWarningOnly",
      "remove",
      "removeEditor",
      "removeEditors",
      "removeTargetAudience",
      "setDescription",
      "setDomainEdit",
      "setNamedRange",
      "setRange",
      "setRangeName",
      "setUnprotectedRanges",
      "setWarningOnly",
      "toString"
    ]
    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented(f)
      }
    })
  }


}