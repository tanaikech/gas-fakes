import { Proxies } from '../../support/proxies.js'
import { newFakeSpreadsheet } from './fakespreadsheet.js'
import { notYetImplemented, minSheetFields, signatureArgs } from '../../support/helpers.js'
import { Utils } from "../../support/utils.js"
import { newFakeColorBuilder } from '../commonclasses/fakecolorbuilder.js'
import { newFakeRichTextValueBuilder } from '../commonclasses/fakerichtextvalue.js'
import { newFakeTextStyleBuilder } from '../commonclasses/faketextstylebuilder.js'
import { newFakeFilterCriteriaBuilder } from './fakefiltercriteriabuilder.js'
import { newFakeDataValidationBuilder } from './fakedatavalidationbuilder.js'
import { newFakeDataSourceSpecBuilder } from './fakedatasourcespecbuilder.js';


import * as Enums from '../enums/sheetsenums.js'

const { is } = Utils


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

    const enumProps = [
      "AutoFillSeries", //	AutoFillSeries	An enumeration of the types of series used to calculate auto-filled values.
      "BandingTheme", //	BandingTheme	An enumeration of the possible banding themes.
      "BooleanCriteria", //	BooleanCriteria	An enumeration of conditional formatting boolean criteria.
      "BorderStyle", //	BorderStyle	An enumeration of the valid styles for setting borders on a Range.
      "ColorType", //	ColorType	An enumeration of possible color types.
      "CopyPasteType", //	CopyPasteType	An enumeration of the possible paste types.
      "DataExecutionErrorCode", //	DataExecutionErrorCode	An enumeration of the possible data execution error codes.
      "DataExecutionState", //	DataExecutionState	An enumeration of the possible data execution states.
      "DataSourceParameterType", //	DataSourceParameterType	An enumeration of the possible data source parameter types.
      "DataSourceRefreshScope", //	DataSourceRefreshScope	An enumeration of possible data source refresh scopes.
      "DataSourceType", //	DataSourceType	An enumeration of the possible data source types.
      "DataValidationCriteria", //	DataValidationCriteria	An enumeration representing the data validation criteria that can be set on a range.
      "DateTimeGroupingRuleType", //	DateTimeGroupingRuleType	An enumeration of date time grouping rule.
      "DeveloperMetadataLocationType", //	DeveloperMetadataLocationType	An enumeration of possible developer metadata location types.
      "DeveloperMetadataVisibility", //	DeveloperMetadataVisibility	An enumeration of the possible developer metadata visibilities.
      "Dimension", //	Dimension	An enumeration of the possible dimensions of a spreadsheet.
      "Direction", //	Direction	A enumeration of the possible directions that one can move within a spreadsheet using the arrow keys.
      "FrequencyType", //	FrequencyType	An enumeration of possible frequency types.
      "GroupControlTogglePosition", //	GroupControlTogglePosition	An enumeration of the positions that the group control toggle can be in.
      "InterpolationType", //	InterpolationType	An enumeration of conditional format gradient interpolation types.
      "PivotTableSummarizeFunction", //	PivotTableSummarizeFunction	An enumeration of the functions that may be used to summarize values in a pivot table.
      "PivotValueDisplayType", //	PivotValueDisplayType	An enumeration of the ways that a pivot value may be displayed.
      "ProtectionType", //	ProtectionType	An enumeration representing the parts of a spreadsheet that can be protected from edits.
      "RecalculationInterval", //	RecalculationInterval	An enumeration of the possible intervals that can be used in spreadsheet recalculation.
      "RelativeDate", //	RelativeDate	An enumeration of relative date options for calculating a value to be used in date-based BooleanCriteria.
      "SheetType", //	SheetType	An enumeration of the different types of sheets that can exist in a spreadsheet.
      "SortOrder", //	SortOrder	An enumeration of sort order.
      "TextDirection", //	TextDirection	An enumeration of valid text directions.
      "TextToColumnsDelimiter", //	TextToColumnsDelimiter	An enumeration of the preset delimiters for split text to columns.
      "ThemeColorType", //	ThemeColorType	An enumeration of possible theme color types.
      "ValueType", //	ValueType	An enumeration of value types returned by Range.getValue() and Range.getValues() from the Range class of the Spreadsheet service. The enumeration values listed below are in addition to Number, Boolean, Date, or String.
      "WrapStrategy", //	WrapStrategy	An enumeration of the strategies used for wrapping cells.  
    ]

    // import all known enums as props of spreadsheetapp
    enumProps.forEach(f => {
      this[f] = Enums[f]
    })

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
      'newCellImage',
      'getUi',
      'flush',
      'open',

      'ChartAggregationType',
      'ChartTransformationType',

    ]

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
    return newFakeSpreadsheet(data)

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

  /**
   * newDataValidation() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newdatavalidation
   * Creates a builder for a data validation rule.
   * @returns {FakeDataValidationBuilder}
   */
  newDataValidation() {
    return newFakeDataValidationBuilder()
  }

  /**
   * newRichTextValue() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newrichtextvalue
   * Creates a builder for a RichTextValue.
   * @returns {FakeRichTextValueBuilder}
   */
  newRichTextValue () {
    return newFakeRichTextValueBuilder()
  }

  /**
   * newFilterCriteria() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newfiltercriteria
   * @returns {FakeFilterCriteriaBuilder}
   */
  newFilterCriteria() {
    return newFakeFilterCriteriaBuilder();
  }

  /**
   * newDataSourceSpec() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newdatasourcespec
   * @returns {FakeDataSourceSpecBuilder}
   */
  newDataSourceSpec() {
    const { nargs, matchThrow } = signatureArgs(arguments, "SpreadsheetApp.newDataSourceSpec");
    if (nargs) matchThrow();
    return newFakeDataSourceSpecBuilder();
  }
}