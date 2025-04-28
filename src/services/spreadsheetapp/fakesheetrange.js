import { Proxies } from '../../support/proxies.js'
import { FakeSheet } from './fakesheet.js'
import { SheetUtils } from '../../support/sheetutils.js'
import { Utils } from '../../support/utils.js'
import { newFakeColorBuilder } from '../commonclasses/fakecolorbuilder.js'

const { is, rgbToHex, hexToRgb, getPlucker } = Utils
const WHITE ='#ffffff'
const BLACK ='#000000'

import { notYetImplemented, signatureArgs } from '../../support/helpers.js'

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


    // insert a method to get the required attributes, bith single and array version
    const attrGens = (target) => {

      // sometimes the returned values may need tweaked/converted
      const cleaner = target.cleaner || ((f) => f)

      // curry a getter
      const getters = (range) => getRowDataAttribs({
        cleaner,
        range,
        defaultValue: target.defaultValue,
        props: target.props
      })

      // both a single and collection version
      this[target.name + 's'] = () => getters(this)
      this[target.name] = () => {
        const values = getters(this.__getTopLeft())
        return (values && values[0] && values[0][0]) || cleaner(target.defaultValue)
      }

    }

    // shared function to get attributes that use spreadsheets.get
    const getRowDataAttribs = ({ range = this, props, defaultValue, cleaner }) => {

      // get the collection of rows with data for the required properties
      const { sheets } = Sheets.Spreadsheets.get(this.__sheet.getParent().getId(), {
        ranges: [this.__getRangeWithSheet(range)],
        fields: `sheets.data.rowData.values${props}`
      })

      const { rowData } = sheets[0]?.data[0]

      // then we have to shape some default values
      if (!rowData) {
        return Array.from({ length: range.getNumRows() }).fill(Array.from({ length: range.getNumColumns() }).fill(defaultValue).map(cleaner))
      }

      // pluck each cell
      // extract the required props to an array
      const plucker = getPlucker(props, defaultValue)
      return rowData.map(row => row.values.map(plucker).map(cleaner))
    }


    // generate methods for similar code
    const attrGetList = [{
      name: 'getNumberFormat',
      props: '.userEnteredFormat.numberFormat',
      defaultValue: "0.###############"
    }, {
      name: 'getVerticalAlignment',
      props: '.userEnteredFormat.verticalAlignment',
      defaultValue: "bottom"
    }, {
      name: 'getHorizontalAlignment',
      props: '.userEnteredFormat.horizontalAlignment',
      defaultValue: "general"
    }, {
      name: 'getBackground',
      props: '.userEnteredFormat.backgroundColor',
      defaultValue: { red: 1, green: 1, blue: 1 },
      cleaner: (f) => is.null(f) ? WHITE : rgbToHex(f.red, f.green, f.blue)
    }, {
      name: 'getFontWeight',
      props: '.userEnteredFormat.textFormat.bold',
      defaultValue:false,
      cleaner: (f) => f ? 'bold' : 'normal'
    }, {
      name: 'getBorder',
      props: '.userEnteredFormat.borders',
      defaultValue:null,
      cleaner: (f=> {
        console.log (f)
        return f
      })
    }]
    attrGetList.forEach(attrGens)


    // list of not yet implemented methods
    const props = [
      'removeDuplicates',
      'getMergedRanges',

      'setFontColorObjects',
      'getDataValidation',
      'getDataValidations',
      'setDataValidations',
      'clearDataValidations',
      'protect',
      'setDataValidation',

      'getTextDirection',
      'setTextDirection',
      'getTextStyle',
   
      'getFontFamilies',
      'setFontWeight',

      'setHorizontalAlignments',

      'createDataSourcePivotTable',
      'setFontLines',

      'activate',
      'breakApart',
      'deleteCells',
      'getNextDataCell',
      'getDataRegion',
      'getFormulaR1C1',
      'getFormulasR1C1',
      'getDataSourceFormula',

      'getBackgroundColors',
      'insertCells',
      'setFormulas',
      'setFormulaR1C1',
      'setFormulasR1C1',
      'setBackgroundColors',
      'mergeAcross',
      'mergeVertically',
      'isPartOfMerge',


      'getBackgroundObject',
      'getBackgroundObjects',

      'setBorder',
      'activateAsCurrentCell',

      'setFontColorObject',

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

      'getFontColorObject',
  
      'getFontColorObjects',
      'getFontLine',
      'getFontLines',
      'getFontSizes',
      'getFontStyle',
      'setComments',


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

      'check',
      'getFilter',
      'setNumberFormat',

      'setComment',
      'getComment']
    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented(f)
      }
    })

  }



  clearContent() {
    return this.setValues([])
  }

  getA1Notation() {
    return SheetUtils.toRange(
      this.__gridRange.startRowIndex + 1,
      this.__gridRange.startColumnIndex + 1,
      this.__gridRange.endRowIndex,
      this.__gridRange.endColumnIndex
    )
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
  getColumn() {
    return this.__gridRange.startColumnIndex + 1
  }
  getColumnIndex() {
    return this.getColumn()
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
  getEndColumn() {
    return this.__gridRange.endColumnIndex + 1
  }
  getEndRow() {
    return this.__gridRange.endRowIndex + 1
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

  getLastColumn() {
    return this.__gridRange.endColumnIndex
  }
  getLastRow() {
    return this.__gridRange.endRowIndex
  }

  getNumColumns() {
    return this.__gridRange.endColumnIndex - this.__gridRange.startColumnIndex
  }
  getNumRows() {
    return this.__gridRange.endRowIndex - this.__gridRange.startRowIndex
  }
  getRow() {
    return this.__gridRange.startRowIndex + 1
  }
  // row and columnindex are probably now deprecated in apps script
  // in any case, in gas they currently return the 1 based value, not the 0 based value as you'd expect
  // so the same as the getrow and getcolumn
  getRowIndex() {
    return this.getRow()
  }
  getSheet() {
    return this.__sheet
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
   * getWidth() https://developers.google.com/apps-script/reference/spreadsheet/range#getwidth
   * appears to be the same as getNumColumns()
   * Returns the width of the range in columns.
   * @returns {number} 
   */
  getWidth() {
    return this.getNumColumns()
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
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.offset")

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
  /**
   * Sets the background color of all cells in the range in CSS notation (such as '#ffffff' or 'white').
   * setBackground(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundcolor
   * @param {string} color A color code in CSS notation (such as '#ffffff' or 'white'); a null value resets the color.
   * @return {FakeSheetRange} self
   */
  setBackground(color) {
    return this.setBackgrounds(this.__fillRange({ value: color }))
  }

  /**
   * setBackgroundRGB(red, green, blue) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundrgbred,-green,-blue
   * @returns {FakeSheetRange} self
   */
  setBackgroundRGB(red, green, blue) {
    const outside = (n, l, h) => n < l || n > h
    const outsideInt = (n, l, h) => outside(n, l, h) || !is.integer(n)

    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setBackgroundRGB")
    if (nargs !== 3) matchThrow()
    if (outsideInt(red, 0, 255) || outsideInt(green, 0, 255) || outsideInt(blue, 0, 255)) matchThrow()
    return this.setBackground(rgbToHex(red / 255, green / 255, blue / 255))

  }

  /**
   * Sets the background color of all cells in the range in CSS notation (such as '#ffffff' or 'white').
   * setBackgrounds(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundscolor
   * @param {string[][]} colors A two-dimensional array of colors in CSS notation (such as '#ffffff' or 'white'); null values reset the color.
   * @return {FakeSheetRange} self
   */
  setBackgrounds(colors) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setBackgrounds")
    if (nargs !== 1 || !this.__arrMatchesRange(colors, "string")) matchThrow()

    const rows = colors.map(row => ({
      values: row.map(c => ({
        userEnteredFormat: {
          backgroundColor: hexToRgb(c)
        }
      }))
    }))
    const fields = 'userEnteredFormat.backgroundColor'
    const request = this.__getRequestUc(rows, fields)
    Sheets.Spreadsheets.batchUpdate({ requests: [request] }, this.__sheet.getParent().getId(), { ss: true })
    return this
  }

  /**
   * setBackgroundObjects(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundobjectscolor
   * Sets a rectangular grid of background colors (must match dimensions of this range).
   * @param {Color[][]} colors A two-dimensional array of colors; null values reset the color.
   * @returns {FakeSheetRange} self
   */
  setBackgroundObjects(colors) {

    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setBackgroundObjects", "Color")
    if (nargs !== 1 || !this.__arrMatchesRange(colors, "object")) matchThrow()

    const rows = colors.map(row => ({
      values: row.map(c => this.__getColorItem(c))
    }))

    // see __getColorItem for how this allows mixing of both theme and rgb colors.
    const fields = 'userEnteredFormat.backgroundColorStyle'
    const request = this.__getRequestUc(rows, fields)
    Sheets.Spreadsheets.batchUpdate({ requests: [request] }, this.__sheet.getParent().getId(), { ss: true })
    return this

  }

  /**
  * Sets the font color in CSS notation (such as '#ffffff' or 'white')
  * setBackgroundObject(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundobjectcolor
  * @param {Color} color The background color to set; null value resets the background color.
  * @return {FakeSheetRange} self
  */
  setBackgroundObject(color) {
    return this.setBackgroundObjects(this.__fillRange({ value: color }))
  }

  /**
   * Sets the font color in CSS notation (such as '#ffffff' or 'white')
   * setFontColor(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setfontcolorcolor
   * @param {string} color A color code in CSS notation (such as '#ffffff' or 'white'); a null value resets the color.
   * @return {FakeSheetRange} self
   */
  setFontColor(color) {
    return this.setFontColors(this.__fillRange({ value: color }))
  }

  /**
   * Sets a rectangular grid of font colors (must match dimensions of this range). The colors are in CSS notation (such as '#ffffff' or 'white').
   * setFontColors(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setfontcolorscolors
   * @param {string[][]} colors A two-dimensional array of colors in CSS notation (such as '#ffffff' or 'white'); null values reset the color.
   * @return {FakeSheetRange} self
   */
  setFontColors(colors) {

    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setFontColors")
    if (nargs !== 1 || !this.__arrMatchesRange(colors, "string")) matchThrow()

    const rows = colors.map(row => ({
      values: row.map(c => {
        return {
          userEnteredFormat: {
            textFormat: {
              foregroundColor: hexToRgb(c)
            }
          }
        }
      })
    }))


    const fields = 'userEnteredFormat.textFormat.foregroundColor'
    const request = this.__getRequestUc(rows, fields)
    Sheets.Spreadsheets.batchUpdate({ requests: [request] }, this.__sheet.getParent().getId(), { ss: true })
    return this
  }

  /** 
   * setValue(value) https://developers.google.com/apps-script/reference/spreadsheet/range#setvaluesvalues
   * @param {object} A value
   * @return {FakeSheetRange} this
   */
  setValue(value) {
    return this.__setValues({ values: [[value]], single: true })
  }

  /** 
   * setValues(values) https://developers.google.com/apps-script/reference/spreadsheet/range#setvaluesvalues
   * @param {object[][]} A two-dimensional array of values.
   * @return {FakeSheetRange} this
   */
  setValues(values) {
    return this.__setValues({ values })
  }

  toString() {
    return 'Range'
  }

  //-- private helpers

  __arrMatchesRange(arr, itemType) {
    if (!is.array(arr)) return false
    if (arr.length !== this.getNumRows()) return false
    if (arr.some(r => !is.array(r))) return false
    if (arr.some(r => r.length !== this.getNumColumns())) return false
    if (itemType && !arr.flat().every(f => is[itemType](f))) return false
    return true
  }


  __fillRange({ range = this, value }) {
    return Array.from({ length: range.getNumRows() }).fill(Array.from({ length: range.getNumColumns() }).fill(value))
  }


  __getColorItem = (color) => {
    // this can be a little complex since the color objects are allowed to be both rgb color and theme colors mixed
    const isTheme = (ob) => ob.getColorType().toString() === "THEME"
    const isRgb = (ob) => ob.getColorType().toString() === "RGB"
    const getItem = (ob) => {
      if (isTheme(ob)) {
        return themed(ob.asThemeColor().getThemeColorType().toString())
      } else if (isRgb(ob)) {
        return rgb(ob.asRgbColor().asHexString())
      } else {
        throw new Error('unexpected color value', ob)
      }
    }
    const themed = (value) => ({
      userEnteredFormat: {
        backgroundColorStyle: {
          themeColor: value
        }
      }
    })

    // although you'd expect this to be background rather than style, we can use backgroundColorStyle to allow the mixing of both theme and color
    const rgb = (value) => ({
      userEnteredFormat: {
        backgroundColorStyle: {
          rgbColor: hexToRgb(value)
        }
      }
    })
    return getItem(color)
  }



  __getRangeWithSheet(range) {
    return `${range.__sheet.getName()}!${this.getA1Notation()}`
  }


  /**
   * for use with updateCells
   * @returns {object}
   */
  __getRequestUc = (rows, fields) => {
    return {
      updateCells: {
        start: this.__getStartUc(),
        rows,
        fields
      }
    }
  }

  /**
   * for use with updateCells
   * @returns {object}
   */
  __getStartUc = () => {
    const gridRange = this.__gridRange
    const start = {
      sheetId: gridRange.sheetId,
      rowIndex: gridRange.startRowIndex,
      columnIndex: gridRange.startColumnIndex
    }
    return start
  }

  __getTopLeft() {
    return this.offset(0, 0, 1, 1)
  }
  __getValues({ range = this, options } = {}) {
    const { values } = Sheets.Spreadsheets.Values.get(this.__sheet.getParent().getId(), this.__getRangeWithSheet(range), options)
    return values
  }


  __getWithSheet() {
    return this.__getRangeWithSheet(this)
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

}