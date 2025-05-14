import { Proxies } from '../../support/proxies.js'
import { signatureArgs } from '../../support/helpers.js'
import { Utils } from '../../support/utils.js'
import { newFakeDataValidation } from './fakedatavalidation.js'
import { newNummery } from '../../support/nummery.js'
import { newFakeValidationCriteria, dataValidationCriteriaMapping } from './fakedatavalidationcriteria.js'

const { is, zeroizeTime } = Utils

/**
 * create a new FakeValidationBuilder instance
 * @param  {...any} args 
 * @returns {FakeDataValidationBuilder}
 */
export const newFakeDataValidationBuilder = (...args) => {
  return Proxies.guard(new FakeDataValidationBuilder(...args))
}

// This maps the criteria used by the sheets API to the apps scrip builder method and adds validation for arguments
// we end up with a this[method] (...args) for each potential sheets criteria type
const mapMethod = (self, prop, { method, nargs, type, validator }) => {

  self[method] = (...args) => {
    const { nargs: xnargs, matchThrow } = signatureArgs(args, method)

    // check number args received  is within acceptable limits against expected args
    const nargArray = is.array(xnargs) ? xnargs : [xnargs, xnargs]
    if (nargs < nargArray[0] || nargs > nargArray[1]) matchThrow()

    // do a type check if one is required
    if (validator) {
      args = validator(args, matchThrow, xnargs)
    } else if (type) {
      const typeArray = is.array(type) ? type : Array.from({ length: args.length }).fill(type)
      args = args.map((a, i) => {
        if (!is[typeArray[i]](a)) matchThrow()
        // apps script removes the time portion for dates
        return is.date(a) ? zeroizeTime(a) : a
      })
    }
    return self.__setRule(prop, args)
  }
}

class FakeDataValidationBuilder {
  constructor() {
    // set defaults
    this.__rule = null
    this.__helpText = null
    this.__allowInvalid = true
    // generate the methods from the sheets api to apps script mapping
    Reflect.ownKeys(dataValidationCriteriaMapping).forEach(prop => mapMethod(this, prop, dataValidationCriteriaMapping[prop]))

  }

  __setRule(criteriaType, criteriaValues = []) {
    this.__rule = ({
      criteriaType: newNummery(criteriaType),
      criteriaValues: Array.from(criteriaValues)
    })
    return this
  }

  build() {
    return newFakeDataValidation(this)
  }

  copy() {
    const copy = newFakeDataValidationBuilder()
    copy.__rule = this.__rule
    copy.__helpText = this.__helpText
    copy.__allowInvalid
    copy.__rule = JSON.parse(JSON.stringify(this.__rule))
    return copy
  }

  getHelpText() {
    return this.__helpText
  }

  getCriteriaType() {
    return this.__rule?.criteriaType || null
  }

  getCriteriaValues() {
    return this.__rule?.criteriaValues || []
  }

  getAllowInvalid() {
    return this.__allowInvalid
  }

  setAllowInvalid(allowInvalid) {
    const { nargs, matchThrow } = signatureArgs(arguments, "setAllowInvalid")
    if (nargs !== 1 || !is.boolean(allowInvalid)) matchThrow()
    this.__allowInvalid = allowInvalid
    return this
  }

  setHelpText(helpText) {
    const { nargs, matchThrow } = signatureArgs(arguments, "setHelpText")
    if (nargs !== 1 || !is.function(helpText.toString)) matchThrow()
    this.__helpText = helpText.toString()
    return this
  }

  toString() {
    return 'DataValidationBuilder'
  }

  withCriteria(criteria, args) {
    const { nargs, matchThrow } = signatureArgs(arguments, "withCriteria")
    if (nargs !== 2) matchThrow()
    // validate the crit arg
    const crit = newFakeValidationCriteria(criteria.toString())
    this.__setRule(crit.toString(), args)
    return this
  }

}

export const makeDataValidationFromApi = (apiResult) => {
  const builder = newFakeDataValidationBuilder()
  console.log(JSON.stringify(apiResult))
  if (is.emptyObject(apiResult)) {
    throw new Error('missing apiresult for data validation')
  }
  const {
    condition,
    inputMessage,
    // what is this??
    showCustomUi,
    // this is allow invalid
    strict
  } = apiResult
  if (inputMessage) {
    builder.setHelpText(inputMessage)
  }

  console.log('got data validation', apiResult)
  let critter = dataValidationCriteriaMapping[condition?.type]

  // sigh - its possible that the api uses a different criteria name
  if (!critter) {
    critter = Reflect.ownKeys(dataValidationCriteriaMapping).find(f => dataValidationCriteriaMapping[f].apiEnum === condition?.type)
  }

  if (!critter) {
    throw new Error('received an unknown criteria type from the api', condition?.type)
  }
  const values = condition?.values 
  console.log (critter)
  const mapped = dataValidationCriteriaMapping[critter]
  
  // could also use withCriteria method here, but this will add all the validations as well instead
  if (values) {
    console.log (JSON.stringify(values))
    const plucked = values.map(f => f.userEnteredValue)
    // todo - what circumstances is a showdropdown required (2nd argument below)
    const args = [plucked]
    builder[mapped.method](...args)
  }
  else {
    builder[mapped.method]()
  }
  builder.setAllowInvalid(!strict)
  // TODO - find out what customUI from sheetsapi could be about
  return builder.build()
}

