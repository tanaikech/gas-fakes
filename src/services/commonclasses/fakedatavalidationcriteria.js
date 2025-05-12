import { Proxies } from '../../support/proxies.js'
import { newNummery } from '../../support/nummery.js'
import { newFakeDataValidation } from './fakedatavalidation.js'

/**
 * create a new FakeTextDirection 
 * @param  {...any} args 
 * @returns {FakeValidationCriteria}
 */
export const newFakeValidationCriteria = (...args) => {
  return Proxies.guard(new FakeValidationCriteria(...args))
}
// https://developers.google.com/apps-script/reference/spreadsheet/data-validation-criteria
class FakeValidationCriteria {
  constructor(value) {

    if (!critEnum.includes(value)) {
      throw new Error(`${value} is not a data validation criteria`)
    }

    return critEnum[value]
  }
}

const critEnum = [
  "DATE_AFTER", //	Enum	Requires a date that is after the given value.
  "DATE_BEFORE", //	Enum	Requires a date that is before the given value.
  "DATE_BETWEEN", //	Enum	Requires a date that is between the given values.
  "DATE_EQUAL_TO", //	Enum	Requires a date that is equal to the given value.
  "DATE_IS_VALID_DATE", //	Enum	Requires a date.
  "DATE_NOT_BETWEEN", //	Enum	Requires a date that is not between the given values.
  "DATE_ON_OR_AFTER", //	Enum	Require a date that is on or after the given value.
  "DATE_ON_OR_BEFORE", //	Enum	Requires a date that is on or before the given value.
  "NUMBER_BETWEEN", //	Enum	Requires a number that is between the given values.
  "NUMBER_EQUAL_TO", //	Enum	Requires a number that is equal to the given value.
  "NUMBER_GREATER_THAN", //	Enum	Require a number that is greater than the given value.
  "NUMBER_GREATER_THAN_OR_EQUAL_TO", //	Enum	Requires a number that is greater than or equal to the given value.
  "NUMBER_LESS_THAN", //	Enum	Requires a number that is less than the given value.
  "NUMBER_LESS_THAN_OR_EQUAL_TO", //	Enum	Requires a number that is less than or equal to the given value.
  "NUMBER_NOT_BETWEEN", //	Enum	Requires a number that is not between the given values.
  "NUMBER_NOT_EQUAL_TO", //	Enum	Requires a number that is not equal to the given value.
  "TEXT_CONTAINS", //	Enum	Requires that the input contains the given value.
  "TEXT_DOES_NOT_CONTAIN", //	Enum	Requires that the input does not contain the given value.
  "TEXT_EQUAL_TO", //	Enum	Requires that the input is equal to the given value.
  "TEXT_IS_VALID_EMAIL", //	Enum	Requires that the input is in the form of an email address.
  "TEXT_IS_VALID_URL", //	Enum	Requires that the input is in the form of a URL.
  "VALUE_IN_LIST", //	Enum	Requires that the input is equal to one of the given values.
  "VALUE_IN_RANGE", //	Enum	Requires that the input is equal to a value in the given range.
  "CUSTOM_FORMULA", //	Enum	Requires that the input makes the given formula evaluate to true.
  "CHECKBOX" //	Enum	Requires that the input is a custom value or a boolean; rendered as a checkbox.

]

export const DataValidationCriteria = critEnum.reduce((p, c) => {
  p[c] = newNummery(c)
  return p
}, {})

