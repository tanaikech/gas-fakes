import { Proxies } from '../../support/proxies.js'


/**
 * @file
 * @imports ../typedefs.js
 */


/**
 * create a new FakeBorder instance
 * @param  {...any} args 
 * @returns {FakeBorder}
 */
export const newFakeTextStyle = (...args) => {
  return Proxies.guard(new FakeTextStyle(...args))
}
// https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/other#TextFormat
class FakeTextStyle {

  /**
   * @param {import('../typedefs.js').TextFormat} apiResult
   * @returns {FakeTextStyle} a fake text style
   */

  constructor(builder) {
    this.__builder = builder
  }
  isBold () {
    return this.__builder.__bold
  }
  isItalic () {
    return this.__builder.__italic  
  } 
  isUnderline () {
    return this.__builder.__underline
  }
  isStrikethrough () {
    return this.__builder.__strikethrough
  }
  getFontSize () {
    return this.__builder.__fontSize
  }
  getFontFamily () {
    return this.__builder.__fontFamily
  }
  getForegroundColor () {
    return this.__builder.__foregroundColor
  }
  getForegroundColorObject () {
    return this.__builder.__foregroundColorObject
  }
  toString() {
    return 'TextStyle'
  }
}