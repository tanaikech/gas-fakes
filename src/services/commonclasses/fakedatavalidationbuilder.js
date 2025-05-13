import { Proxies } from '../../support/proxies.js'
import { signatureArgs } from '../../support/helpers.js'
import { Utils } from '../../support/utils.js'
import { newFakeDataValidation } from './fakedatavalidation.js'
import { newNummery } from '../../support/nummery.js'
import { newFakeValidationCriteria } from './fakedatavalidationcriteria.js'

const { is, zeroizeTime } = Utils

/**
 * create a new FakeValidationBuilder instance
 * @param  {...any} args 
 * @returns {FakeDataValidationBuilder}
 */
export const newFakeDataValidationBuilder = (...args) => {
  return Proxies.guard(new FakeDataValidationBuilder(...args))
}

class FakeDataValidationBuilder {
  constructor() {
    // set defaults
    this.__rule = null
    this.__helpText = null
    this.__allowInvalid = true

    // All the date requires have the same general format, but with different args possible
    const dateRequires = (method, nargs, prop) => {
      this[method] = (...args) => {
        const { nargs: xnargs, matchThrow } = signatureArgs(args, method)
        if (nargs !== xnargs) matchThrow()
        if (args.some(f => !is.date(f))) matchThrow()
        const zeroized = args.map(f => zeroizeTime(f))
        return this.__setRule(prop, zeroized)
      }

    }
    // generate the date requires
    const dateProps = {
      "requireDate": { nargs: 0, prop: "DATE_IS_VALID_DATE" },
      "requireDateEqualTo": { nargs: 1, prop: "DATE_EQUAL_TO" },
      "requireDateAfter": { nargs: 1, prop: "DATE_AFTER" },
      "requireDateBefore": { nargs: 1, prop: "DATE_BEFORE" },
      "requireDateBetween": { nargs: 2, prop: "DATE_BETWEEN" },
      "requireDateNotBetween": { nargs: 2, prop: "DATE_NOT_BETWEEN" },
      "requireDateOnOrAfter": { nargs: 1, prop: "DATE_ON_OR_AFTER" },
      "requireDateOnOrBefore": { nargs: 1, prop: "DATE_ON_OR_BEFORE" },
    }

    Reflect.ownKeys(dateProps)
      .forEach(f => dateRequires(f, dateProps[f].nargs, dateProps[f].prop))

    // generate number requires
    const basicRequires = (method, nargs, prop, checkProp = "number") => {
      this[method] = (...args) => {
        const { nargs: xnargs, matchThrow } = signatureArgs(args, method)
        if (nargs !== xnargs) matchThrow()
        if (args.some(f => !is[checkProp](f))) matchThrow()
        return this.__setRule(prop, args)
      }
    }


    const numberProps = {
      "requireNumberBetween": { nargs: 2, prop: "NUMBER_BETWEEN" },
      "requireNumberEqualTo": { nargs: 1, prop: "NUMBER_EQUAL_TO" },
      "requireNumberGreaterThan": { nargs: 1, prop: "NUMBER_GREATER_THAN" },
      "requireNumberGreaterThanOrEqualTo": { nargs: 1, prop: "NUMBER_GREATER_THAN_OR_EQUAL_TO" },
      "requireNumberLessThan": { nargs: 1, prop: "NUMBER_LESS_THAN" },
      "requireNumberLessThanOrEqualTo": { nargs: 1, prop: "NUMBER_LESS_THAN_OR_EQUAL_TO" },
      "requireNumberNotBetween": { nargs: 2, prop: "NUMBER_NOT_BETWEEN" },
      "requireNumberNotEqualTo": { nargs: 1, prop: "NUMBER_NOT_EQUAL_TO" },
    }

    Reflect.ownKeys(numberProps)
      .forEach(f => basicRequires(f, numberProps[f].nargs, numberProps[f].prop))

    const stringPrompts = {
      "requireTextContains": { nargs: 1, prop: "TEXT_CONTAINS", checkProp: "string" },
      "requireTextDoesNotContain": { nargs: 1, prop: "TEXT_DOES_NOT_CONTAIN", checkProp: "string" },
      "requireTextEqualTo": { nargs: 1, prop: "TEXT_EQUAL_TO", checkProp: "string" },
      "requireTextIsUrl": { nargs: 0, prop: "TEXT_IS_VALID_URL"},
      "requireFormulaSatisfied": { nargs: 1, prop: "CUSTOM_FORMULA", checkProp: "string" },
      "requireTextIsEmail": { nargs: 0, prop: "TEXT_IS_VALID_EMAIL" },
    }

    Reflect.ownKeys(stringPrompts)
      .forEach(f =>
        basicRequires(f, stringPrompts[f].nargs, stringPrompts[f].prop, stringPrompts[f].checkProp))

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

  copy () {
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


  requireCheckbox(checkedValue, uncheckedValue) {
    const { nargs, matchThrow } = signatureArgs(arguments, "requireCheckbox")
    if (nargs > 2) matchThrow()
    return this.__setRule('CHECKBOX', arguments)
  }

  requireValueInRange(range, showDropdown = true) {
    const { nargs, matchThrow } = signatureArgs(arguments, "requireValueInRange")
    if (nargs > 2 || !nargs) matchThrow()
    if (!is.function(range?.toString) || range.toString() !== 'Range') matchThrow()
    if (!is.boolean(showDropdown)) matchThrow()
    return this.__setRule('VALUE_IN_RANGE', [range,showDropdown])

  }

  requireValueInList(values, showDropdown = true ) {
    const { nargs, matchThrow } = signatureArgs(arguments, "requireValueInList")
    if (nargs > 2 || !nargs) matchThrow()
    if (!is.array(values)) matchThrow()
    //  Apps Script converts list values to strings 
    if (values.some(f => !is.function(f?.toString))) matchThrow()
    if (!is.boolean(showDropdown)) matchThrow()

      // it seems that apps script insers a true default for showDropdown even if not explicitly given.
    const args = [values.map(f=>f.toString()), showDropdown]
    return this.__setRule('VALUE_IN_LIST', args)
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

  withCriteria (criteria, args) {
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
  if (is.nonEmptyObject(apiResult)) {
    const {
      condition,
      inputMessage,
      showCustomUi,
      strict
    } = apiResult
    if (inputMessage) {
      builder.setHelpText(inputMessage)
    }

  } else {
    throw new Error('missing apiresult for data validation')
  }

  console.log('got data validation', apiResult)
  return builder.build()
}