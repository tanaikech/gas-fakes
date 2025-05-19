
import { Proxies } from '../../support/proxies.js'


/**
 * create a new FakeTextDirection 
 * @param  {...any} args 
 * @returns {FakeDataValidation}
 */
export const newFakeDataValidation = (...args) => {
  return Proxies.guard(new FakeDataValidation(...args))
}

export class FakeDataValidation {

  constructor(builder) {
    this.__builder = builder
  }
  getAllowInvalid() {
    return this.__builder.getAllowInvalid()
  } 
  getCriteriaType() {
    return this.__builder.getCriteriaType()
  }
  getCriteriaValues() {
    return this.__builder.getCriteriaValues()
  }
  getHelpText() {
    return this.__builder.getHelpText()
  }
  toString () {
    return 'DataValidation'
  }
  __getCritter() {
    return this.__builder.__getCritter()
  }

}


