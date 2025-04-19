import { Proxies } from '../../support/proxies.js'
import { FakeSheet } from './fakesheet.js'
import { SheetUtils } from '../../support/sheetutils.js'
import { Utils } from '../../support/utils.js'


const { is, signatureArgs, rgbToHex } = Utils
const WHITE = '#ffffff'

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
      'getBorder',
      'getTextDirection',
      'setTextDirection',
      'getTextStyle',
      'getFontWeight',
      'getFontFamilies',
      'setFontWeight',
      'setBackground',
      'setHorizontalAlignments',

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
      'mergeAcross',
      'mergeVertically',
      'isPartOfMerge',
      'setBackgroundObject',
      'setBackgrounds',
      'getBackgroundObject',
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
      'copyTo',
      'setTextStyle',

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
      'createFilter',
      'setVerticalAlignment',
      'setHorizontalAlignment',
      'getNotes',
      'getNote',
      'setFontFamily',
      'getDataSourceFormulas',
      'getDataSourceTables',
      'clearContent',
      'setBackgroundColor',
      'getBackgroundColor',
      'setFormula',
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
  __getValues({ range = this, options } = {}) {
    const { values } = Sheets.Spreadsheets.Values.get(this.__sheet.getParent().getId(), this.__getRangeWithSheet(range), options)
    return values
  }

  /**
   * attribute helpers
   * need to deal with a response that looks like this
   * in response to a query that looks like this
   *  Sheets.Spreadsheets.get(spreadsheetId, {
      ranges: [range],
      fields: `sheets.data.rowData.values.${props}`,
    })
      we get this
{"sheets":[{"data":[{"rowData":[{"values":[{"effectiveFormat":{"horizontalAlignment":"LEFT"}},{"effectiveFormat":{"horizontalAlignment":"LEFT"}}]},{"values":[{"effectiveFormat":{"horizontalAlignment":"LEFT"}},{"effectiveFormat":{"horizontalAlignment":"LEFT"}}]},{"values":[{"effectiveFormat":{"horizontalAlignment":"LEFT"}},{"effectiveFormat":{"horizontalAlignment":"LEFT"}}]}]}]}]}
    sometimes the properties are not there and we have to use a default value
  */

  /**
   * called by each attribute get
   * __getRowDataAttribs 
   * @param {FakeSheetRange} [range=this] the range
   * @param {string} props the props to extract
   * @returns {*[]}
   */
  __getRowDataAttribs({ range = this, props, defaultValue }) {

    // get the collection of rows with data for the required properties
    const { sheets } = Sheets.Spreadsheets.get(this.__sheet.getParent().getId(), {
      ranges: [this.__getRangeWithSheet(range)],
      fields: `sheets.data.rowData.values.${props}`
    })

    const { rowData } = sheets[0]?.data[0]

    // then we have to shape some default values
    if (!rowData) {
      return Array.from({ length: range.getNumRows() }).fill(Array.from({ length: range.getNumColumns() }).fill(defaultValue))
    }

    // extract the required props to an array
    const pex = props.split(".")


    // plucker
    const getPex = (v) => {

      const px = pex.reduce((p, c) => {
        const t = p && p[c]
        return Utils.isNU(t) ? defaultValue : t
      }, v)
      return px
    }

    // pluck each cell
    return rowData.map(row => row.values.map(getPex))
  }

  __getBackgrounds({ range = this } = {}) {

    const rows = this.__getRowDataAttribs({
      range,
      props: 'effectiveFormat.backgroundColor',
      defaultValue: { red: 1, green: 1, blue: 1 }
    })

    const rgbs = rows.map(r => {
      // default background is white
      return r.map(f => {
        return is.null(f) ? WHITE : rgbToHex(f.red, f.green, f.blue)
      })
    })
    return rgbs
  }

  /**
   * getBackground() https://developers.google.com/apps-script/reference/spreadsheet/range#getbackground
   * Returns the background color of the top-left cell in the range (for example, '#ffffff').
   * @returns {string}
   */
  getBackground() {
    const values = this.__getBackgrounds({ range: this.__getTopLeft() })
    return (values && values[0] && values[0][0]) || WHITE
  }

  /**
   * getBackgrounds() https://developers.google.com/apps-script/reference/spreadsheet/range#getbackgrounds
   * Returns the background colors of the cells in the range (for example, '#ffffff').
   * @returns {string}
   */
  getBackgrounds() {
    return this.__getBackgrounds()
  }

  /**
   * getVerticalAlignments()  https://developers.google.com/apps-script/reference/spreadsheet/range#getverticalalignments
   * Returns the vertical alignments of the cells in the range.
   * @returns {string}
   */
  __getVerticalAlignments({ range = this } = {}) {
    return this.__getRowDataAttribs({
      props: 'effectiveFormat.verticalAlignment',
      defaultValue: "bottom",
      range
    })
  }

  /**
   * getVerticalAlignment() https://developers.google.com/apps-script/reference/spreadsheet/range#getverticalalignment
   * Returns the vertical alignment (top/middle/bottom) of the cell in the top-left corner of the range.
   * @returns {string}
   */
  getVerticalAlignment() {
    const values = this.__getVerticalAlignments({ range: this.__getTopLeft() })
    return (values && values[0] && values[0][0]) || ''
  }

  /**
   * getVerticalAlignments()  https://developers.google.com/apps-script/reference/spreadsheet/range#getverticalalignments
   * Returns the vertical alignments of the cells in the range.
   * @returns {string}
   */
  getVerticalAlignments() {
    return this.__getVerticalAlignments()
  }

  /**
   * __getHorizontalAlignment() https://developers.google.com/apps-script/reference/spreadsheet/range#gethorizontalalignment
   * Returns the horizontal alignment of the text (left/center/right) of the cell in the top-left corner of the range.
   * @returns {string}
   */
  __getHorizontalAlignments({ range = this } = {}) {
    return this.__getRowDataAttribs({
      props: 'effectiveFormat.horizontalAlignment',
      defaultValue: "general",
      range
    })
  }

  /**
   * getHorizontalAlignment() https://developers.google.com/apps-script/reference/spreadsheet/range#gethorizontalalignment
   * Returns the horizontal alignment of the text (left/center/right) of the cell in the top-left corner of the range.
   * @returns {string}
   */
  getHorizontalAlignment() {
    const values = this.__getHorizontalAlignments({ range: this.__getTopLeft() })
    return (values && values[0] && values[0][0]) || ''
  }

  /**
   * getHorizontalAlignments()  https://developers.google.com/apps-script/reference/spreadsheet/range#gethorizontalalignments
   * Returns the horizontal alignments of the cells in the range.
   * @returns {string}
   */
  getHorizontalAlignments() {
    return this.__getHorizontalAlignments()
  }


  /**
   * getValues() https://developers.google.com/apps-script/reference/spreadsheet/range#getvalues
   * Returns the rectangular grid of values for this range.
   * @returns {*[][]}
   */
  getValues() {
    return this.__getValues({ options: { valueRenderOption: 'UNFORMATTED_VALUE' } })
  }

  /**
   * getValue() https://developers.google.com/apps-script/reference/spreadsheet/range#getvalue
   * Returns the value of the top-left cell in the range. 
   * @returns {*}
   */
  getValue() {
    const values = this.__getValues({ range: this.__getTopLeft(), options: { valueRenderOption: 'UNFORMATTED_VALUE' } })
    return values && values[0][0]
  }

  /**
   * getDisplayValue() https://developers.google.com/apps-script/reference/spreadsheet/range#getdisplayvalue
   * The displayed value takes into account date, time and currency formatting
   * @returns {string} The displayed value in this cell.
   */
  getDisplayValue() {
    const values = this.__getValues({ range: this.__getTopLeft(), options: { valueRenderOption: 'FORMATTED_VALUE' } })
    return values && values[0][0]
  }

  /**
   * getDisplayValues() https://developers.google.com/apps-script/reference/spreadsheet/range#getdisplayvalues
   * The displayed value takes into account date, time and currency formatting,
   * @returns {string[][]} A two-dimensional array of values.
   */
  getDisplayValues() {
    return this.__getValues({ options: { valueRenderOption: 'FORMATTED_VALUE' } })
  }

  /**
   * getFormula() https://developers.google.com/apps-script/reference/spreadsheet/range#getdisplayvalue
   * Returns the formulas (A1 notation) for the cells in the range. Entries in the 2D array are empty strings for cells with no formula.
   * @returns {string} The formula value in this cell.
   */
  getFormula() {
    const values = this.__getValues({ range: this.__getTopLeft(), options: { valueRenderOption: 'FORMULA' } })
    return values && values[0][0]
  }

  /**
   * getFormulas() https://developers.google.com/apps-script/reference/spreadsheet/range#getdisplayvalue
   * Returns the formulas (A1 notation) for the cells in the range. Entries in the 2D array are empty strings for cells with no formula.
   * @returns {string[][]} — A two-dimensional array of formulas in string format.
   */
  getFormulas() {
    return this.__getValues({ options: { valueRenderOption: 'FORMULA' } })
  }

  /**
   * getCell(row, column) Returns a given cell within a range.
   * @param {number} row 1 based cell relative to range
   * @param {number} column 1 based cell relative to range
   * @return {FakeSheetRange}
   */
  getCell(row, column) {
    // let offset check args
    return this.offset(row - 1, column - 1, 1, 1)
  }
  /**
   * getGridId() https://developers.google.com/apps-script/reference/spreadsheet/range#getgridid
   * Returns the grid ID of the range's parent sheet. IDs are random non-negative int values.
   * gridid seems to be the same as the sheetid 
   * @returns {number}
   */
  getGridId() {
    return this.__sheet.getSheetId()
  }
  /**
   * getHeight() https://developers.google.com/apps-script/reference/spreadsheet/range#getheight
   * appears to be the same as getNumRows()
   * Returns the height of the range.
   * @returns {number} 
   */
  getHeight() {
    return this.getNumRows()
  }
  /**
   * getWidth() https://developers.google.com/apps-script/reference/spreadsheet/range#getwidth
   * appears to be the same as getNumColumns()
   * Returns the width of the range in columns.
   * @returns {number} 
   */
  getWidth() {
    return this.getNumColumns()
  }
  /** 
   * setValues(values) https://developers.google.com/apps-script/reference/spreadsheet/range#setvaluesvalues
   * @param {object[][]} A two-dimensional array of values.
   * @return {FakeSheetRange} this
   */
  setValues(values) {
    return this.__setValues({ values })
  }
  /** 
   * setValue(value) https://developers.google.com/apps-script/reference/spreadsheet/range#setvaluesvalues
   * @param {object} A value
   * @return {FakeSheetRange} this
   */
  setValue(value) {
    return this.__setValues({ values: [[value]], single: true })
  }

  __setValues({ values, single = false, options = { valueInputOption: "RAW" } }) {

    const range = single ? this.__getRangeWithSheet(this.__getTopLeft()) : this.__getWithSheet()
    const request = {
      ...options,
      data: [{
        majorDimension: "ROWS",
        range,
        values
      }]
    }
    Sheets.Spreadsheets.Values.batchUpdate(request, this.__sheet.getParent().getId())
    return this
  }

  /**
   * offset(rowOffset, columnOffset) https://developers.google.com/apps-script/reference/spreadsheet/range#offsetrowoffset,-columnoffset
   * Returns a new range that is offset from this range by the given number of rows and columns (which can be negative). 
   * The new range is the same size as the original range.
   * offsets are zero based
   * @param {number} rowOffset 
   * @param {number} columnOffset 
   * @param {number} numRows 
   * @param {number} numColumns 
   * @returns 
   */
  offset(rowOffset, columnOffset, numRows, numColumns) {
    // get arg types
    const { nargs, matchThrow } = signatureArgs(arguments, "offset")

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