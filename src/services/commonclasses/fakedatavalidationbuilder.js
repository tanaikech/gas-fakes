import { Proxies } from '../../support/proxies.js'
import { signatureArgs } from '../../support/helpers.js'
import { Utils } from '../../support/utils.js'
import { newFakeDataValidation } from './fakedatavalidation.js'
import { notYetImplemented } from '../../support/helpers.js'
import { newNummery } from '../../support/nummery.js'
import * as validator from 'email-validator'

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
    
    const props = [
      "copy",//()	DataValidationBuilder	Creates a builder for a data validation rule based on this rule's settings.
      "requireValueInList",//(values)	DataValidationBuilder	Sets the data validation rule to require that the input is equal to one of the given values.
      "requireValueInList",//(values, showDropdown)	DataValidationBuilder	Sets the data validation rule to require that the input is equal to one of the given values, with an option to hide the dropdown menu.
      "requireValueInRange",//(range)	DataValidationBuilder	Sets the data validation rule to require that the input is equal to a value in the given range.
      "requireValueInRange",//(range, showDropdown)	DataValidationBuilder	Sets the data validation rule to require that the input is equal to a value in the given range, with an option to hide the dropdown menu.
      //"setAllowInvalid",//(allowInvalidData)	DataValidationBuilder	Sets whether to show a warning when input fails data validation or whether to reject the input entirely.
      // "setHelpText",//(helpText)	DataValidationBuilder	Sets the help text that appears when the user hovers over the cell on which data validation is set.
      "withCriteria",//(criteria, args)	DataValidationBuilder	Sets the data validation rule to criteria defined by DataValidationCriteria values, typically taken from the criteria and arguments of an existing rule.
    ]
    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented(f)
      }
    })
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

  requireTextContains (text) {
    const { nargs, matchThrow } = signatureArgs(arguments, "requireTextContains")
    if (nargs !==1 || !is.string(text)) matchThrow()
    return this.__setRule('TEXT_CONTAINS', arguments)
  }

  requireTextDoesNotContain (text) {
    const { nargs, matchThrow } = signatureArgs(arguments, "requireTextDoesNotContain")
    if (nargs !==1 || !is.string(text)) matchThrow()
    return this.__setRule('TEXT_DOES_NOT_CONTAIN', arguments)
  }

  requireTextEqualTo (text) {
    const { nargs, matchThrow } = signatureArgs(arguments, "requireTextEqualTo")
    if (nargs !==1 || !is.string(text)) matchThrow()
    return this.__setRule('TEXT_EQUAL_TO', arguments)
  }

  requireTextIsEmail (text) {
    const { nargs, matchThrow } = signatureArgs(arguments, "requireTextIsEmail")
    if (nargs !==1 || !validator.validate(text)) matchThrow()
    return this.__setRule('IS_EMAIL', arguments)
  }

  requireTextIsUrl (text) {
    const { nargs, matchThrow } = signatureArgs(arguments, "requireTextIsUrl")
    if (nargs !==1 || !is.urlString(text)) matchThrow()
    return this.__setRule('IS_URL', arguments)
  }

  requireCheckbox(checkedValue, uncheckedValue) {
    const { nargs, matchThrow } = signatureArgs(arguments, "requireCheckbox")
    if (nargs > 2) matchThrow()
    return this.__setRule('CHECKBOX', arguments)
  }

  requireFormulaSatisfied(formula) {
    const { nargs, matchThrow } = signatureArgs(arguments, "requireFormulaSatisfied")
    if (nargs !== 1 || !is.string(formula)) matchThrow()
    return this.__setRule('CUSTOM_FORMULA', [formula])
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