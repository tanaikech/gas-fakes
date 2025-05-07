import { Proxies } from '../../support/proxies.js'
import { FakeSheet } from './fakesheet.js'
import { SheetUtils } from '../../support/sheetutils.js'
import { Utils } from '../../support/utils.js'
import { newFakeBorders } from '../commonclasses/fakeborders.js'
import { makeColorFromApi } from '../commonclasses/fakecolorbuilder.js'
import { newFakeWrapStrategy, isWrapped } from '../commonclasses/fakewrapstrategy.js'
import { newFakeTextRotation } from '../commonclasses/faketextrotation.js'
import { makeTextStyleFromApi } from '../commonclasses/faketextstylebuilder.js'


const { is, rgbToHex, hexToRgb, getPlucker, robToHex, outsideInt } = Utils

const WHITER = { red: 1, green: 1, blue: 1 }
const BLACKER = { red: 0, green: 0, blue: 0 }


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

const makeTemplate = ({ range, defaultValue, cleaner }) => {
  const template = Array.from({ length: range.getNumRows() })
    .fill(Array.from({ length: range.getNumColumns() })
      .fill(defaultValue))
  return cleaner ? template.map(cleaner) : template
}

// insert a method to get the required attributes, bith single and array version
// many methods can be genereated automatically
const attrGens = (self, target) => {

  // shared function to get attributes that use spreadsheets.get
  const getRowDataAttribs = ({ range = self, props, defaultValue, cleaner }) => {

    // get the collection of rows with data for the required properties
    const { sheets } = Sheets.Spreadsheets.get(self.__sheet.getParent().getId(), {
      ranges: [self.__getRangeWithSheet(range)],
      fields: `sheets.data.rowData.values${props}`
    })

    const { rowData } = sheets[0]?.data[0]
console.log (props, rowData, range.getA1Notation() )
    // somewtimes we get a jagged array that needs to be padded to the right length with default values
    const template = makeTemplate({ range, defaultValue, cleaner })
console.log (props, template )
    // if we got nothing, return the template of defaults
    if (!rowData) return template

    // pluck each cell
    // extract the required props to an array
    const plucker = getPlucker(props, defaultValue)

    // now replace the template with anything we got
    const rows = template.map((row, i) => {
      // use the template values if we've run out of data
      if (i >= rowData.length) return row
      return row.map((col, j) => {
        // use the col value if there is one
        return (rowData[i].values[j]) ? cleaner(plucker(rowData[i].values[j])) : col
      })
    })
    console.log (rows)
    return rows
    //return rowData.map(row => row.values.map(plucker).map(cleaner))
  }
  const cleaner = target.cleaner || (f => f)


  // curry a getter
  const getters = (range) => getRowDataAttribs({
    cleaner,
    range,
    defaultValue: target.defaultValue,
    props: target.props,
    reducer: target.reducer
  })

  // both a single and collection version
  // also some queries return a consolidated/reduced version
  if (!target.skipPlural) {
    const plural = target.plural || (target.name + 's')
    self[plural] = () => {
      const values = getters(self)
      return target.reducer ? target.reducer(values.flat()) : values
    }
  }

  if (!target.skipSingle) {
    self[target.name] = () => {
      const values = getters(self.__getTopLeft())
      console.log (target.name,values)
      return target.reducer?  values : (values && values[0] && values[0][0])
    }
  }

  return self
}

