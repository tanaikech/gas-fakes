import { Proxies } from '../../support/proxies.js'
import { SheetUtils } from '../../support/sheetutils.js'
import { notYetImplemented, signatureArgs } from '../../support/helpers.js'
import { newFakeSheetRange } from './fakesheetrange.js'
import { newFakeSheetRangeList } from './fakesheetrangelist.js'
import { Utils } from "../../support/utils.js"
import { newFakeProtection } from '../commonclasses/fakeprotection.js'
const { is } = Utils


// private properties are identified with leading __
// this will signal to the proxy handler that it's okay to set them
/**
 * create a new FakeSheet instance
 * @param  {...any} args 
 * @returns {FakeSheet}
 */
export const newFakeSheet = (...args) => {
  return Proxies.guard(new FakeSheet(...args))
}

/**
 * basic fake FakeSheet
 * @class FakeSpreadsheet
 * @returns {FakeSheet}
 */
export class FakeSheet {

  constructor(sheetId, parent) {
    // although the sheet is correct at time of creation
    // its possible that the sheet content will have changed since it was created
    // so we store only the sheetID, then accessing the sheet goes via the parent to find
    // the latest content in the related sheet - see get __sheet later 
    this.__parent = parent
    this.__sheetId = sheetId

    const props = [
      'activate',
      'autoResizeColumns',
      'autoResizeRows',
      'setRowHeightsForced',
      'isRightToLeft',
      'setRightToLeft',
      'hasHiddenGridlines',
      'setHiddenGridlines',
      'setConditionalFormatRules',
      'getConditionalFormatRules',
      'getRowGroupControlPosition',
      'getColumnGroupControlPosition',
      'setRowGroupControlPosition',
      'setColumnGroupControlPosition',
      'expandRowGroupsUpToDepth',
      'expandColumnGroupsUpToDepth',
      'collapseAllColumnGroups',
      'clearComments',

      'getTabColor',
      'getTabColorObject',
      'setTabColor',
      'setTabColorObject',
      'insertRows',
      'hideColumns',
      'showColumns',
      'hideRows',
      'showRows',
      'hideSheet',
      'showSheet',
      'moveRows',
      'moveColumns',
      'getPivotTables',
      'getRowGroupDepth',
      'getColumnGroupDepth',
      'getRowGroup',
      'getColumnGroup',
      'expandAllRowGroups',
      'collapseAllRowGroups',
      'expandAllColumnGroups',
      'asDataSourceSheet',
      'getSlicers',
      'insertSlicer',
      'getDrawings',
      'insertColumns',
      'clearConditionalFormatRules',

      'clearNotes',
      'insertChart',
      'removeChart',
      'updateChart',
      'newChart',

      'getCharts',
      'createDeveloperMetadataFinder',
      'getDataSourceUrl',
      'deleteRows',
      'getNamedRanges',
      'getFormUrl',

      'getBandings',
      'createTextFinder',
      'addDeveloperMetadata',
      'getDeveloperMetadata',
      'deleteColumns',
      'copyTo',
  
      'setName',
      'getFilter',
      'getImages',
      'getDataSourcePivotTables',
      'getCurrentCell',
      'getActiveRange',
      'getActiveRangeList',
      'getSelection',
      'setCurrentCell',
      'setActiveRange',
      'setActiveRangeList',
      'insertRowAfter',
      'deleteColumn',
      'deleteRow',
      'getActiveCell',
      'getActiveSelection',
      'isRowHiddenByUser',
      'isColumnHiddenByUser',
      'getFrozenRows',
      'getFrozenColumns',
      'hideColumn',
      'hideRow',
      'insertColumnAfter',
      'insertColumnBefore',
      'insertColumnsAfter',
      'insertColumnsBefore',
      'insertImage',
      'insertRowBefore',
      'insertRowsAfter',
      'insertRowsBefore',
      'revealColumn',
      'unhideColumn',
      'revealRow',
      'unhideRow',
      'setActiveCell',
      'setActiveSelection',
      'autoResizeColumn',
      'setFrozenColumns',
      'setFrozenRows',
      'getSheetPermissions',
      'setSheetPermissions',
      'getSheetProtection',
      'setSheetProtection',
      'appendRow',
      'getDataSourceTables',
      'getDataSourceFormulas',
      'isRowHiddenByFilter',
      'find',
      'sort']
    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented(f)
      }
    })
  }
  
  toString () {
    return 'Sheet'
  }

  get __sheet() {
    return this.getParent().__getSheetMeta(this.__sheetId)
  }

  getParent() {
    return this.__parent
  }
  getIndex() {
    // spreadsheetapp is 1 based, adv is 0 based
    return this.__sheet.properties.index + 1
  }
  getName() {
    return this.__sheet.properties.title
  }
  getSheetId() {
    return this.__sheet.properties.sheetId
  }
  getSheetName() {
    return this.getName()
  }
  getMaxRows() {
    return this.__sheet.properties.gridProperties.rowCount
  }
  getMaxColumns() {
    return this.__sheet.properties.gridProperties.columnCount
  }

  getType() {
    return this.__sheet.properties.sheetType
  }

  isSheetHidden() {
    return Boolean(this.__sheet.properties.hidden)
  }

  /**
   * protect() https://developers.google.com/apps-script/reference/spreadsheet/sheet#protect
   * Creates an object that can protect the sheet from being edited except by users who have permission.
   * @return {FakeProtection}
   */
  protect () {
    return newFakeProtection(SpreadsheetApp.ProtectionType.SHEET, this)
  }

  /**
   * gets a grid range as per the api format
   * @returns {GridRange} gridRange 
   */
  __getGridRange() {
    let { values } = Sheets.Spreadsheets.Values.get(this.__parent.getId(), this.getName())
    // no values indicates an empty sheet
    // in this case the gridrange as far as gas is concerned is A1
    let maxWidth = 1
    let maxHeight = 1
    if (values) {
      maxWidth = values.reduce((p, c) => c.length > p ? c.length : p, 0)
      maxHeight = values.length
    }


    return {
      sheetId: this.getSheetId(),
      startRowIndex: 0,
      endRowIndex: maxHeight,
      startColumnIndex: 0,
      endColumnIndex: maxWidth
    }
  }
  __clear (fields) {

    const request = {
      updateCells: {
        range: {
          sheetId: this.getSheetId()
        },
        fields
      }
    }

    Sheets.Spreadsheets.batchUpdate({ requests: [request] }, this.getParent().getId(), { ss: true })
    return this
  }
  /**
   * clear() https://developers.google.com/apps-script/reference/spreadsheet/sheet#clear
   * Clears the sheet of content and formatting information.
   * @returns {FakeSheet} this
   */
  clear({formatOnly = false, contentsOnly= false} ={}) {
    const fields = [contentsOnly ? null : 'userEnteredFormat', formatOnly ? null : 'userEnteredValue'].filter(f=>f)
  
    // TODO check what GAS does do if both false or invalid options are specified
    if (!fields.length) {
      throw new Error ('contentsOnly and formatOnly cannot both be true')
    }

    return this.__clear(fields.join(","))
  }
  clearContents() {
    return this.clear({ contentsOnly: true })
  }
  clearFormats () {
    return this.clear({ formatOnly: true })
  }

  /**
   * gets a grid range as per the api format
   * @returns {GridRange} gridRange 
   */
  getDataRange() {
    return newFakeSheetRange(this.__getGridRange(), this)
  }
  // 1 based
  getLastRow() {
    return this.__getGridRange().endRowIndex
  }
  // 1 based
  getLastColumn() {
    return this.__getGridRange().endColumnIndex
  }
  /**
   * getProtections(type) https://developers.google.com/apps-script/reference/spreadsheet/sheet#getprotectionstype
   * @param {FakeProtectionType}
   * @returns {FakeProtection[]}
   */
  getProtections () {

  }

  /**
   * setRowHeights(startRow, numRows, height) https://developers.google.com/apps-script/reference/spreadsheet/sheet#setrowheightsstartrow,-numrows,-height
   * Sets the height of the given rows in pixels. By default, rows grow to fit cell contents. 
   * @param {number} startRow 1 based  starting row position to change.
   * @param {number} numRows 	The number of rows to change.
   * @param {number} height The height in pixels to set it to.
   * @returns {FakeSheet} this
   */
  setRowHeights(startRow, numRows, height) {

    let requests = [{
      updateDimensionProperties: {
        range: {
          sheetId: this.getSheetId(),
          dimension: 'ROWS',
          startIndex: startRow - 1,
          endIndex: startRow + numRows - 1,
        },
        properties: {
          pixelSize: height,
        },
        fields: 'pixelSize',
      }
    }]

    // let sheets handle errors
    Sheets.Spreadsheets.batchUpdate({ requests }, this.__parent.getId(), { ss: true })
    return this

  }

  /**
   * setRowHeight(rowPosition, height) https://developers.google.com/apps-script/reference/spreadsheet/sheet#setrowheightrowposition,-height
   * Sets the row height of the given row in pixels. By default, rows grow to fit cell contents
   * @param {number} rowPosition 1 based row number
   * @param {number} height pixels
   * @returns {FakeSheet} this
   */
  setRowHeight(rowPosition, height) {
    return this.setRowHeights(rowPosition, 1, height)
  }

  /**
   * setColumnWidths(startColumn, numColumns, width) https://developers.google.com/apps-script/reference/spreadsheet/sheet#setcolumnwidthsstartcolumn,-numcolumns,-width
   * Sets the width of the given columns in pixels. 
   * @param {number} startColumn 1 based  starting column position to change.
   * @param {number} numColumns 	The number of columns to change.
   * @param {number} width The width in pixels to set it to.
   * @returns {FakeSheet} this
   */
  setColumnWidths(startColumn, numColumns, width) {

    let requests = [{
      updateDimensionProperties: {
        range: {
          sheetId: this.getSheetId(),
          dimension: 'COLUMNS',
          startIndex: startColumn - 1,
          endIndex: startColumn + numColumns - 1,
        },
        properties: {
          pixelSize: width,
        },
        fields: 'pixelSize',
      }
    }]

    // let sheets handle errors
    Sheets.Spreadsheets.batchUpdate({ requests }, this.__parent.getId(), { ss: true })
    return this

  }

  /**
   * setColumnWidth(columnPosition, width) https://developers.google.com/apps-script/reference/spreadsheet/sheet#setcolumnwidthcolumnposition,-width
   * Sets the column width of the given column in pixels. 
   * @param {number} columnPosition 1 based column number
   * @param {number} width The width in pixels to set it to.
   * @returns {FakeSheet} this
   */
  setColumnWidth(columnPosition, width) {
    return this.setColumnWidths(columnPosition, 1, width)
  }

  /**
   * getColumnWidth(columnPosition) https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getcolumnwidthcolumnposition
   * Gets the width in pixels of the given column.
   * @param {number} columnPosition 
   * @returns {number} pixels
   */
  getColumnWidth(columnPosition) {
    // we just need 1 column
    const ranges = [this.getRange(1, columnPosition, 1, 1).__getWithSheet()]
    const data = this.getParent().__getSheetMetaProps(ranges, "sheets.data.columnMetadata")
    return data.sheets[0].data[0].columnMetadata[0].pixelSize
  }

  /**
   * getRowHeight(rowPosition) https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getrowheightrowposition
   * Gets the height in pixels of the given row.
   * @param {number} rowPosition 
   * @returns {number} pixels
   */
  getRowHeight(rowPosition) {
    // we just need 1 row
    const ranges = [this.getRange(rowPosition, 1, 1, 1).__getWithSheet()]
    const data = this.getParent().__getSheetMetaProps(ranges, "sheets.data.rowMetadata")
    return data.sheets[0].data[0].rowMetadata[0].pixelSize
  }

  /**
   * getRangeList(a1Notations)
   * @param {string[]} a1Notations  a1 notations ranges
   * @returns {FakeSheetRangeList}
   */
  getRangeList(a1Notations) {
    return newFakeSheetRangeList(a1Notations.map(f => this.getRange(f)))
  }

  /** 
   * arguments can be flexible row/column is 1 based
   * @param {number|string} rowOrA1 can also be a string if its a1 notation
   * @param {number} column 
   * @param {number} [numRows] 
   * @param {number} [numColumns]
   */
  getRange(rowOrA1, column, numRows, numColumns) {

    const { nargs, matchThrow } = signatureArgs(arguments, "getRange")

    if (nargs > 4 || !nargs) matchThrow()
    if (nargs === 1) {
      if (!is.string(rowOrA1)) matchThrow()
      const grid = SheetUtils.fromRange(rowOrA1)
      return newFakeSheetRange({
        ...grid,
        sheetId: this.getSheetId()
      }, this)
    }
    const row = rowOrA1
    if (!is.number(column) || !is.number(row)) matchThrow()
    return newFakeSheetRange({
      sheetId: this.getSheetId(),
      startRowIndex: row - 1,
      startColumnIndex: column - 1,
      endRowIndex: row + (numRows || 0) - 1,
      endColumnIndex: column + (numColumns || 0) - 1
    }, this)

  }
  /**
   * getSheetValues(startRow, startColumn, numRows, numColumns) - all 1 based
   * https://developers.google.com/apps-script/reference/spreadsheet/sheet#getsheetvaluesstartrow,-startcolumn,-numrows,-numcolumns
   * @param {number} numColumns The number of columns to return values for.
   * @param {number} numRows The number of rows to return values for.
   * @param {number} startColumn The position of the starting column.
   * @param {number} startRow The position of the starting row.
   * @returns {*[][]}  a two-dimensional array of values
   */
  getSheetValues(startRow, startColumn, numRows, numColumns) {
    const range = this.getRange(startRow, startColumn, numRows, numColumns)
    return range.getValues()
  }

}
