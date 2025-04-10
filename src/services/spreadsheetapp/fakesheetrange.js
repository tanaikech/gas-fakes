import { Proxies } from '../../support/proxies.js'
import { FakeSheet } from './fakesheet.js'
import { SheetUtils } from '../../support/sheetutils.js'
import is from '@sindresorhus/is'

import { notYetImplemented } from '../../support/helpers.js'

//TODO - deal with r1c1 style ranges
/**
 * @file
 * @imports ../typedefs.js
 */
// private properties are identified with leading __
// this will signal to the proxy handler that it's okay to set them
/**
 * create a new FakeSheet instance
 * @param  {...any} args 
 * @returns {FakeSheetRange}
 */
export const newFakeSheetRange = (...args) => {
  return Proxies.guard(new FakeSheetRange(...args))
}

/**
 * basic fake FakeSheetRange
 * @class FakeSheetRange
 */
export class FakeSheetRange {

  /**
   * @constructor
   * @param {import('../typedefs.js').GridRange} gridRange 
   * @param {FakeSheet} sheet the sheet
   * @returns {FakeSheetRange}
   */
  constructor(gridRange, sheet) {

    this.__gridRange = gridRange
    this.__sheet = sheet
    const props = [

      'removeDuplicates',
      'getMergedRanges',
      'setBackgroundObjects',
      'setFontColorObjects',
      'getDataValidation',
      'getDataValidations',
      'setDataValidations',
      'clearDataValidations',
      'protect',
      'setDataValidation',
      'getBackground',
      'getBorder',
      'getTextDirection',
      'setTextDirection',
      'getTextStyle',
      'getFontWeight',
      'getFontFamilies',
      'setFontWeight',
      'getFormulas',
      'setBackground',
      'setHorizontalAlignments',
      'getHorizontalAlignments',
      'createDataSourcePivotTable',
      'setFontLines',
      'getBorders',
      'activate',
      'breakApart',
      'deleteCells',
      'getNextDataCell',
      'getDataRegion',
      'getFormulaR1C1',
      'getFormulasR1C1',
      'getDataSourceFormula',
      'getNumberFormats',
      'getBackgroundColors',
      'insertCells',
      'setFormulas',
      'setFormulaR1C1',
      'setFormulasR1C1',
      'setBackgroundColors',
      'getDisplayValue',
      'getDisplayValues',
      'mergeAcross',
      'mergeVertically',
      'isPartOfMerge',
      'setBackgroundObject',
      'setBackgrounds',
      'getBackgroundObject',
      'getBackgrounds',
      'getBackgroundObjects',
      'setBackgroundRGB',
      'setBorder',
      'activateAsCurrentCell',
      'setFontColor',
      'setFontColorObject',
      'setFontColors',
      'setFontFamilies',
      'setFontLine',
      'setFontSizes',
      'setFontStyle',
      'setFontStyles',
      'setFontWeights',
      'setNumberFormats',
      'setVerticalAlignments',
      'setWrap',
      'setWraps',
      'copyValuesToRange',
      'copyFormatToRange',
      'getGridId',
      'getFontColor',
      'getFontColorObject',
      'getFontColors',
      'getFontColorObjects',
      'getFontLine',
      'getFontLines',
      'getFontSizes',
      'getFontStyle',
      'setComments',
      'getFontWeights',
      'getHorizontalAlignment',
      'getVerticalAlignments',
      'getWrap',
      'getWraps',
      'randomize',
      'isStartColumnBounded',
      'isStartRowBounded',
      'isEndColumnBounded',
      'isEndRowBounded',
      'autoFill',
      'autoFillToNeighbor',
      'setShowHyperlink',
      'getTextRotation',
      'getTextRotations',
      'setTextRotation',
      'setTextRotations',
      'setVerticalText',
      'setTextDirections',
      'getFontStyles',
      'setWrapStrategies',
      'setWrapStrategy',
      'applyColumnBanding',
      'applyRowBanding',
      'splitTextToColumns',
      'getWrapStrategy',
      'getWrapStrategies',
      'createPivotTable',
      'createDataSourceTable',
      'shiftRowGroupDepth',
      'shiftColumnGroupDepth',
      'expandGroups',
      'collapseGroups',
      'getRichTextValue',
      'getRichTextValues',
      'setRichTextValue',
      'setRichTextValues',
      'getTextStyles',
      'setTextStyles',
      'uncheck',
      'insertCheckboxes',
      'removeCheckboxes',
      'isChecked',
      'trimWhitespace',
      'getTextDirections',
      'setValues',
      'copyTo',
      'setTextStyle',
      'getVerticalAlignment',
      'getComments',
      'clearComment',
      'getBandings',
      'addDeveloperMetadata',
      'getDeveloperMetadata',
      'createTextFinder',
      'moveTo',
      'setFontSize',
      'setNotes',
      'setNote',
      'clearNote',
      'getHeight',
      'createFilter',
      'setVerticalAlignment',
      'setHorizontalAlignment',
      'getNotes',
      'getWidth',
      'getCell',
      'getNote',
      'setFontFamily',
      'getDataSourceFormulas',
      'getDataSourceTables',
      'clearContent',
      'setBackgroundColor',
      'getBackgroundColor',
      'setFormula',
      'getFormula',
      'getDataSourceUrl',
      'getFontSize',
      'getDataTable',
      'clearFormat',
      'getFontFamily',
      'canEdit',
      'createDeveloperMetadataFinder',
      'getDataSourcePivotTables',
      'clear',
      'isBlank',
      'merge',
      'sort',
      'setValue',
      'check',
      'getFilter',
      'setNumberFormat',
      'getNumberFormat',
      'setComment',
      'getComment']
    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented()
      }
    })

  }
  __getWithSheet() {
    return this.__getRangeWithSheet(this)
  }

  __getTopLeft() {
    return this.offset(0, 0, 1, 1)
  }

  __getRangeWithSheet(range) {
    return `${range.__sheet.getName()}!${this.getA1Notation()}`
  }


  toString() {
    return 'Range'
  }

  getA1Notation() {
    return SheetUtils.toRange(
      this.__gridRange.startRowIndex + 1,
      this.__gridRange.startColumnIndex + 1,
      this.__gridRange.endRowIndex,
      this.__gridRange.endColumnIndex
    )
  }

  getEndColumn() {
    return this.__gridRange.endColumnIndex + 1
  }
  getEndRow() {
    return this.__gridRange.endRowIndex + 1
  }
  getSheet() {
    return this.__sheet
  }
  // row and columnindex are probably now deprecated in apps script
  // in any case, in gas they currently return the 1 based value, not the 0 based value as you'd expect
  // so the same as the getrow and getcolumn
  getRowIndex() {
    return this.getRow()
  }
  getColumnIndex() {
    return this.getColumn()
  }
  getRow() {
    return this.__gridRange.startRowIndex + 1
  }
  getColumn() {
    return this.__gridRange.startColumnIndex + 1
  }
  getLastRow() {
    return this.__gridRange.endRowIndex
  }
  getLastColumn() {
    return this.__gridRange.endColumnIndex
  }
  getNumRows() {
    return this.__gridRange.endRowIndex - this.__gridRange.startRowIndex
  }
  getNumColumns() {
    return this.__gridRange.endColumnIndex - this.__gridRange.startColumnIndex
  }
  getValues() {
    const { values } = Sheets.Spreadsheets.Values.get(this.__sheet.getParent().getId(), this.__getWithSheet())
    return values
  }
  getValue() {
    const { values } = Sheets.Spreadsheets.Values.get(this.__sheet.getParent().getId(), this.__getRangeWithSheet(this.__getTopLeft()))
    return values && values[0][0]
  }

  offset(rowOffset, columnOffset, numRows, numColumns) {
    const nargs = arguments.length
    const passedTypes = [is(rowOffset), is(columnOffset), is(numRows), is(numColumns)].slice(0, nargs)

    const matchThrow = (mess = "") => {
      throw new Error(`The parameters (${passedTypes}) don't match the method signature for ${mess}`)
    }
    // basic signature tests
    if (nargs > 4 || nargs < 2) matchThrow()
    if (!is.integer(rowOffset) || !is.integer(columnOffset)) matchThrow()
    if (nargs > 2 && !is.integer(numRows)) matchThrow()
    if (nargs > 3 && !is.integer(numColumns)) matchThrow()
    const gr = { ...this.__gridRange }

    numColumns = numColumns || this.getNumColumns()
    numRows = numRows || this.getNumRows()

    gr.startRowIndex += rowOffset
    gr.startColumnIndex += columnOffset
    gr.endRowIndex = gr.startRowIndex + numRows
    gr.endColumnIndex = gr.startColumnIndex + numColumns

    return newFakeSheetRange(gr, this.__sheet)

  }

}