const valueGens = (self, target) => {

  const getData = ({ range, options }) => {
    const result = Sheets.Spreadsheets.Values.get(
      self.__sheet.getParent().getId(),
      self.__getRangeWithSheet(range),
      options
    )
    return result.values || []
  }

  // make a template to handle jagged arrays

  // both a single and collection version
  const plural = target.plural || (target.name + 's')
  const getters = (range) => {
    const values = getData({ range, options: target.options })
    /// TODO check if we ever get a jagged array back for values as we sometimes do for formats 
    // - if we do, we'll need to populate with the template
    let v = !values.length ? makeTemplate({ range, defaultValue: target.defaultValue }) : values
    if (target.cleaner) v = v.map(target.cleaner)
    if (target.reducer) v = target.reducer(v)
    return v
  }

  // normally we need both plural and single version - but this allows skipping if required
  if (!target.skipPlural) self[plural] = () => getters(self)
  if (!target.skipSingle) {
    self[target.name] = () => {
      // just get a single cell
      const r = getters(self.__getTopLeft())
      const v = target.reducer ? r : r[0][0]
      return v
    }
  }

  return self
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
  defaultValue: WHITER,
  cleaner: robToHex
}, {
  name: 'getFontWeight',
  props: '.userEnteredFormat.textFormat.bold',
  defaultValue: false,
  cleaner: (f) => f ? 'bold' : 'normal'
}, {
  name: 'getBorder',
  props: '.userEnteredFormat.borders',
  defaultValue: null,
  cleaner: (f => {
    return is.null(f) ? null : newFakeBorders(f)
  })
}, {
  name: 'getBackgroundObject',
  props: '.userEnteredFormat.backgroundColorStyle',
  defaultValue: { rgbColor: WHITER },
  cleaner: makeColorFromApi
}, {
  name: 'getFontColor',
  props: '.userEnteredFormat.textFormat.foregroundColor',
  defaultValue: BLACKER,
  cleaner: robToHex
}, {
  name: 'getFontColorObject',
  props: '.userEnteredFormat.textFormat.foregroundColorStyle',
  defaultValue: { rgbColor: BLACKER },
  cleaner: makeColorFromApi
}, {
  name: 'getFontFamily',
  props: '.userEnteredFormat.textFormat.fontFamily',
  defaultValue: 'Arial',
  plural: 'getFontFamilies'
}, {
  name: 'getFontSize',
  props: '.userEnteredFormat.textFormat.fontSize',
  defaultValue: 10,
}, {
  name: 'getWrapStrategy',
  props: '.userEnteredFormat.wrapStrategy',
  defaultValue: 'OVERFLOW_CELL',
  cleaner: newFakeWrapStrategy,
  plural: 'getWrapStrategies'
}, {
  name: 'getWrap',
  props: '.userEnteredFormat.wrapStrategy',
  defaultValue: 'OVERFLOW_CELL',
  cleaner: f => isWrapped(newFakeWrapStrategy(f))
}, {
  name: 'getTextRotation',
  props: '.userEnteredFormat.textRotation',
  defaultValue: { angle: 0, vertical: "NONE" },
  cleaner: f => newFakeTextRotation(f || { angle: 0, vertical: "NONE" })
}, {
  name: 'getTextStyle',
  props: '.userEnteredFormat.textFormat',
  defaultValue: { foregroundColor: { rgbColor: BLACKER } },
  cleaner: makeTextStyleFromApi
}, {
  name: 'getFontLine',
  props: '.userEnteredFormat.textFormat',
  defaultValue: { foregroundColor: { rgbColor: BLACKER } },
  cleaner: f => {
    console.log ('cleaning', f)
    const s = makeTextStyleFromApi(f)
    if (s.isStrikethrough()) return 'line-through'
    if (s.isUnderline()) return 'underline'
    return 'none'
  }
} , {
  name: 'isChecked',
  props: '(dataValidation,effectiveValue)',
  defaultValue: null,
  clean: (cell=> {
    // its a checkbox
    if(is.nonEmptyObject(cell) && is.nonEmptyObject (cell.condition) && cell.condition.type === "BOOLEAN") {
      return cell.effectiveValue
    } else {
      return null
    }
  }),
  // if there are any non checkboxes, return null, if all are true checkboxes return true, otherwose false
  reducer: (cells=>cells.some (is.null) ? null : cells.every(f=>f))
}]

const valuesGetList = [{
  name: 'getValue',
  options: { valueRenderOption: 'UNFORMATTED_VALUE' },
  defaultValue: ''
}, {
  name: 'getDisplayValue',
  options: { valueRenderOption: 'FORMATTED_VALUE' },
  defaultValue: ''
}, {
  name: 'getFormula',
  options: { valueRenderOption: 'FORMULA' },
  defaultValue: ''
}, {
  name: 'isBlank',
  options: { valueRenderOption: 'UNFORMATTED_VALUE' },
  defaultValue: '',
  reducer: (a) => a.flat().every(f => f === ''),
  skipPlural: true
}]


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

    // make the generatable functions
    attrGetList.forEach(target => attrGens(this, target))
    valuesGetList.forEach(target => valueGens(this, target))

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
      'insertCells',
      'setFormulas',
      'setFormulaR1C1',
      'setFormulasR1C1',
      'setBackgroundColors',
      'mergeAcross',
      'mergeVertically',
      'isPartOfMerge',
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
      'getFontStyle',
      'setComments',
      'randomize',
      'isStartColumnBounded',
      'isStartRowBounded',
      'isEndColumnBounded',
      'isEndRowBounded',
      'autoFill',
      'autoFillToNeighbor',
      'setShowHyperlink',
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

      'setFormula',
      'getDataSourceUrl',

      'getDataTable',
      'clearFormat',

      'canEdit',
      'createDeveloperMetadataFinder',
      'getDataSourcePivotTables',
      'clear',

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
   * these 2 dont exist in the documentation any more - assume they have been renamed as getBackground(s)
   */
  getBackgroundColor() {
    return this.getBackground()
  }
  getBackgroundColors() {
    return this.getBackgrounds()
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


  getEndColumn() {
    return this.__gridRange.endColumnIndex + 1
  }
  getEndRow() {
    return this.__gridRange.endRowIndex + 1
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

    numColumns = is.undefined(numColumns) ? this.getNumColumns() : numColumns
    numRows = is.undefined(numRows) ? this.getNumRows() : numRows

    if (!numRows) {
      throw new Error('The number of rows in the range must be at least 1')
    }
    if (!numColumns) {
      throw new Error('The number of columns in the range must be at least 1')
    }
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
    return `${range.__sheet.getName()}!${range.getA1Notation()}`
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