import { isNullOrUndefined } from '@sindresorhus/is'
import { Utils } from '../../support/utils.js'
const { is } = Utils

// maps criteria type to builder function
export const dataValidationCriteriaMapping = {
  DATE_AFTER: {
    name: "DATE_AFTER",
    method: "requireDateAfter",
    nargs: 1,
    type: 'date'
  },
  DATE_AFTER_RELATIVE: {
    name: "DATE_AFTER_RELATIVE",
    // this is not implemented in GAS so just throw
    method: null,
    nargs: 1,
    type: 'date',
    // the preseence of 'realtiveDate proerty in the api response distinguishes this from regular date_after
    apiEnum: "DATE_AFTER",
    apiField: "relativeDate"
  },
  DATE_BEFORE: {
    name: "DATE_BEFORE",
    method: "requireDateBefore",
    nargs: 1,
    type: 'date'
  },
  DATE_BEFORE_RELATIVE: {
    name: "DATE_BEFORE_RELATIVE",
    // this is not implemented in GAS so just throw
    method: null,
    nargs: 1,
    type: 'date',
    // the preseence of 'realtiveDate proerty in the api response distinguishes this from regular date_after
    apiEnum: "DATE_BEFORE",
    apiField: "relativeDate"
  },
  DATE_EQUAL_TO: {
    name: "DATE_EQUAL_TO",
    method: "requireDateEqualTo",
    nargs: 1,
    type: 'date',
    apiEnum: "DATE_EQ"
  },
  DATE_EQUAL_TO_RELATIVE: {
    name: "DATE_EQUAL_TO_RELATIVE",
    // this is not implemented in GAS so just throw
    method: null,
    nargs: 1,
    type: 'date',
    // the preseence of 'realtiveDate proerty in the api response distinguishes this from regular date_after
    apiEnum: "DATE_EQ",
    apiField: "relativeDate"
  },
  DATE_BETWEEN: {
    name: "DATE_BETWEEN",
    method: "requireDateBetween",
    nargs: 2,
    type: 'date'
  },
  DATE_NOT_BETWEEN: {
    name: "DATE_NOT_BETWEEN",
    method: "requireDateNotBetween",
    nargs: 2,
    type: 'date'
  },
  DATE_IS_VALID_DATE: {
    name: "DATE_IS_VALID_DATE",
    method: "requireDate",
    nargs: 0,
    apiEnum:"DATE_IS_VALID"
  },
  DATE_ON_OR_AFTER: {
    name: "DATE_ON_OR_AFTER",
    method: "requireDateOnOrAfter",
    nargs: 1,
    type: 'date'
  },
  DATE_ON_OR_BEFORE: {
    name: "DATE_ON_OR_BEFORE",
    method: "requireDateOnOrBefore",
    nargs: 1,
    type: 'date'
  },

  NUMBER_EQUAL_TO: {
    name: "NUMBER_EQUAL_TO",
    method: "requireNumberEqualTo",
    nargs: 1,
    type: 'number',
    apiEnum: "NUMBER_EQ"
  },
  NUMBER_GREATER_THAN: {
    name: "NUMBER_GREATER_THAN",
    method: "requireNumberGreaterThan",
    nargs: 1,
    type: 'number',
    apiEnum: "NUMBER_GREATER"
  },
  NUMBER_GREATER_THAN_OR_EQUAL_TO: {
    name: "NUMBER_GREATER_THAN_OR_EQUAL_TO",
    method: "requireNumberGreaterThanOrEqualTo",
    nargs: 1,
    type: 'number',
    apiEnum: "NUMBER_GREATER_THAN_EQ"
  },
  NUMBER_LESS_THAN: {
    name: "NUMBER_LESS_THAN",
    method: "requireNumberLessThan",
    nargs: 1,
    type: 'number',
    apiEnum: "NUMBER_LESS"
  },
  NUMBER_LESS_THAN_OR_EQUAL_TO: {
    name: "NUMBER_LESS_THAN_OR_EQUAL_TO",
    method: "requireNumberLessThanOrEqualTo",
    nargs: 1,
    type: 'number',
    apiEnum: "NUMBER_LESS_THAN_EQ"
  },
  NUMBER_NOT_BETWEEN: {
    name: "NUMBER_NOT_BETWEEN",
    method: "requireNumberNotBetween",
    nargs: 2,
    type: 'number'
  },
  NUMBER_BETWEEN: {
    name: "NUMBER_BETWEEN",
    method: "requireNumberBetween",
    nargs: 2,
    type: 'number'
  },
  NUMBER_NOT_EQUAL_TO: {
    name: "NUMBER_NOT_EQUAL_TO",
    method: "requireNumberNotEqualTo",
    nargs: 1,
    type: 'number',
    apiEnum:"NUMBER_NOT_EQ"
  },
  TEXT_CONTAINS: {
    name: "TEXT_CONTAINS",
    method: "requireTextContains",
    nargs: 1 ,
    type: 'string'
  },
  TEXT_DOES_NOT_CONTAIN: {
    name: "TEXT_DOES_NOT_CONTAIN",
    method: "requireTextDoesNotContain",
    nargs: 1,
    type: 'string',
    apiEnum: "TEXT_NOT_CONTAINS"
  },
  TEXT_EQUAL_TO: {
    name: "TEXT_EQUAL_TO",
    method: "requireTextEqualTo",
    nargs: 1,
    type: 'string',
    apiEnum: "TEXT_EQ"
  },
  TEXT_IS_VALID_URL: {
    name: "TEXT_IS_VALID_URL",
    method: "requireTextIsUrl",
    nargs: 0,
    apiEnum: "TEXT_IS_URL"
  },
  CUSTOM_FORMULA: {
    name: "CUSTOM_FORMULA",
    method: "requireFormulaSatisfied",
    nargs: 1,
    type: 'string'
  },
  TEXT_IS_VALID_EMAIL: {
    name: "TEXT_IS_VALID_EMAIL",
    method: "requireTextIsEmail",
    nargs: 0,
    apiEnum: 'TEXT_IS_EMAIL'
  },
  CHECKBOX: {
    name: "CHECKBOX",
    method: "requireCheckbox",
    nargs: [0,2],
    apiEnum: "BOOLEAN"
  },
  VALUE_IN_RANGE: {
    name: "VALUE_IN_RANGE",
    method: "requireValueInRange",
    nargs: [1,2],
    type: ['range','boolean'],
    validator: (args, matchThrow) => {
      let [range, showDropdown] = args
      if (!is.function(range.toString) || range.toString() !== 'Range') matchThrow()
      return [range,  is.undefined(showDropdown) ? true : showDropdown]
    },
    apiEnum: "ONE_OF_RANGE"
  },
  VALUE_IN_LIST: {
    name: "VALUE_IN_LIST",
    method: "requireValueInList",
    nargs: [1,2],
    type: ['array','boolean'],
    // this returns a modified args list
    validator: (args, matchThrow) => {
      //  Apps Script converts list values to strings 
      //  These options are not settable in apps script so we'll just ignore
      //  - display style chip/arrow/plain text 
      //  - multiple selections - only chip allows this 
      let [values, showDropdown] = args
      if (values.some(f => !is.function(f?.toString))) matchThrow()
        // it seems that apps script insers a true default for showDropdown even if not explicitly given.
       // we 
      return [values.map(f=>f.toString()), is.undefined(showDropdown) ? true : showDropdown ]
    },
    apiEnum: 'ONE_OF_LIST'
  }
}

