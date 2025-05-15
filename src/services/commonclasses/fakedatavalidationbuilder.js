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

export const makeDataValidationFromApi = (apiResult, range) => {
  // we can get the spreadsheet if we have the requesting range

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

  console.log('got data validation', JSON.stringify(apiResult))
  let conType = condition?.type
  let critter = dataValidationCriteriaMapping[conType]

  // sigh - its possible that the api uses a different criteria name
  if (!critter) {
    critter = dataValidationCriteriaMapping[
      Reflect.ownKeys(dataValidationCriteriaMapping).find(f => dataValidationCriteriaMapping[f].apiEnum === conType)
    ]
  }

  if (!critter) {
    throw new Error('received an unknown criteria type from the api', conType)
  }
  console.log(critter)
  if (!is.function(builder[critter.method])) {
    throw new Error("failed to find method in datavalidation builder for criteria type", critter.name, conType)
  }
  const values = condition?.values

  // could also use withCriteria method here, but this will add all the validations as well instead
  if (values) {

    const plucked = values.map(f => f.userEnteredValue)
console.log (plucked)
    if (critter.method === 'requireValueInRange') {

      if (plucked.length !== 1) {
        throw new Error('expected exactly 1 range for values_in_range but got', plucked.length)
      }

      // this is expecting a range so we need to make one
      const ss = range ? range.__getSpreadsheet() : null
      if (!ss) {
        throw new Error('Expected to know the parent spreadsheet for values_in_range')
      }
      const [splut] = plucked
      // because range is probably in format =sheet!range
      const parts = splut.replace(/^=/, "").split("!")
      if (parts.length !== 2) {
        throw new Error('Expected range with sheet name for value in range but got', p)
      }
      // find the sheet  
      const sheet = ss.getSheetByName(parts[0])
      if (!sheet) {
        throw new Error('Unable to find sheet mentioned in range', p)
      }

      // todo -- where does the 2nd argument come from (show dropdown)
      builder[critter.method](sheet.getRange(parts[1]))

    } else if (critter.method === 'requireValueInList') {
      // todo - what circumstances is a showdropdown required (2nd argument below)
      const args = [plucked]
      builder[critter.method](...args)
    } else if (critter.type === 'date') {
      // TODO need to handle relative dates
      // todo -- sometimes a formula can be returned -h owt ohandle?
      const dated = plucked.map(f => {
        if (!is.string(f)) {
          throw new Error("expected string type from date validation - got ", f)
        }
        return new Date(f)
      })
      builder[critter.method](...dated)
    } else if (critter.type === 'number') {
      // because values are string - 
      // todo -- sometimes a formula can be returned -h owt ohandle?
      const numbered = plucked.map(Number)
      builder[critter.method](...numbered)
    } else {
      builder[critter.method](...plucked)
    }
  }
  else {
    builder[critter.method]()
  }
  builder.setAllowInvalid(!strict)
  // TODO - find out what customUI from sheetsapi could be about
  return builder.build()
}

