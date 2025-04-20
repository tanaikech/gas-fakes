import { Proxies } from '../../support/proxies.js'
import { notYetImplemented } from '../../support/helpers.js'

//TODO - deal with r1c1 style ranges
/**
 * @file
 * @imports ../typedefs.js
 */
// private properties are identified with leading __
// this will signal to the proxy handler that it's okay to set them
/**
 * create a new FakeSheetRangeList instance
 * @param  {...any} args 
 * @returns {FakeSheetRangeList}
 */
export const newFakeSheetRangeList = (...args) => {
  return Proxies.guard(new FakeSheetRangeList(...args))
}

/**
 * basic fake FakeSheetRange
 * @class FakeSheetRange
 */
export class FakeSheetRangeList {

  /**
   * @constructor
   * @param {FakeSheetRange[]} ranges the ranges
   * @returns {FakeSheetRangeList}
   */
  constructor(ranges) {

    this.__ranges = ranges

    const props = [
      'clearDataValidations',
      'setFontWeight',
      'setBackground',
      'activate',
      'breakApart',
      'setFormulaR1C1',
      'setBackgroundRGB',
      'setBorder',
      'setFontColor',
      'setFontLine',
      'setFontStyle',
      'setWrap',
      'setShowHyperlink',
      'setVerticalText',
      'setWrapStrategy',
      'uncheck',
      'insertCheckboxes',
      'removeCheckboxes',
      'trimWhitespace',
      'setTextRotation',
      'setTextDirection',
      'setVerticalAlignment',
      'setFontSize',
      'clearContent',
      'setFontFamily',
      'setFormula',
      'setNote',
      'clearNote',
      'clearFormat',
      'setHorizontalAlignment',
      'clear',
      'setValue',
      'check',
      'setNumberFormat'
    ]

    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented(f)
      }
    })

  }

  toString() {
    return 'RangeList'
  }

  /**
   * getRanges() https://developers.google.com/apps-script/reference/spreadsheet/range-list#getranges
   * Returns a list of one or more Range instances in the same sheet.
   */
  getRanges() {
    return this.__ranges
  }

}