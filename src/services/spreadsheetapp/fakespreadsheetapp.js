import { Proxies } from '../../support/proxies.js'
import { newFakeSpreadsheet } from './fakespreadsheet.js'
import { notYetImplemented, minSheetFields, signatureArgs} from '../../support/helpers.js'
import { Utils } from "../../support/utils.js"
import { newFakeColorBuilder } from '../commonclasses/fakecolorbuilder.js'
import { ThemeColorType } from '../typedefs.js'
import { newFakeTextStyleBuilder } from '../commonclasses/faketextstylebuilder.js'
import { ProtectionType } from '../commonclasses/fakeprotectiontype.js'

const { is } = Utils
/**
 * @file
 * @imports ../typedefs.js
 */

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
      'newCellImage',
      'getUi',
      'flush',
      'open',
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

      'RecalculationInterval',
      'RelativeDate',
      'SheetType',
      'SortOrder',
      'TextDirection',
      'TextToColumnsDelimiter',
      'ValueType',
      'WrapStrategy']

    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented(f)
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
    const result = newFakeSpreadsheet(Sheets.Spreadsheets.get(id, { fields: minSheetFields }, { ss: true }))
    return result
  }

  /**
   * Creates a new spreadsheet with the given name and optinally and the specified number of rows and columns.
   * @param {string} name the name
   * @param {number} [rows] number of rows
   * @param {number} [columns] number of columns
   * @return {FakeSpreadsheet}
   */
  create(name, rows, columns) {
    const { nargs, matchThrow } = signatureArgs(arguments, "create")
    if (nargs < 1) matchThrow()
    if (nargs > 3) matchThrow()
    if (!is.nonEmptyString(name)) matchThrow()
    if (nargs > 1 && (!is.positiveNumber(rows) || !is.positiveNumber(columns))) matchThrow()
    const pack = {
      properties: {
        title: name
      }
    }

    // if rows/cols specified we need to fiddle with the first sheet's properties too
    if (nargs > 1) {
      pack.sheets = [{
        properties: {
          sheetType: 'GRID',
          gridProperties: {
            rowCount: rows,
            columnCount: columns
          }
        },
      }]
    }

    const data = Sheets.Spreadsheets.create(pack, { ss: true })
    return  newFakeSpreadsheet(data)

  }

  /**
   * url looks like this https://docs.google.com/spreadsheets/d/1lc7YcqMuP1ap23FFW0EqywyLojBmHTKZde_0cYcyPSQ/edit?gid=907032523#gid=907032523
   * @param {string} url 
   * @return {FakeSpreadsheet}
   */
  openByUrl(url) {
    return this.openById(url.replace(/.*\/spreadsheets\/d\/([^\/]*).*/i, "$1"))
  }

  /**
   * newColor() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newcolor
   * Creates a builder for a Color.
   * return {FakeColorBuilder}
   */
  newColor() {
    return newFakeColorBuilder()
  }
  
  /**
   * newTextStyle() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newTextStyle()
   * Creates a builder for a TextStyle.
   * return {FakeTextStyleBuilder}
   */
  newTextStyle() {
    return newFakeTextStyleBuilder()
  }


  get ProtectionType () {
    return ProtectionType
  } 

  get ThemeColorType () {
    return ThemeColorType
  }

}