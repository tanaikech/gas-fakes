import { Proxies } from '../../support/proxies.js'
import { newFakeSheet } from './fakesheet.js'
import { notYetImplemented } from '../../support/helpers.js'

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
 * TODO add lots more methods
 * @class FakeSpreadsheet
 * @returns {FakeSpreadsheet}
 */
export class FakeSpreadsheet {

  constructor(file) {
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
      'insertSheet',
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
      'getRecalculationInterval',
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
      'getRange',
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
      'getRowHeight',
      'getColumnWidth',
      'insertColumnBefore',
      'setRowHeight',
      'isColumnHiddenByUser',
      'getRangeList',
      'insertRowBefore',
      'insertRowAfter',
      'setColumnWidth',
      'revealColumn',
      'getDataRange',
      'getActiveCell',
      'getDataSourcePivotTables',
      'deleteColumns',
      'getActiveSelection',
      'getLastColumn',
      'deleteColumn',
      'getLastRow',
      'getImages',
      'find',
      'sort',
      'getEditors',
      'addEditor',
      'addEditors',
      'addViewers',
      'getViewers',
      'addViewer',
      'removeViewer',
      'removeEditor',
      'getAs',
      'getBlob']

    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented()
      }
    })
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
    return this.__meta.sheets.map(f => newFakeSheet(f, this))
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
    return sheets.find(f => f.getSheetId() === id) || null
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
    const sheets = this.getSheets()
    return sheets[0].getSheetId()
  }
  /**
   * Returns name of first sheet.
   * this is kind of a nonsense method as the answer should always be the id of the first sheet
   * the apps script docs are misleading
   * @return {id} the first sheet name in the spreadsheet
   */
  getSheetName() {
    const sheets = this.getSheets()
    return sheets[0].getName()
  }
  /**
   * Returns owner of first sheet.
   * we can get this with the DriveAPI
   * the apps script docs are misleading
   * @return {FakeUser} the owner of the spreadsheet
   */
  getOwner() {
    return this.__file.getOwner()
  }
  getRange () {
    
  }
}
