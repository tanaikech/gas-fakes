import { Proxies } from '../../support/proxies.js'
import { FakeSheet } from './fakesheet.js'
import { SheetUtils } from '../../support/sheetutils.js'
import { Utils } from '../../support/utils.js'
import { setterList, attrGetList, valuesGetList, setterMaker, attrGens, valueGens, makeCellTextFormatData } from './sheetrangelists.js'
import {
  getGridRange,
  updateCells,
  isRange,
  makeGridRange,
  makeSheetsGridRange,
  batchUpdate,
  fillRange,
  arrMatchesRange
} from "./sheetrangehelpers.js"

const { is, rgbToHex, hexToRgb, stringer, outsideInt, capital, BLACKER } = Utils

import { notYetImplemented, signatureArgs } from '../../support/helpers.js'
import { FakeSpreadsheet } from './fakespreadsheet.js'
import { FakeDataValidation } from './fakedatavalidation.js'
import { isEnum } from '../../../test/testassist.js'

//TODO - deal with r1c1 style ranges

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
   * @param {GridRange} gridRange 
   * @param {FakeSheet} sheet the sheet
   * @returns {FakeSheetRange}
   */
  constructor(gridRange, sheet) {

    this.__apiGridRange = gridRange
    this.__sheet = sheet
    this.__hasGrid = Reflect.has(gridRange, "startRowIndex")

    // make the generatable functions
    attrGetList.forEach(target => attrGens(this, target))
    valuesGetList.forEach(target => valueGens(this, target))

    // list of not yet implemented methods
    const props = [
      'removeDuplicates',
      'getMergedRanges',
      'createDataSourcePivotTable',
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
      'activateAsCurrentCell',
      'setWrap',
      'setWraps',
      'copyValuesToRange',
      'copyFormatToRange',
      'setComments',
      'randomize',
      'isStartColumnBounded',
      'isStartRowBounded',
      'isEndColumnBounded',
      'isEndRowBounded',
      'autoFill',
      'autoFillToNeighbor',
      'setShowHyperlink',
      'setVerticalText',
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
      'trimWhitespace',
      'copyTo',
      'setTextStyle',
      'getComments',
      'clearComment',
      'getBandings',
      'addDeveloperMetadata',
      'getDeveloperMetadata',
      'createTextFinder',
      'moveTo',
      'setNotes',
      'setNote',
      'clearNote',
      'createFilter',
      'getDataSourceFormulas',
      'getDataSourceTables',
      'setBackgroundColor',
      'setFormula',
      'getDataSourceUrl',
      'getDataTable',
      'clearFormat',
      'createDeveloperMetadataFinder',
      'getDataSourcePivotTables',
      'clear',
      'merge',
      'sort',
      'check',
      'getFilter',
      // these are not documented, so will skip for now
      'setComment',
      'getComment'
      //--
    ]
    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented(f)
      }
    })

    setterList.forEach(f => {
      setterMaker({
        self: this,
        ...f,
        single: 'set' + capital(f.single || f.name),
        plural: f.plural || ('set' + capital(f.single || f.name) + 's'),
        fields: f.fields || `userEnteredFormat.textFormat.${f.name}`,
        maker: f.maker || makeCellTextFormatData,
        apiSetter: f.apiSetter || 'set' + capital(f.single || f.name)
      })
    })
  }

  /**
   * canEdit() https://developers.google.com/apps-script/reference/spreadsheet/range#canedit
   * Determines whether the user has permission to edit every cell in the range. The spreadsheet owner is always able to edit protected ranges and sheets.
   * @returns {boolean}
   */
  canEdit() {

    // we'll need to use the Drive API to get the permissions
    const owner = this.__getSpreadsheet().getOwner()
    const user = Session.getEffectiveUser()

    // the owner ? - can do anything
    if (user.getEmail() === owner.getEmail()) return true

    // edit privileges ? if yes then see if the range is protected
    const editors = this.__getSpreadsheet().getEditors()
    if (!editors.find(f => f.getEmail() === user.getEmail())) return null


  }

  clearContent() {
    return this.setValues([])
  }

  clearDataValidations() {
    this.setDataValidations(null)
  }
  /**
   * protect() https://developers.google.com/apps-script/reference/spreadsheet/sheet#protect
   * Creates an object that can protect the sheet from being edited except by users who have permission.
   * @return {FakeProtection}
   */
  protect() {
    return newFakeProtection(SpreadsheetApp.ProtectionType.RANGE, this)
  }

  getA1Notation() {
    // a range can have just a sheet with no cells
    if (!this.__hasGrid) return ""
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
    return this.getSheet().getSheetId()
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

    return newFakeSheetRange(gr, this.getSheet())

  }
  /**
   * Sets the background color of all cells in the range in CSS notation (such as '#ffffff' or 'white').
   * setBackground(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundcolor
   * @param {string} color A color code in CSS notation (such as '#ffffff' or 'white'); a null value resets the color.
   * @return {FakeSheetRange} self
   */
  setBackground(color) {
    return this.setBackgrounds(fillRange(this, color))
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
   * there is no 'setBorders' variant
   * setBorder(top, left, bottom, right, vertical, horizontal, color, style)
   * https://developers.google.com/apps-script/reference/spreadsheet/range#setbordertop,-left,-bottom,-right,-vertical,-horizontal,-color,-style
   * @param {Boolean} top		true for border, false for none, null for no change.
   * @param {Boolean} left		true for border, false for none, null for no change.
   * @param {Boolean} bottom	true for border, false for none, null for no change.
   * @param {Boolean} right	true for border, false for none, null for no change.
   * @param {Boolean} vertical true for internal vertical borders, false for none, null for no change.
   * @param {Boolean} horizontal	Boolean	true for internal horizontal borders, false for none, null for no change.
   * @param {Boolean}	[color] A color in CSS notation (such as '#ffffff' or 'white'), null for default color (black).
   * @param {Boolean} [SpreadsheetApp.BorderStyle]	A style for the borders, null for default style (solid).
   * @return {FakeSheetRange} self
   */
  setBorder(top, left, bottom, right, vertical, horizontal, color = null, style = null) {
    // there are 2 valid variants
    // one with each of the first 6 args
    // and another with all 8
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setDataValidations")

    if (nargs < 6) matchThrow()
    // check first 6 args
    const args = Array.from(arguments).slice(0, 6)
    if (!args.every(f => is.boolean(f) || is.null(f))) matchThrow()

    // if we have some other number of args
    if (nargs > 6) {
      if (nargs !== 8) matchThrow()
      if (!is.string(color) && !is.null(color)) matchThrow()
      if (!is.null(style) && !isEnum(style)) matchThrow()
    }

    // note that null means leave as it is, and a boolean false means get rid of it
    // in the sheets api, null means get rid of it, and a missing value means leave as it is
    // width is not an option on Apps Script, so we can just do inner or outer
    const innerBorder = Sheets.newBorder()
      .setColor(is.null(color) ? BLACKER : hexToRgb(color))
      .setStyle(is.null(style) ? "SOLID" : style.toString())

    // construct the request
    const ubr = Sheets.newUpdateBordersRequest().setRange(makeSheetsGridRange(this))

      // if it's mentioned then we have to turn the border either off or on
      ;['top', 'left', 'bottom', 'right'].forEach((f, i) => {
        if (!is.null(args[i])) {
          ubr['set' + capital(f)](args[i] ? innerBorder : null)
        }
      })

    // finally the vertical and horizontals
    if (!is.null(vertical)) {
      ubr.setInnerVertical(vertical ? innerBorder : null)
    }
    if (!is.null(horizontal)) {
      ubr.setInnerHorizontal(horizontal ? innerBorder : null)
    }

    batchUpdate({
      spreadsheetId: this.__getSpreadsheetId(),
      requests: [{ updateBorders: ubr }]
    })

    return this

  }

  /**
   * setDataValidation(rule) https://developers.google.com/apps-script/reference/spreadsheet/range#setdatavalidationrule
   * @param {FakeDataValidation} rule to apply to all
   * @return {FakeSheetRange} self
   */
  setDataValidation(rule) {
    return this.__setDataValidations(fillRange(this, rule))
  }

  /**
   * setDataValidations(rules)
   * @param {FakeDataValidation[][]} rules 
   * @return {FakeSheetRange} self
   */
  setDataValidations(rules) {
    return this.__setDataValidations(rules)
  }


  __setDataValidations(rules) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setDataValidations")
    const spreadsheetId = this.__getSpreadsheetId()

    // an 'official Sheets objects to do this kind of thing
    // it's actually more long winded than just constructing the requests manually
    // this is a clear
    if (is.null(rules)) {
      const setDataValidation = Sheets
        .newSetDataValidationRequest()
        .setRange(makeSheetsGridRange(this))
        .setRule(null);
      batchUpdate({ spreadsheetId, requests: [{ setDataValidation }] })
      return this
    }

    //---
    // this setting some values
    if (nargs !== 1 || !is.nonEmptyArray(rules)) matchThrow()
    if (!arrMatchesRange(this, rules, "object"))
      if (!rules.flat().every(f => f instanceof FakeDataValidation)) matchThrow()

    // TODO
    // if the rules are all different we need to create a separate request for each member of the range
    // all the same we can use a single fetch

    const requests = []

    for (let offsetRow = 0; offsetRow < this.getNumRows(); offsetRow++) {

      for (let offsetCol = 0; offsetCol < this.getNumColumns(); offsetCol++) {

        const range = this.offset(offsetRow, offsetCol, 1, 1)
        const dv = rules[offsetRow][offsetCol]
        const critter = dv.__getCritter()
        if (!critter) {
          throw new Error('couldnt find sheets api mapping for data validation rule', rule.getCriteriaType())
        }
        const field = critter.apiField || 'userEnteredValue'
        const type = critter.apiEnum || critter.name
        let values = dv.getCriteriaValues()
        let showCustomUi = null
        // but if its one of these - drop the last arg
        if (critter.name === "VALUE_IN_LIST" || critter.name === "VALUE_IN_RANGE") {
          if (values.length !== 2) {
            throw new Error(`Expected 2 args for ${critter.name} but got ${values.length}`)
          } else {
            showCustomUi = values[1]
            values = values.slice(0, -1)
          }
          // convert any ranges to formulas
          if (critter.name === "VALUE_IN_RANGE") {
            if (!isRange(values[0])) {
              throw `expected a range for ${critter.name} but got ${values[0]}`
            }
            values[0] = `=${values[0].__getWithSheet()}`
          }
        }

        // all values need to be converted to string 
        values = values.map(stringer).map(f => ({
          [field]: f
        }))

        const condition = {
          type,
          values
        }

        const rule = Sheets.newDataValidationRule()
          .setCondition(condition)
          .setStrict(!dv.getAllowInvalid())

        if (!is.null(showCustomUi)) rule.setShowCustomUi(showCustomUi)

        const setDataValidation = Sheets
          .newSetDataValidationRequest()
          .setRange(makeSheetsGridRange(range))
          .setRule(rule);

        requests.push({ setDataValidation })
      }
    }
    batchUpdate({ spreadsheetId, requests })
    return this

  }


  /**
   * Sets the background color of all cells in the range in CSS notation (such as '#ffffff' or 'white').
   * setBackgrounds(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundscolor
   * @param {string[][]} colors A two-dimensional array of colors in CSS notation (such as '#ffffff' or 'white'); null values reset the color.
   * @return {FakeSheetRange} self
   */
  setBackgrounds(colors) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setBackgrounds")
    if (nargs !== 1 || !arrMatchesRange(this, colors, "string")) matchThrow()

    const rows = colors.map(row => ({
      values: row.map(c => ({
        userEnteredFormat: {
          backgroundColor: hexToRgb(c)
        }
      }))
    }))
    const fields = 'userEnteredFormat.backgroundColor'
    return updateCells({ range: this, rows, fields, spreadsheetId: this.__getSpreadsheetId() })

  }

  /**
   * setBackgroundObjects(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundobjectscolor
   * Sets a rectangular grid of background colors (must match dimensions of this range).
   * @param {Color[][]} colors A two-dimensional array of colors; null values reset the color.
   * @returns {FakeSheetRange} self
   */
  setBackgroundObjects(colors) {

    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setBackgroundObjects", "Color")
    if (nargs !== 1 || !arrMatchesRange(this, colors, "object")) matchThrow()

    const rows = colors.map(row => ({
      values: row.map(c => this.__getColorItem(c))
    }))

    // see __getColorItem for how this allows mixing of both theme and rgb colors.
    const fields = 'userEnteredFormat.backgroundColorStyle'
    return updateCells({ range: this, rows, fields, spreadsheetId: this.__getSpreadsheetId() })

  }

  /**
  * Sets the font color in CSS notation (such as '#ffffff' or 'white')
  * setBackgroundObject(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundobjectcolor
  * @param {Color} color The background color to set; null value resets the background color.
  * @return {FakeSheetRange} self
  */
  setBackgroundObject(color) {
    return this.setBackgroundObjects(fillRange(this, color))
  }

  /**
   * Sets the font color in CSS notation (such as '#ffffff' or 'white')
   * setFontColor(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setfontcolorcolor
   * @param {string} color A color code in CSS notation (such as '#ffffff' or 'white'); a null value resets the color.
   * @return {FakeSheetRange} self
   */
  setFontColor(color) {
    // we can use the set colorObject here
    // TODO - handle null
    return this.setFontColorObject(is.null(color) ? null : SpreadsheetApp.newColor().setRgbColor(color).build())
  }

  /**
   * TODO -- dont support html color names yet
   * Sets a rectangular grid of font colors (must match dimensions of this range). The colors are in CSS notation (such as '#ffffff' or 'white').
   * setFontColors(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setfontcolorscolors
   * @param {string[][]} colors A two-dimensional array of colors in CSS notation (such as '#ffffff' or 'white'); null values reset the color.
   * @return {FakeSheetRange} self
   */
  setFontColors(colors) {
    // we can use the set colorObject here
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setFontColors")
    if (nargs !== 1 || !arrMatchesRange(this, colors)) matchThrow()
    return this.setFontColorObjects(colors.map(row => row.map(color => {
      return is.null(color) ? null : SpreadsheetApp.newColor().setRgbColor(color).build()
    })))
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
    return `${range.getSheet().getName()}!${range.getA1Notation()}`
  }


  /**
   * get the spreadsheet hosting this range
   * @return {FakeSpreadsheet}
   */
  __getSpreadsheet() {
    return this.getSheet().getParent()
  }
  /**
   * get the id of the spreadsheet hosting this range
   * returns {string}
   */
  __getSpreadsheetId() {
    return this.__getSpreadsheet().getId()
  }



  /**
   * sometimes a range has no  grid range so we need to fake one
   */
  get __gridRange() {
    return getGridRange(this)
  }

  __toGridRange(range = this) {
    const gr = makeGridRange(range)

    // convert to a sheets style
    return Sheets.newGridRange(gr)
      .setSheetId(gr.sheetId)
      .setStartRowIndex(gr.startRowIndex)
      .setStartColumnIndex(gr.startColumnIndex)
      .setEndRowIndex(gr.endRowIndex)
      .setEndColumnIndex(gr.endColumnIndex)
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
    Sheets.Spreadsheets.Values.batchUpdate(request, this.__getSpreadsheetId())
    return this
  }

}