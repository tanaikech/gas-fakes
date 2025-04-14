import { Proxies } from '../../support/proxies.js'
import { newFakeSpreadsheet } from './fakespreadsheet.js'
import { notYetImplemented, minSheetFields } from '../../support/helpers.js'

/**
 * create a new FakeSpreadsheetApp instance
 * @param  {...any} args 
 * @returns {FakeSpreadsheetApp}
 */
export const newFakeSpreadsheetApp = (...args) => {
  return Proxies.guard(new FakeSpreadsheetApp(...args))
}


/**
 * basic fake FakeSpreadsheetApp
 * @class FakeSpreadsheetApp
 * @returns {FakeSpreadsheetApp}
 */
export class FakeSpreadsheetApp {

  constructor() {
    const props = ['toString',

      'getActive',
      'newConditionalFormatRule',
      'enableBigQueryExecution',
      'enableAllDataSourcesExecution',
      'newTextStyle',
      'enableLookerExecution',
      'getActiveSpreadsheet',
      'getActiveSheet',
      'getCurrentCell',
      'getActiveRange',
      'getActiveRangeList',
      'getSelection',
      'setActiveSpreadsheet',
      'setActiveSheet',
      'setCurrentCell',
      'setActiveRange',
      'setActiveRangeList',
      'newDataValidation',
      'newRichTextValue',
      'newFilterCriteria',
      'newDataSourceSpec',
      'newColor',
      'newCellImage',
      'getUi',
      'flush',
      'open',
      'create',
      'AutoFillSeries',
      'BandingTheme',
      'BooleanCriteria',
      'BorderStyle',
      'ChartAggregationType',
      'ChartTransformationType',
      'ColorType',
      'CopyPasteType',
      'DataExecutionErrorCode',
      'DataExecutionState',
      'DataSourceParameterType',
      'DataSourceRefreshScope',
      'DataSourceType',
      'DataValidationCriteria',
      'DateTimeGroupingRuleType',
      'DeveloperMetadataLocationType',
      'DeveloperMetadataVisibility',
      'Dimension',
      'Direction',
      'FrequencyType',
      'GroupControlTogglePosition',
      'InterpolationType',
      'PivotTableSummarizeFunction',
      'PivotValueDisplayType',
      'ProtectionType',
      'RecalculationInterval',
      'RelativeDate',
      'SheetType',
      'SortOrder',
      'TextDirection',
      'TextToColumnsDelimiter',
      'ThemeColorType',
      'ValueType',
      'WrapStrategy']

    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented()
      }
    })

  }

  /**
   * this one is probably deprecated
   * @param {string} id file id
   * @return {FakeSpreadsheet}
   */
  openByKey(id) {
    return this.openById(id)
  }

  /**
   * @param {string} id file id
   * @return {FakeSpreadsheet}
   */
  openById(id) {
    const result =  newFakeSpreadsheet(Sheets.Spreadsheets.get(id, {fields: minSheetFields}, { ss: true }))
    return result
  }
  /**
   * url looks like this https://docs.google.com/spreadsheets/d/1lc7YcqMuP1ap23FFW0EqywyLojBmHTKZde_0cYcyPSQ/edit?gid=907032523#gid=907032523
   * @param {string} url 
   * @return {FakeSpreadsheet}
   */
  openByUrl(url) {
    return this.openById(url.replace(/.*\/spreadsheets\/d\/([^\/]*).*/i, "$1"))
  }

}