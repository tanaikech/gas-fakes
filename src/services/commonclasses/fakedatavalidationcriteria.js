import { Proxies } from '../../support/proxies.js'
import { newNummery } from '../../support/nummery.js'
import { Utils } from '../../support/utils.js'
const { is } = Utils

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
    const critEnum = Reflect.ownKeys(dataValidationCriteriaMapping)
    if (!critEnum.includes(value)) {
      throw new Error(`${value} is not a data validation criteria`)
    }

    return critEnum[value]
  }
}

// maps criteria type to builder function
export const dataValidationCriteriaMapping = {
  DATE_AFTER: {
    method: "requireDateAfter",
    nargs: 1,
    type: 'date'
  },
  DATE_BEFORE: {
    method: "requireDateBefore",
    nargs: 1,
    type: 'date'
  },
  DATE_EQUAL_TO: {
    method: "requireDateEqualTo",
    nargs: 1,
    type: 'date'
  },
  DATE_BETWEEN: {
    method: "requireDateBetween",
    nargs: 2,
    type: 'date'
  },
  DATE_NOT_BETWEEN: {
    method: "requireDateNotBetween",
    nargs: 2,
    type: 'date'
  },
  DATE_IS_VALID_DATE: {
    method: "requireDate",
    nargs: 0,
  },
  DATE_ON_OR_AFTER: {
    method: "requireDateOnOrAfter",
    nargs: 1,
    type: 'date'
  },
  DATE_ON_OR_BEFORE: {
    method: "requireDateOnOrBefore",
    nargs: 1,
    type: 'date'
  },

  NUMBER_EQUAL_TO: {
    method: "requireNumberEqualTo",
    nargs: 1,
    type: 'number'
  },
  NUMBER_GREATER_THAN: {
    method: "requireNumberGreaterThan",
    nargs: 1,
    type: 'number'
  },
  NUMBER_GREATER_THAN_OR_EQUAL_TO: {
    method: "requireNumberGreaterThanOrEqualTo",
    nargs: 1,
    type: 'number'
  },
  NUMBER_LESS_THAN: {
    method: "requireNumberLessThan",
    nargs: 1,
    type: 'number'
  },
  NUMBER_LESS_THAN_OR_EQUAL_TO: {
    method: "requireNumberLessThanOrEqualTo",
    nargs: 1,
    type: 'number'
  },
  NUMBER_NOT_BETWEEN: {
    method: "requireNumberNotBetween",
    nargs: 2,
    type: 'number'
  },
  NUMBER_BETWEEN: {
    method: "requireNumberBetween",
    nargs: 2,
    type: 'number'
  },
  NUMBER_NOT_EQUAL_TO: {
    method: "requireNumberNotEqualTo",
    nargs: 1,
    type: 'number'
  },
  TEXT_CONTAINS: {
    method: "requireTextContains",
    nargs: 1 ,
    type: 'string'
  },
  TEXT_DOES_NOT_CONTAIN: {
    method: "requireTextDoesNotContain",
    nargs: 1,
    type: 'string'
  },
  TEXT_EQUAL_TO: {
    method: "requireTextEqualTo",
    nargs: 1,
    type: 'string'
  },
  TEXT_IS_VALID_URL: {
    method: "requireTextIsUrl",
    nargs: 0
  },
  CUSTOM_FORMULA: {
    method: "requireFormulaSatisfied",
    nargs: 1,
    type: 'string'
  },
  TEXT_IS_VALID_EMAIL: {
    method: "requireTextIsEmail",
    nargs: 0,
    apiEnum: 'TEXT_IS_EMAIL'
  },
  CHECKBOX: {
    method: "requireCheckbox",
    nargs: [0,2]
  },
  VALUE_IN_RANGE: {
    method: "requireValueInRange",
    nargs: [1,2],
    type: ['range','boolean'],
    validator: (args, matchThrow, nargs) => {
      let [range, showDropdown] = args
      if (nargs ===1 )showDropdown = true
      if (!is.function(range.toString) || range.toString() !== 'Range') matchThrow()
      return [range, showDropdown]
    }
  },
  VALUE_IN_LIST: {
    method: "requireValueInList",
    nargs: [1,2],
    type: ['array','boolean'],
    // this returns a modified args list
    validator: (args, matchThrow, nargs) => {
      //  Apps Script converts list values to strings 
      //  TODO - various options in the UI still to figure out
      //  - display style chip/arrow/plain text 
      //  - multiple selections - only chip allows this 
      //  - what are the circumstances for showcustomui being true
      console.log (args)
      let [values, showDropdown] = args
      // appply default showdropdown
      if (nargs ===1 )showDropdown = true
      if (values.some(f => !is.function(f?.toString))) matchThrow()
        // it seems that apps script insers a true default for showDropdown even if not explicitly given.
      return [values.map(f=>f.toString()), showDropdown]
    },
    apiEnum: 'ONE_OF_LIST'
  }
}


export const DataValidationCriteria = Reflect.ownKeys(dataValidationCriteriaMapping).reduce((p, c) => {
  p[c] = newNummery(c)
  return p
}, {})

