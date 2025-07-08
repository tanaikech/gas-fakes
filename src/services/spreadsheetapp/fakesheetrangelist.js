import { Proxies } from '../../support/proxies.js'
import { notYetImplemented } from '../../support/helpers.js'

//TODO - deal with r1c1 style ranges

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
  }

  activate() {
    if (this.__ranges.length > 0) {
      this.__ranges[0].getSheet().getParent().setActiveRangeList(this);
    }
    return this;
  }

  breakApart() {
    this.__ranges.forEach(r => r.breakApart());
    return this;
  }

  clear(options) {
    this.__ranges.forEach(r => r.clear(options));
    return this;
  }

  clearContent() {
    this.__ranges.forEach(r => r.clearContent());
    return this;
  }

  clearDataValidations() {
    this.__ranges.forEach(r => r.clearDataValidations());
    return this;
  }

  clearFormat() {
    this.__ranges.forEach(r => r.clearFormat());
    return this;
  }

  clearNote() {
    this.__ranges.forEach(r => r.clearNote());
    return this;
  }

  removeCheckboxes() {
    this.__ranges.forEach(r => r.removeCheckboxes());
    return this;
  }

  setBorder(...args) {
    this.__ranges.forEach(r => r.setBorder(...args));
    return this;
  }

  setFontColor(color) {
    this.__ranges.forEach(r => r.setFontColor(color));
    return this;
  }

  setFontFamily(fontFamily) {
    this.__ranges.forEach(r => r.setFontFamily(fontFamily));
    return this;
  }

  setFontLine(fontLine) {
    this.__ranges.forEach(r => r.setFontLine(fontLine));
    return this;
  }

  setFontSize(size) {
    this.__ranges.forEach(r => r.setFontSize(size));
    return this;
  }

  setFontStyle(fontStyle) {
    this.__ranges.forEach(r => r.setFontStyle(fontStyle));
    return this;
  }

  setFontWeight(fontWeight) {
    this.__ranges.forEach(r => r.setFontWeight(fontWeight));
    return this;
  }

  setFormula(formula) {
    this.__ranges.forEach(r => r.setFormula(formula));
    return this;
  }

  setFormulaR1C1(formula) {
    this.__ranges.forEach(r => r.setFormulaR1C1(formula));
    return this;
  }

  setHorizontalAlignment(alignment) {
    this.__ranges.forEach(r => r.setHorizontalAlignment(alignment));
    return this;
  }

  setNote(note) {
    this.__ranges.forEach(r => r.setNote(note));
    return this;
  }

  setNumberFormat(numberFormat) {
    this.__ranges.forEach(r => r.setNumberFormat(numberFormat));
    return this;
  }

  setTextDirection(direction) {
    this.__ranges.forEach(r => r.setTextDirection(direction));
    return this;
  }

  setTextRotation(degrees) {
    this.__ranges.forEach(r => r.setTextRotation(degrees));
    return this;
  }

  setValue(value) {
    this.__ranges.forEach(r => r.setValue(value));
    return this;
  }

  setVerticalAlignment(alignment) {
    this.__ranges.forEach(r => r.setVerticalAlignment(alignment));
    return this;
  }

  setVerticalText(isVertical) {
    this.__ranges.forEach(r => r.setVerticalText(isVertical));
    return this;
  }

  setWrap(isWrapEnabled) {
    this.__ranges.forEach(r => r.setWrap(isWrapEnabled));
    return this;
  }

  setWrapStrategy(strategy) {
    this.__ranges.forEach(r => r.setWrapStrategy(strategy));
    return this;
  }

  trimWhitespace() {
    this.__ranges.forEach(r => r.trimWhitespace());
    return this;
  }

  uncheck() {
    this.__ranges.forEach(r => r.uncheck());
    return this;
  }

  toString() {
    return 'RangeList'
  }

  setShowHyperlink(showHyperlink) {
    this.__ranges.forEach(r => r.setShowHyperlink(showHyperlink));
    return this;
  }

  /**
   * getRanges() https://developers.google.com/apps-script/reference/spreadsheet/range-list#getranges
   * Returns a list of one or more Range instances in the same sheet.
   */
  getRanges() {
    return this.__ranges
  }

  check() {
    this.__ranges.forEach(r => r.check())
    return this
  }

  insertCheckboxes(...args) {
    this.__ranges.forEach(r => r.insertCheckboxes(...args));
    return this;
  }

  setBackground(color) {
    this.__ranges.forEach(r => r.setBackground(color))
    return this
  }

  setBackgroundRGB(red, green, blue) {
    this.__ranges.forEach(r => r.setBackgroundRGB(red, green, blue))
    return this
  }


}