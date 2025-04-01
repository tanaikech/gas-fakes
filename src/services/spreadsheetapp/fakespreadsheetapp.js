import { Proxies } from '../../support/proxies.js'
import { newFakeSpreadsheet } from './fakespreadsheet.js'

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
      'openByUrl',
      'getActive',
      'newConditionalFormatRule',
      'enableBigQueryExecution',
      'enableAllDataSourcesExecution',
      'newTextStyle',
      'enableLookerExecution',
      'openByKey',
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
   * @param {string} id file id
   * @return {FakeSpreadsheet}
   */
  openById(id) {
    return newFakeSpreadsheet(Sheets.Spreadsheets.get(id, {}, { ss: true }))
  }

}