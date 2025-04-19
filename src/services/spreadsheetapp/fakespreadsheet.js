import { Proxies } from '../../support/proxies.js'
import { FakeSheet, newFakeSheet } from './fakesheet.js'
import { notYetImplemented, minSheetFields } from '../../support/helpers.js'
import { FakeSheetRange } from './fakesheetrange.js'
import { Utils } from "../../support/utils.js"
const { is, signatureArgs } = Utils
/**
 * @file
 * @imports ../typedefs.js
 */

/**
 * create a new FakeSpreadsheet instance
 * @param  {...any} args 
 * @returns {FakeSpreadsheet}
 */
export const newFakeSpreadsheet = (...args) => {
  return Proxies.guard(new FakeSpreadsheet(...args))
}


/**
 * basic fake FakeSpreadsheet
 * @class FakeSpreadsheet
 * @returns {FakeSpreadsheet}
 */
export class FakeSpreadsheet {

  constructor(file) {

    // when we insert/delete sheets row/cols we update this metadata too
    this.__meta = file

    // may of these props can be picked up from the Drive API, so we'll look as a file too
    this.__file = DriveApp.getFileById(file.spreadsheetId)

    const props = ['toString',
      'getSpreadsheetTheme',
      'setActiveSheet',
      'getActiveSheet',
      'getBandings',
      'getDataSources',
      'addCollaborator',
      'updateMenu',
      'refreshAllDataSources',
      'getSpreadsheetTimeZone',
      'setSpreadsheetTimeZone',
      'findSheet',
      'getCollaborators',
      'getChanges',
      'createTextFinder',
      'getProtections',
      'findSheetByName',
      'removeCollaborator',
      'getSpreadsheetLocale',
      'setAnonymousAccess',
      'addDeveloperMetadata',
      'resetSpreadsheetTheme',
      'renameActiveSheet',
      'insertDataSourceSheet',
      'removeNamedRange',
      'getRangeByName',
      'moveChartToObjectSheet',
      'deleteRows',
      'addCollaborators',
      'deleteSheet',
      'moveActiveSheet',
      'isAnonymousView',
      'duplicateActiveSheet',
      'getFormUrl',
      'getNamedRanges',
      'deleteActiveSheet',
      'setNamedRange',

      'setSpreadsheetLocale',
      'getDataSourceSheets',
      'setSpreadsheetTheme',
      'isAnonymousWrite',
      'getDeveloperMetadata',
      'addMenu',
      'removeMenu',
      'inputBox',
      'setMaxIterativeCalculationCycles',
      'getMaxIterativeCalculationCycles',
      'waitForAllDataExecutionsCompletion',
      'msgBox',
      'toast',
      'show',
      'getIterativeCalculationConvergenceThreshold',
      'setIterativeCalculationConvergenceThreshold',
      'setRecalculationInterval',
      'setIterativeCalculationEnabled',
      'isIterativeCalculationEnabled',
      'insertSheetWithDataSourceTable',
      'createDeveloperMetadataFinder',
      'getDataSourceRefreshSchedules',
      'getPredefinedSpreadsheetThemes',
      'setName',
      'copy',
      'rename',
      'isReadable',
      'isWritable',
      'getSelection',
      'setActiveRangeList',
      'setActiveRange',
      'getActiveRangeList',
      'getCurrentCell',
      'setCurrentCell',
      'getActiveRange',
      'deleteRow',
      'hideRow',
      'appendRow',
      'getSheetProtection',
      'unhideRow',
      'insertRowsAfter',
      'revealRow',
      'setSheetPermissions',
      'insertColumnAfter',
      'setFrozenColumns',
      'getFrozenRows',
      'setFrozenRows',
      'isRowHiddenByFilter',
      'insertRowsBefore',
      'isRowHiddenByUser',
      'setActiveCell',
      'getSheetValues',
      'setSheetProtection',
      'getDataSourceTables',
      'insertColumnsAfter',
      'hideColumn',
      'autoResizeColumn',
      'getFrozenColumns',
      'unhideColumn',
      'insertColumnsBefore',
      'setActiveSelection',
      'getDataSourceFormulas',
      'insertImage',
      'getSheetPermissions',
      'insertColumnBefore',

      'isColumnHiddenByUser',
      'getRangeList',
      'insertRowBefore',
      'insertRowAfter',

      'revealColumn',
      'getActiveCell',
      'getDataSourcePivotTables',
      'deleteColumns',
      'getActiveSelection',
      'deleteColumn',
      'getImages',
      'find',
      'sort',
      'addEditor',
      'addEditors',
      'addViewers',
      'addViewer',
      'removeViewer',
      'removeEditor',

      // these convert to a pdf so we'll need to figure out how to do that
      // probably using the Drive export
      'getAs',
      'getBlob']

    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented()
      }
    })
  }

  __updateMeta (file) {
    this.__meta = file
  }

  /**
   * get sheetlevel meta data for  given ranges
   * @param {FakeSheetRange} range 
   * @param {string} fields to get
   * @return {object} data
   */
  __getSheetMetaProps = (ranges, fields) => {
    const data = Sheets.Spreadsheets.get(this.getId(), { ranges, fields })
    return data
  }

  /**
   * TODO - does this apply to the active sheet or the 1st sheet?
   * @returns {FakeSheet}
   */
  __getFirstSheet() {
    return this.getSheets()[0]
  }

  /**
   * get spreadsesheetlevel meta 
   * @param {string} fields to get
   * @return {object} data
   */
  __getMetaProps(fields) {
    const data = Sheets.Spreadsheets.get(this.getId(), { fields })
    return data
  }

  /**
   * getViewers() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getviewers
   * Gets the list of viewers and commenters for this Spreadsheet.
   * @returns {FakeUser[]} the file viewers
   */
  getViewers() {
    return this.__file.getViewers()
  }
  /**
   * getEditors() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#geteditors
   * Gets the list of editors for this Spreadsheet.
   * @returns {FakeUser[]} the file editors
   */
  getEditors() {
    return this.__file.getEditors()
  }

  /**
   * getOwner() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getowner
   * Returns the owner of the document, or null for a document in a shared drive.
   * @returns {FakeUser}
   */
  getOwner() {
    return this.__file.getOwner()
  }

  /**
   * dont know the exact status of this one - TODO keep an eye on if it gets activated in gas
   */
  isAnonymousView() {
    // weird right ? but that's what it does on gas
    throw new Error(`The api method 'isAnonymousView' is not available yet in the new version of Google Sheets`)
  }

  /**
   * getRecalculationInterval() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getrecalculationinterval
   * Returns the calculation interval for this spreadsheet.
   * @returns {import('../typedefs.js').RecalculationInterval}  
   */

  getRecalculationInterval() {
    return this.__getMetaProps("properties.autoRecalc").properties.autoRecalc
  }

  /**
   * getLastColumn() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getlastcolumn
   * Returns the position of the last column that has content.
   * @return {number} 
   */
  getLastColumn() {
    return this.__getFirstSheet().getLastColumn()
  }
  /**
   * getLastRow() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getlastrow
   * Returns the position of the last row that has content.
   */
  getLastRow() {
    return this.__getFirstSheet().getLastRow()
  }
  /**
   * getDataRange() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getdatarange
   * Returns a Range corresponding to the dimensions in which data is present.
   * @returns {FakeSheetRange}
   */
  getDataRange() {
    return this.__getFirstSheet().getDataRange()
  }

  /**
   * getColumnWidth(columnPosition) https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getcolumnwidthcolumnposition
   * Gets the width in pixels of the given column.
   * @param {number} columnPosition 
   * @returns {number} pixels
   */
  getColumnWidth(column) {
    return this.__getFirstSheet().getColumnWidth(column)
  }

  /**
   * getRowHeight(rowPosition) https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getrowheightrowposition
   * Gets the height in pixels of the given row.
   * @param {number} rowPosition 
   * @returns {number} pixels
  */
  getRowHeight(row) {
    return this.__getFirstSheet().getRowHeight(row)
  }

  /**
   *  @return {string} the spreadsheet id
   */
  getId() {
    return this.__meta.spreadsheetId
  }
  /* this one seems deprecated - same as get id
   *  @return {string} the spreadsheet id
   */
  getKey() {
    return this.getId()
  }
  /**
   *  @return {string} the spreadsheet name
   */
  getName() {
    return this.__meta.properties.title
  }
  /**
   * @return {number} number of sheets in the spreadsheet
   */
  getNumSheets() {
    return this.__meta.sheets.length
  }
  /**
   * @return {FakeSheets[]} the sheets in the spreadsheet
   */
  getSheets() {
    return this.__meta.sheets.map(f => newFakeSheet(f.properties.sheetId, this))
  }
  __getSheetMeta(id) {
    return this.__meta.sheets.find(f => f.properties.sheetId === id)
  }
   
  /**
   * @return {string} the spreadsheet url
   */
  getUrl() {
    return this.__meta.spreadsheetUrl
  }
  /**
   * Gets the sheet with the given ID.
   * @param {number} id The ID of the sheet to get.
   * @return {FakeSheet|null} the sheet in the spreadsheet
   */
  getSheetById(id) {
    const sheets = this.getSheets()
    return sheets.find(f => f.__sheetId === id) || null
  }
  /**
   * Returns a sheet with the given name..
   * @param {string} name The ID of the sheet to get.
   * @return {FakeSheet|null} the sheet in the spreadsheet
   */
  getSheetByName(name) {
    const sheets = this.getSheets()
    return sheets.find(f => f.getName() === name) || null
  }
  /**
   * Returns id of first sheet.
   * this is kind of a nonsense method as the answer should always be the id of the first sheet
   * the apps script docs are misleading
   * @return {number} the first sheet id in the spreadsheet
   */
  getSheetId() {
    return this.__getFirstSheet().getSheetId()
  }
  /**
   * Returns name of first sheet.
   * this is kind of a nonsense method as the answer should always be the id of the first sheet
   * the apps script docs are misleading
   * @return {id} the first sheet name in the spreadsheet
   */
  getSheetName() {
    return this.__getFirstSheet().getName()
  }
  /**
   * setColumnWidth(columnPosition, width) https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#setcolumnwidthcolumnposition,-width
   * @param {number} columnPosition	The position of the given column to set.
   * @param {number} width  The width in pixels to set it to
   * @param {setColumnWidth(columnPosition, width)} range 
   * @returns {FakeSheet}
   */
  setColumnWidth(column, width) {
    return this.__getFirstSheet().setColumnWidth(column, width)
  }

  /**
   * setRowHeight(rowPosition, height) https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#setrowheightrowposition,-height
   * Sets the row height of the given row in pixels.
   * @param {} range 
   * @returns {FakeSheet}
   */
  setRowHeight(row, height) {
    return this.__getFirstSheet().setRowHeight(row, height)
  }

  /**
   * insertSheet() nserts a new sheet into the spreadsheet https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#insertsheet
   * TODO The new sheet becomes the active sheet.
   * TODO which options are valid ? so far i can only see template sheet - 
   * for this we need to find and handle template sheet serializaton beore pasing to advanced sheets
   * @param {number|object|string} [indexOrOptionsOrNameA] the index or options orname or nothing for all defaults
   * @param {number|object|string} [indexOrOptionsOrNameB] sheet index or options 
   * @param {object} [onlyOptions] the options
   */
  insertSheet(indexOrOptionsOrNameA, indexOrOptionsOrNameB, options) {
    const { nargs, matchThrow } = signatureArgs(arguments, "insertSheet")

    // The index of the newly created sheet. To insert a sheet as the first one in the spreadsheet, set it to 0.
    let sheetIndex = null
    let sheetName = null
    let sheetOptions = null

    if (!nargs) {
      // use defaults
    }

    else if (nargs === 1) {
      // insertSheet(sheetIndex) 
      // insertSheet(options)
      // insertSheet(sheetName)
      if (is.number(indexOrOptionsOrNameA)) {
        sheetIndex = indexOrOptionsOrNameA
      } else if (is.object(indexOrOptionsOrNameA)) {
        sheetOptions = indexOrOptionsOrNameA
      } else if (is.string(indexOrOptionsOrNameA)) {
        sheetName = indexOrOptionsOrNameA
      } else {
        matchThrow()
      }

    } else if (nargs === 2) {
      // insertSheet(sheetName, sheetIndex)
      // insertSheet(sheetName, options)
      // insertSheet(sheetIndex, options)
      if (is.number(indexOrOptionsOrNameA) && is.object(indexOrOptionsOrNameB)) {
        sheetIndex = indexOrOptionsOrNameA
        sheetOptions = indexOrOptionsOrNameB
      } else if (is.string(indexOrOptionsOrNameA) && is.object(indexOrOptionsOrNameB)) {
        sheetName = indexOrOptionsOrNameA
        sheetOptions = indexOrOptionsOrNameB
      } else if (is.string(indexOrOptionsOrNameA) && is.number(indexOrOptionsOrNameB)) {
        sheetName = indexOrOptionsOrNameA
        sheetIndex = indexOrOptionsOrNameB
      } else {
        matchThrow()
      }

    } else if (nargs === 3) {
      // insertSheet(sheetIndex, sheetName, options)
      if (!is.object(onlyOptions)) {
        matchThrow()
      }
      sheetOptions = onlyOptions
    }
    else {
      matchThrow()
    }

    // TODO validate options as they could be Fake objects needing serialized !!
    if (sheetOptions) {
      throw `handling options not yet implemented`
    }

    const pack = {
      properties: {
        sheetType: "GRID"
      }
    }
    if (is.number(sheetIndex)) {
      pack.properties.index = sheetIndex
    }
    if (sheetName) {
      pack.properties.title = sheetName
    }

    let requests = [{
      addSheet: pack
    }]

    // let sheets handle errors
    const result = Sheets.Spreadsheets.batchUpdate({requests}, this.getId(), { ss: true })
    const sheet = new FakeSheet(result.replies[0].addSheet.properties.sheetId, this)

    // there will have been disrupton, so we need to reset the spreadsheet metadata
    this.__disruption()

    return sheet
   /* 
    {"spreadsheetId":"1i4eEijAwm0b62iL_IEV8NUSZwlWPDP51thgAWQHGols","replies":[{"addSheet":{"properties":{"sheetId":630852383,"title":"Sheet2","index":1,"sheetType":"GRID","gridProperties":{"rowCount":1000,"columnCount":26}}}}]}
*/

  }

  __disruption () {
      this.__updateMeta(  Sheets.Spreadsheets.get(this.getId(), { fields: minSheetFields }, { ss: true }))
  }

  getRange(range) {
    // this should be in sheet1!a1:a2 format
    const parts = range.split('!')
    const sheet = parts.length === 2 ? this.getSheetByName(parts[0]) : this.getSheets()[0]
    const rangePart = parts.length === 2 ? parts[1] : parts[0]
    if (!rangePart || !sheet) {
      throw new Error(`Invalid range ${range}`)
    }
    return sheet.getRange(rangePart)
  }
}
