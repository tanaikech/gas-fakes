import { Proxies } from '../../support/proxies.js'



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
 * TODO add lots more methods
 * @class FakeSpreadsheet
 * @returns {FakeSheet}
 */
export class FakeSheet {

  constructor(sheet) {
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
      'getRange',
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
      'getParent',
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
      'getLastRow',
      'getLastColumn',
      'getDataRange',
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
  getIndex() {
    // spreadsheetapp is 1 based, adv is 0 based
    return this.__sheet.properties.index +1
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


}
