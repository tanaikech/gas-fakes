import { Proxies } from '../../support/proxies.js'
import { SheetUtils } from '../../support/sheetutils.js'
import { notYetImplemented } from '../../support/helpers.js'
import { newFakeSheetRange } from './fakesheetrange.js'
import { Utils } from "../../support/utils.js"
const { is } = Utils
/**
 * @file
 * @imports ../typedefs.js
 */

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

  constructor(sheet, parent) {
    this.__parent = parent
    this.__sheet = sheet
    const props = ['toString',
      'activate',
      'autoResizeColumns',
      'autoResizeRows',
      'setColumnWidths',
      'setRowHeights',
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
      'clearFormats',
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
      'isSheetHidden',
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
      'protect',
      'clearNotes',
      'insertChart',
      'removeChart',
      'updateChart',
      'newChart',
      'clearContents',
      'getCharts',
      'createDeveloperMetadataFinder',
      'getDataSourceUrl',
      'deleteRows',
      'getNamedRanges',
      'getFormUrl',
      'getProtections',
      'getBandings',
      'createTextFinder',
      'addDeveloperMetadata',
      'getDeveloperMetadata',
      'deleteColumns',
      'copyTo',
      'clear',
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
      'getRangeList',
      'getActiveCell',
      'getActiveSelection',
      'getColumnWidth',
      'getRowHeight',
      'isRowHiddenByUser',
      'isColumnHiddenByUser',
      'getSheetValues',
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
      'setColumnWidth',
      'setFrozenColumns',
      'setFrozenRows',
      'setRowHeight',
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
        return notYetImplemented()
      }
    })
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

  /**
   * gets a grid range as per the api format
   * @returns {import('../typedefs.js').GridRange} gridRange 
   */
  __getGridRange() {
    const { values } = Sheets.Spreadsheets.Values.get(this.__parent.getId(), this.getName())
    // not sure if all widths are equal - so we'll do this
    const maxWidth = values.reduce((p, c) => c.length > p ? c.length : p, 0)

    return {
      sheetId: this.getSheetId(),
      startRowIndex: 0,
      endRowIndex: values.length,
      startColumnIndex: 0,
      endColumnIndex: maxWidth
    }
  }

  /**
   * gets a grid range as per the api format
   * @returns {import('../typedefs.js').GridRange} gridRange 
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
   * TODO - this needs to return a fakerange
   * arguments can be flexible row/column is 1 based
   * @param {number|string} rowOrA1 can also be a string if its a1 notation
   * @param {number} column 
   * @param {number} [numRows] 
   * @param {number} [numColumns]
   */
  getRange(rowOrA1, column, numRows, numColumns) {
    const nargs = arguments.length
    const passedTypes = [is(rowOrA1), is(column), is(numRows), is(numColumns)].slice(0, nargs)

    const matchThrow = (mess = "") => {
      throw new Error(`The parameters (${passedTypes}) don't match the method ${mess}`)
    }
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
      endRowIndex: row + (numRows || 0) -1,
      endColumnIndex: column + (numColumns || 0)  -1
    },this)

  }



}
