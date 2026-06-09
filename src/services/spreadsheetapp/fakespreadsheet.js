import { Proxies } from "../../support/proxies.js";
import { FakeSheet, newFakeSheet } from "./fakesheet.js";
import {
  notYetImplemented,
  minSheetFields,
  signatureArgs,
} from "../../support/helpers.js";
import { Utils } from "../../support/utils.js";
import { newFakeDeveloperMetadataFinder } from "./fakedevelopermetadatafinder.js";
import { newFakeDataSource } from "./fakedatasource.js";
import { batchUpdate } from "./sheetrangehelpers.js";
import { FakeTextFinder, newFakeTextFinder } from "./faketextfinder.js";
import { newFakeNamedRange } from "./fakenamedrange.js";
import { newFakeSpreadsheetTheme } from "./fakespreadsheettheme.js";

// import { newFakeProtection } from "../common/fakeprotection.js";
import { newFakeProtection } from "./fakeprotection.js";

const { is, isEnum } = Utils;

/**
 * create a new FakeSpreadsheet instance
 * @param  {...any} args
 * @returns {FakeSpreadsheet}
 */
export const newFakeSpreadsheet = (...args) => {
  return Proxies.guard(new FakeSpreadsheet(...args));
};

/**
 * basic fake FakeSpreadsheet
 * @class FakeSpreadsheet
 * @returns {FakeSpreadsheet}
 */
export class FakeSpreadsheet {
  constructor(file) {
    // when we insert/delete sheets row/cols we update this metadata too
    this.__meta = file;
    this.__activeRange = null;
    this.__activeSheet = null;

    // may of these props can be picked up from the Drive API, so we'll look as a file too
    this.__file = DriveApp.getFileById(file.spreadsheetId);

    const props = [
      "getBandings",
      "getDataSources",
      "addCollaborator",
      "refreshAllDataSources",
      "getCollaborators",
      "getChanges",
      "removeCollaborator",
      "setAnonymousAccess",
      "removeNamedRange",
      "moveChartToObjectSheet",
      "addCollaborators",
      "moveActiveSheet",
      "isAnonymousView",
      "getFormUrl",
      "getDataSourceSheets",
      "isAnonymousWrite",
      "addMenu",
      "removeMenu",
      "inputBox",
      "waitForAllDataExecutionsCompletion",
      "msgBox",
      "insertSheetWithDataSourceTable",
      "getDataSourceRefreshSchedules",
      "getPredefinedSpreadsheetThemes",
      "copy",
      "isReadable",
      "isWritable",
      "getSheetProtection",
      "setSheetPermissions",
      "isRowHiddenByFilter",
      "setActiveCell",
      "getSheetValues",
      "setSheetProtection",
      "getDataSourceTables",
      "getDataSourceFormulas",
      "getSheetPermissions",
      "getRangeList",
      "getActiveCell",
      "getDataSourcePivotTables",
      "getActiveSelection",
      "getImages",
      "find",
      "getBlob",
    ];

    props.forEach((f) => {
      this[f] = () => {
        return notYetImplemented(f);
      };
    });
  }

  setActiveRange(range) {
    this.__activeRange = range;
    this.__activeSheet = range.getSheet();
    this.__currentCell = range.getCell(1, 1);
    
    // Sync with SpreadsheetApp if this is the active spreadsheet
    const app = SpreadsheetApp;
    if (app && app.getActiveSpreadsheet() === this) {
       app.setActiveSpreadsheet(this);
    }
    return range;
  }

  setActiveRangeList(rangeList) {
    const ranges = rangeList.getRanges();
    if (ranges && ranges.length > 0) {
      this.setActiveRange(ranges[ranges.length - 1]);
    }
    return rangeList;
  }
  
  setActiveSelection(rangeOrA1Notation) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.setActiveSelection");
    if (nargs !== 1) matchThrow();
    
    let range;
    if (is.string(rangeOrA1Notation)) {
        range = this.getRange(rangeOrA1Notation);
    } else {
        range = rangeOrA1Notation;
    }
    return this.setActiveRange(range);
  }

  getActiveRange() {
    return this.__activeRange || this.getActiveSheet().getRange('A1');
  }
  
  getCurrentCell() {
    return this.__currentCell || this.getActiveSheet().getRange('A1');
  }
  
  setCurrentCell(cell) {
    this.__currentCell = cell;
    this.__activeSheet = cell.getSheet();
    // Setting current cell does not change the active range, just the cell within it.
    // However, if there is no active range, it becomes the active range.
    if (!this.__activeRange) {
        this.__activeRange = cell;
    }
    return cell;
  }

  setActiveSheet(sheet, restoreSelection) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.setActiveSheet");
    if (nargs < 1 || nargs > 2) matchThrow();
    this.__activeSheet = sheet;
    return sheet;
  }

  getActiveSheet() {
    if (this.__activeSheet) return this.__activeSheet;
    return this.__getFirstSheet();
  }

  insertImage(blobSourceOrUrl, column, row, offsetX, offsetY) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.insertImage");
    if (nargs < 3 || nargs > 5) matchThrow();
    return this.getActiveSheet().insertImage(blobSourceOrUrl, column, row, offsetX, offsetY);
  }

  addViewer(emailAddress) {
    this.__file.addViewer(emailAddress);
    return this;
  }

  addEditor(emailAddress) {
    this.__file.addEditor(emailAddress);
    return this;
  }

  addViewers(emailAddresses) {
    this.__file.addViewers(emailAddresses);
    return this;
  }

  addEditors(emailAddresses) {
    this.__file.addEditors(emailAddresses);
    return this;
  }

  removeViewer(emailAddress) {
    this.__file.removeViewer(emailAddress);
    return this;
  }

  removeEditor(emailAddress) {
    this.__file.removeEditor(emailAddress);
    return this;
  }

  
  addDeveloperMetadata(key, value, visibility) {
    const { nargs, matchThrow } = signatureArgs(
      arguments,
      "Spreadsheet.addDeveloperMetadata"
    );
    if (nargs < 1 || nargs > 3) matchThrow();
    if (!is.string(key)) matchThrow();

    let realValue = null;
    let realVisibility = SpreadsheetApp.DeveloperMetadataVisibility.DOCUMENT;

    if (nargs === 2) {
      if (isEnum(value)) {
        realVisibility = value;
      } else {
        realValue = value;
      }
    } else if (nargs === 3) {
      realValue = value;
      realVisibility = visibility;
    }

    const metadata = {
      metadataKey: key,
      metadataValue: realValue,
      visibility: realVisibility.toString(),
      location: {
        spreadsheet: true,
      },
    };

    const request = {
      createDeveloperMetadata: {
        developerMetadata: metadata,
      },
    };

    batchUpdate({ spreadsheet: this, requests: [request] });
    return this;
  }

  createDeveloperMetadataFinder() {
    const { nargs, matchThrow } = signatureArgs(
      arguments,
      "Spreadsheet.createDeveloperMetadataFinder"
    );
    if (nargs) matchThrow();
    return newFakeDeveloperMetadataFinder(this);
  }

  __updateMeta(file) {
    this.__meta = file;
  }

  /**
   * get sheetlevel meta data for  given ranges
   * @param {FakeSheetRange} range
   * @param {string} fields to get
   * @return {object} data
   */
  __getSheetMetaProps = (ranges, fields) => {
    const data = Sheets.Spreadsheets.get(this.getId(), { ranges, fields });
    return data;
  };

  /**
   * TODO - does this apply to the active sheet or the 1st sheet?
   * @returns {FakeSheet}
   */
  __getFirstSheet() {
    return this.getSheets()[0];
  }

  /**
   * get spreadsesheetlevel meta
   * @param {string} fields to get
   * @return {object} data
   */
  __getMetaProps(fields) {
    const data = Sheets.Spreadsheets.get(this.getId(), { fields });
    return data;
  }

  getDeveloperMetadata() {
    const { nargs, matchThrow } = signatureArgs(
      arguments,
      "Spreadsheet.getDeveloperMetadata"
    );
    if (nargs) matchThrow();
    return this.createDeveloperMetadataFinder().find();
  }

  /**
   * getViewers() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getviewers
   * Gets the list of viewers and commenters for this Spreadsheet.
   * @returns {FakeUser[]} the file viewers
   */
  getViewers() {
    return this.__file.getViewers();
  }
  /**
   * getEditors() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#geteditors
   * Gets the list of editors for this Spreadsheet.
   * @returns {FakeUser[]} the file editors
   */
  getEditors() {
    return this.__file.getEditors();
  }

  /**
   * getOwner() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getowner
   * Returns the owner of the document, or null for a document in a shared drive.
   * @returns {FakeUser}
   */
  getOwner() {
    return this.__file.getOwner();
  }

  /**
   * dont know the exact status of this one - TODO keep an eye on if it gets activated in gas
   */
  isAnonymousView() {
    // weird right ? but that's what it does on gas
    throw new Error(
      `The api method 'isAnonymousView' is not available yet in the new version of Google Sheets`
    );
  }

  /**
   * getProtections(type) https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getprotectionstype
   * @param {FakeProtectionType} type
   * @param {ProtectedRange} apiResult https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/sheets#ProtectedRange
   * @returns {FakeProtection[]} api result in apps script style
   */
  getProtections(type) {
    const { sheets } = this.__getMetaProps(`sheets.protectedRanges`);
    // a SHEET type has no has no grid properties

    // filter out the types that were not requested
    const t = type.toString();
    const matches = sheets.filter(is.nonEmptyObject).map((sheet) => {
      return sheet.protectedRanges.filter((pr) => {
        switch (t) {
          case "RANGE":
            return Reflect.has(pr.range, "startRowIndex");

          case "SHEET":
            return !Reflect.has(pr.range, "startRowIndex");

          default:
            throw new Error(t, "is not a valid protect range type");
        }
      });
    });

    // the api returns an array of items that match for each sheet
    /*
    [
      [
          {
              "range": {
                  "sheetId": 97278457,
                  "startRowIndex": 1,
                  "endRowIndex": 3,
                  "startColumnIndex": 1,
                  "endColumnIndex": 2
              }
          },
          {
              "range": {
                  "sheetId": 97278457,
                  "startRowIndex": 3,
                  "endRowIndex": 5,
                  "startColumnIndex": 3,
                  "endColumnIndex": 5
              }
          }
      ],
      []
    ]
      BUT: what apps script wants is a flattened version of that, ie. a 1 dimensional array with a seperate entry for each protection
      */
    return matches
      .filter((f) => f.length)
      .flat()
      .map((apiResult) =>
        newFakeProtection({
          type,
          sheet: this.getSheetById(apiResult.range.sheetId),
          apiResult,
        })
      );

    // TODO what does a sheet type with 'except certain cells' do
  }

  /**
   * getRecalculationInterval() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getrecalculationinterval
   * Returns the calculation interval for this spreadsheet.
   * @returns {RecalculationInterval}
   */

  getRecalculationInterval() {
    return this.__getMetaProps("properties.autoRecalc").properties.autoRecalc;
  }

  setSpreadsheetLocale(locale) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.setSpreadsheetLocale");
    if (nargs !== 1) matchThrow();
    this.__meta.properties.locale = locale;
    return this;
  }

  getSpreadsheetLocale() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.getSpreadsheetLocale");
    if (nargs) matchThrow();
    return this.__meta.properties.locale;
  }

  setSpreadsheetTimeZone(timezone) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.setSpreadsheetTimeZone");
    if (nargs !== 1) matchThrow();
    this.__meta.properties.timeZone = timezone;
    return this;
  }

  getSpreadsheetTimeZone() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.getSpreadsheetTimeZone");
    if (nargs) matchThrow();
    return this.__meta.properties.timeZone;
  }

  setIterativeCalculationEnabled(enabled) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.setIterativeCalculationEnabled");
    if (nargs !== 1) matchThrow();
    if (!this.__meta.properties.iterativeCalculationSettings) this.__meta.properties.iterativeCalculationSettings = {};
    this.__meta.properties.iterativeCalculationSettings.maxIterativeCalculationCycles = enabled ? (this.__meta.properties.iterativeCalculationSettings.maxIterativeCalculationCycles || 50) : 0;
    return this;
  }

  isIterativeCalculationEnabled() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.isIterativeCalculationEnabled");
    if (nargs) matchThrow();
    return (this.__meta.properties.iterativeCalculationSettings?.maxIterativeCalculationCycles || 0) > 0;
  }

  setMaxIterativeCalculationCycles(cycles) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.setMaxIterativeCalculationCycles");
    if (nargs !== 1) matchThrow();
    if (!this.__meta.properties.iterativeCalculationSettings) this.__meta.properties.iterativeCalculationSettings = {};
    this.__meta.properties.iterativeCalculationSettings.maxIterativeCalculationCycles = cycles;
    return this;
  }

  getMaxIterativeCalculationCycles() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.getMaxIterativeCalculationCycles");
    if (nargs) matchThrow();
    return this.__meta.properties.iterativeCalculationSettings?.maxIterativeCalculationCycles || 50;
  }

  setIterativeCalculationConvergenceThreshold(threshold) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.setIterativeCalculationConvergenceThreshold");
    if (nargs !== 1) matchThrow();
    if (!this.__meta.properties.iterativeCalculationSettings) this.__meta.properties.iterativeCalculationSettings = {};
    this.__meta.properties.iterativeCalculationSettings.convergenceThreshold = threshold;
    return this;
  }

  getIterativeCalculationConvergenceThreshold() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.getIterativeCalculationConvergenceThreshold");
    if (nargs) matchThrow();
    return this.__meta.properties.iterativeCalculationSettings?.convergenceThreshold || 0.05;
  }

  setRecalculationInterval(interval) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.setRecalculationInterval");
    if (nargs !== 1) matchThrow();
    this.__meta.properties.autoRecalc = interval;
    return this;
  }

  setFrozenRows(rows) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.setFrozenRows");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().setFrozenRows(rows);
    return this;
  }

  getFrozenRows() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.getFrozenRows");
    if (nargs) matchThrow();
    return this.getActiveSheet().getFrozenRows();
  }

  setFrozenColumns(columns) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.setFrozenColumns");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().setFrozenColumns(columns);
    return this;
  }

  getFrozenColumns() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.getFrozenColumns");
    if (nargs) matchThrow();
    return this.getActiveSheet().getFrozenColumns();
  }

  unhideColumn(range) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.unhideColumn");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().unhideColumn(range);
    return this;
  }

  unhideRow(range) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.unhideRow");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().unhideRow(range);
    return this;
  }

  getActiveRangeList() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.getActiveRangeList");
    if (nargs) matchThrow();
    return this.getActiveSheet().getActiveRangeList();
  }

  getSelection() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.getSelection");
    if (nargs) matchThrow();
    const rangeList = this.getActiveRangeList() || this.getActiveSheet().getRangeList([this.getActiveRange().getA1Notation()]);
    return {
      getActiveRange: () => this.getActiveRange(),
      getActiveRangeList: () => rangeList,
      getActiveSheet: () => this.getActiveSheet(),
      getCurrentCell: () => this.getCurrentCell()
    };
  }

  toast(msg, title, timeout) {
    return this;
  }

  show(userInterface) {
    return this;
  }

  updateMenu(name, menu) {
    return this;
  }

  getSpreadsheetTheme() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.getSpreadsheetTheme");
    if (nargs) matchThrow();
    if (!this.__theme) {
      this.__theme = newFakeSpreadsheetTheme(this.__meta.properties.spreadsheetTheme);
    }
    return this.__theme;
  }

  setSpreadsheetTheme(theme) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.setSpreadsheetTheme");
    if (nargs !== 1) matchThrow();
    this.__theme = theme;
    return this;
  }

  resetSpreadsheetTheme() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.resetSpreadsheetTheme");
    if (nargs) matchThrow();
    this.__theme = newFakeSpreadsheetTheme();
    return this.__theme;
  }

  deleteRow(rowPosition) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.deleteRow");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().deleteRow(rowPosition);
    return this;
  }

  deleteRows(rowPosition, howMany) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.deleteRows");
    if (nargs !== 2) matchThrow();
    this.getActiveSheet().deleteRows(rowPosition, howMany);
    return this;
  }

  hideRow(row) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.hideRow");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().hideRow(row);
    return this;
  }

  appendRow(rowContents) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.appendRow");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().appendRow(rowContents);
    return this;
  }

  insertRowsAfter(afterPosition, howMany) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.insertRowsAfter");
    if (nargs < 1 || nargs > 2) matchThrow();
    this.getActiveSheet().insertRowsAfter(afterPosition, howMany || 1);
    return this;
  }

  revealRow(row) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.revealRow");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().unhideRow(row);
    return this;
  }

  insertColumnAfter(afterPosition) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.insertColumnAfter");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().insertColumnsAfter(afterPosition, 1);
    return this;
  }

  isRowHiddenByUser(rowPosition) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.isRowHiddenByUser");
    if (nargs !== 1) matchThrow();
    return this.getActiveSheet().isRowHiddenByUser(rowPosition);
  }

  insertRowsBefore(beforePosition, howMany) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.insertRowsBefore");
    if (nargs < 1 || nargs > 2) matchThrow();
    this.getActiveSheet().insertRowsBefore(beforePosition, howMany || 1);
    return this;
  }

  insertColumnsAfter(afterPosition, howMany) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.insertColumnsAfter");
    if (nargs < 1 || nargs > 2) matchThrow();
    this.getActiveSheet().insertColumnsAfter(afterPosition, howMany || 1);
    return this;
  }

  hideColumn(column) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.hideColumn");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().hideColumn(column);
    return this;
  }

  autoResizeColumn(columnPosition) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.autoResizeColumn");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().autoResizeColumn(columnPosition);
    return this;
  }

  insertColumnsBefore(beforePosition, howMany) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.insertColumnsBefore");
    if (nargs < 1 || nargs > 2) matchThrow();
    this.getActiveSheet().insertColumnsBefore(beforePosition, howMany || 1);
    return this;
  }

  insertColumnBefore(beforePosition) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.insertColumnBefore");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().insertColumnsBefore(beforePosition, 1);
    return this;
  }

  isColumnHiddenByUser(columnPosition) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.isColumnHiddenByUser");
    if (nargs !== 1) matchThrow();
    return this.getActiveSheet().isColumnHiddenByUser(columnPosition);
  }

  insertRowBefore(beforePosition) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.insertRowBefore");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().insertRowsBefore(beforePosition, 1);
    return this;
  }

  insertRowAfter(afterPosition) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.insertRowAfter");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().insertRowsAfter(afterPosition, 1);
    return this;
  }

  revealColumn(column) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.revealColumn");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().unhideColumn(column);
    return this;
  }

  deleteColumns(columnPosition, howMany) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.deleteColumns");
    if (nargs !== 2) matchThrow();
    this.getActiveSheet().deleteColumns(columnPosition, howMany);
    return this;
  }

  deleteColumn(columnPosition) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.deleteColumn");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().deleteColumn(columnPosition);
    return this;
  }

  rename(newName) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.rename");
    if (nargs !== 1) matchThrow();
    this.__meta.properties.title = newName;
    return this;
  }

  setName(name) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.setName");
    if (nargs !== 1) matchThrow();
    return this.rename(name);
  }

  renameActiveSheet(newName) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.renameActiveSheet");
    if (nargs !== 1) matchThrow();
    this.getActiveSheet().setName(newName);
    return this;
  }

  duplicateActiveSheet() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.duplicateActiveSheet");
    if (nargs) matchThrow();
    const sheet = this.getActiveSheet();
    const newName = "Copy of " + sheet.getName();
    return this.insertSheet(newName);
  }

  deleteActiveSheet() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.deleteActiveSheet");
    if (nargs) matchThrow();
    return this.deleteSheet(this.getActiveSheet());
  }

  deleteSheet(sheet) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Spreadsheet.deleteSheet");
    if (nargs !== 1) matchThrow();
    const id = sheet.getSheetId();
    this.__meta.sheets = this.__meta.sheets.filter(s => s.properties.sheetId !== id);
    if (this.__activeSheet && this.__activeSheet.getSheetId() === id) {
      this.__activeSheet = this.getSheets()[0];
    }
    return this;
  }

  findSheetByName(name) {
    return this.getSheetByName(name);
  }

  findSheet(name) {
    return this.getSheetByName(name);
  }

  /**
   * getLastColumn() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getlastcolumn
   * Returns the position of the last column that has content.
   * @return {number}
   */
  getLastColumn() {
    return this.__getFirstSheet().getLastColumn();
  }
  /**
   * getLastRow() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getlastrow
   * Returns the position of the last row that has content.
   */
  getLastRow() {
    return this.__getFirstSheet().getLastRow();
  }
  /**
   * getDataRange() https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getdatarange
   * Returns a Range corresponding to the dimensions in which data is present.
   * @returns {FakeSheetRange}
   */
  getDataRange() {
    return this.__getFirstSheet().getDataRange();
  }

  /**
   * getColumnWidth(columnPosition) https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getcolumnwidthcolumnposition
   * Gets the width in pixels of the given column.
   * @param {number} columnPosition
   * @returns {number} pixels
   */
  getColumnWidth(column) {
    return this.__getFirstSheet().getColumnWidth(column);
  }

  /**
   * getRowHeight(rowPosition) https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getrowheightrowposition
   * Gets the height in pixels of the given row.
   * @param {number} rowPosition
   * @returns {number} pixels
   */
  getRowHeight(row) {
    return this.__getFirstSheet().getRowHeight(row);
  }

  /**
   *  @return {string} the spreadsheet id
   */
  getId() {
    return this.__meta.spreadsheetId;
  }
  /* this one seems deprecated - same as get id
   *  @return {string} the spreadsheet id
   */
  getKey() {
    return this.getId();
  }
  /**
   *  @return {string} the spreadsheet name
   */
  getName() {
    return this.__meta.properties.title;
  }
  /**
   * @return {number} number of sheets in the spreadsheet
   */
  getNumSheets() {
    return this.__meta.sheets.length;
  }
  /**
   * @return {FakeSheets[]} the sheets in the spreadsheet
   */
  getSheets() {
    return this.__meta.sheets.map((f) => newFakeSheet(f.properties, this));
  }
  __getSheetMeta(id) {
    return this.__meta.sheets.find((f) => f.properties.sheetId === id);
  }

  /**
   * @return {string} the spreadsheet url
   */
  getUrl() {
    return this.__meta.spreadsheetUrl;
  }
  /**
   * Gets the sheet with the given ID.
   * @param {number} id The ID of the sheet to get.
   * @return {FakeSheet|null} the sheet in the spreadsheet
   */
  getSheetById(id) {
    const sheets = this.getSheets();
    return sheets.find((f) => f.getSheetId() === id) || null;
  }
  /**
   * Returns a sheet with the given name..
   * @param {string} name The ID of the sheet to get.
   * @return {FakeSheet|null} the sheet in the spreadsheet
   */
  getSheetByName(name) {
    const sheets = this.getSheets();
    return sheets.find((f) => f.getName() === name) || null;
  }
  /**
   * Returns id of first sheet.
   * this is kind of a nonsense method as the answer should always be the id of the first sheet
   * the apps script docs are misleading
   * @return {number} the first sheet id in the spreadsheet
   */
  getSheetId() {
    return this.__getFirstSheet().getSheetId();
  }
  /**
   * Returns name of first sheet.
   * this is kind of a nonsense method as the answer should always be the id of the first sheet
   * the apps script docs are misleading
   * @return {id} the first sheet name in the spreadsheet
   */
  getSheetName() {
    return this.__getFirstSheet().getName();
  }
  /**
   * setColumnWidth(columnPosition, width) https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#setcolumnwidthcolumnposition,-width
   * @param {number} columnPosition	The position of the given column to set.
   * @param {number} width  The width in pixels to set it to
   * @param {setColumnWidth(columnPosition, width)} range
   * @returns {FakeSheet}
   */
  setColumnWidth(column, width) {
    return this.__getFirstSheet().setColumnWidth(column, width);
  }

  /**
   * setRowHeight(rowPosition, height) https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#setrowheightrowposition,-height
   * Sets the row height of the given row in pixels.
   * @param {} range
   * @returns {FakeSheet}
   */
  setRowHeight(row, height) {
    return this.__getFirstSheet().setRowHeight(row, height);
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
    const { nargs, matchThrow } = signatureArgs(arguments, "insertSheet");

    // The index of the newly created sheet. To insert a sheet as the first one in the spreadsheet, set it to 0.
    let sheetIndex = null;
    let sheetName = null;
    let sheetOptions = null;

    if (!nargs) {
      // use defaults
    } else if (nargs === 1) {
      // insertSheet(sheetIndex)
      // insertSheet(options)
      // insertSheet(sheetName)
      if (is.number(indexOrOptionsOrNameA)) {
        sheetIndex = indexOrOptionsOrNameA;
      } else if (is.object(indexOrOptionsOrNameA)) {
        sheetOptions = indexOrOptionsOrNameA;
      } else if (is.string(indexOrOptionsOrNameA)) {
        sheetName = indexOrOptionsOrNameA;
      } else {
        matchThrow();
      }
    } else if (nargs === 2) {
      // insertSheet(sheetName, sheetIndex)
      // insertSheet(sheetName, options)
      // insertSheet(sheetIndex, options)
      if (
        is.number(indexOrOptionsOrNameA) &&
        is.object(indexOrOptionsOrNameB)
      ) {
        sheetIndex = indexOrOptionsOrNameA;
        sheetOptions = indexOrOptionsOrNameB;
      } else if (
        is.string(indexOrOptionsOrNameA) &&
        is.object(indexOrOptionsOrNameB)
      ) {
        sheetName = indexOrOptionsOrNameA;
        sheetOptions = indexOrOptionsOrNameB;
      } else if (
        is.string(indexOrOptionsOrNameA) &&
        is.number(indexOrOptionsOrNameB)
      ) {
        sheetName = indexOrOptionsOrNameA;
        sheetIndex = indexOrOptionsOrNameB;
      } else {
        matchThrow();
      }
    } else if (nargs === 3) {
      // insertSheet(sheetIndex, sheetName, options)
      if (!is.object(onlyOptions)) {
        matchThrow();
      }
      sheetOptions = onlyOptions;
    } else {
      matchThrow();
    }

    // TODO validate options as they could be Fake objects needing serialized !!
    if (sheetOptions) {
      return notYetImplemented ('handling options in  insertSheet')
    }

    const pack = {
      properties: {
        sheetType: "GRID",
      },
    };
    if (is.number(sheetIndex)) {
      pack.properties.index = sheetIndex;
    }
    if (sheetName) {
      pack.properties.title = sheetName;
    }

    let requests = [
      {
        addSheet: pack,
      },
    ];

    // let sheets handle errors
    const result = batchUpdate({ spreadsheet: this, requests });
    const sheet = newFakeSheet(result.replies[0].addSheet.properties, this);

    return sheet;
    /* 
     {"spreadsheetId":"1i4eEijAwm0b62iL_IEV8NUSZwlWPDP51thgAWQHGols","replies":[{"addSheet":{"properties":{"sheetId":630852383,"title":"Sheet2","index":1,"sheetType":"GRID","gridProperties":{"rowCount":1000,"columnCount":26}}}}]}
 */
  }

  insertDataSourceSheet(spec) {
    const { nargs, matchThrow } = signatureArgs(
      arguments,
      "Spreadsheet.insertDataSourceSheet"
    );
    if (nargs !== 1 || !spec || spec.toString() !== "DataSourceSpec")
      matchThrow();

    const request = {
      addSheet: {
        properties: {
          dataSourceSheetProperties: {
            dataSource: {
              spec: spec.__getApiObject(),
            },
          },
        },
      },
    };
    const response = batchUpdate({ spreadsheet: this, requests: [request] });
    const newSheetProps = response.replies[0].addSheet.properties;
    return newFakeSheet(newSheetProps, this);
  }

  __getDataSourceById(dataSourceId) {
    // Need to get all data sources from the spreadsheet metadata
    const meta = this.__getMetaProps("dataSources");
    const allDataSources = meta.dataSources || [];
    const apiDataSource = allDataSources.find(
      (ds) => ds.dataSourceId === dataSourceId
    );
    return apiDataSource ? newFakeDataSource(apiDataSource, this) : null;
  }

  __disruption() {
    // This re-fetches the local meta for the spreadsheet object.
    this.__updateMeta(
      Sheets.Spreadsheets.get(
        this.getId(),
        { fields: minSheetFields },
        { ss: true }
      )
    );
  }

  getRange(range) {
    // this should be in sheet1!a1:a2 format
    const parts = range.split("!");
    const sheet =
      parts.length === 2 ? this.getSheetByName(parts[0]) : this.getSheets()[0];
    const rangePart = parts.length === 2 ? parts[1] : parts[0];
    if (!rangePart || !sheet) {
      throw new Error(`Invalid range ${range}`);
    }
    return sheet.getRange(rangePart);
  }

  toString() {
    return "Spreadsheet";
  }

  /**
   * createTextFinder(findText) https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#createTextFinder(String)
   * @param {String} text
   * @returns {FakeTextFinder}
   */
  createTextFinder(text) {
    return newFakeTextFinder(this, text);
  }

  /**
   * getNamedRange(name, range) https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getNamedRanges()
   * @returns {FakeNamedRange[]}
   */
  getNamedRanges() {
    const obj = {
      spreadsheetId: this.getId(),
      fields: "namedRanges",
    };
    const res = this.__get(obj).namedRanges;
    if (res && res.length > 0) {
      const spreadsheet = this;
      return res.map((e) => newFakeNamedRange(spreadsheet, e));
    }
    return [];
  }

  /**
   * setNamedRange(name, range) https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#setNamedRange(String,Range)
   * @param {String} name
   * @param {FakeSheetRange} range
   * @returns {void}
   */
  setNamedRange(name, range) {
    const sheetId = range.getSheet().getSheetId();
    const startRowIndex = range.getRow() - 1;
    const endRowIndex = startRowIndex + range.getNumRows();
    const startColumnIndex = range.getColumn() - 1;
    const endColumnIndex = startColumnIndex + range.getNumColumns();
    const obj = {
      spreadsheetId: this.getId(),
      requests: [
        {
          addNamedRange: {
            namedRange: {
              name,
              range: {
                sheetId,
                startRowIndex,
                endRowIndex,
                startColumnIndex,
                endColumnIndex,
              },
            },
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return null;
  }

  getRangeByName(name) {
    const obj = {
      spreadsheetId: this.getId(),
      fields: "namedRanges",
    };
    const res = this.__get(obj).namedRanges;
    if (res && res.length > 0) {
      const spreadsheet = this;
      const r = res.find((e) => e.name == name);
      if (r) {
        const sheet = this.getSheetById(r.range.sheetId);
        return sheet.getRange(
          r.range.startRowIndex + 1,
          r.range.startColumnIndex + 1,
          r.range.endRowIndex - r.range.startRowIndex,
          r.range.endColumnIndex - r.range.startColumnIndex
        );
      }
    }
    return null;
  }

  getProtections(type) {
    if (!type) {
      throw new Error("Please set protection type.");
    }
    const obj = {
      spreadsheetId: this.getId(),
      fields: "sheets(protectedRanges)",
    };
    const res = this.__get(obj).sheets;
    if (res && res.length > 0) {
      const checkKeys = [
        "startRowIndex",
        "endRowIndex",
        "startColumnIndex",
        "endColumnIndex",
      ];
      const ar = res.reduce((arr, o) => {
        if (o.protectedRanges && o.protectedRanges.length > 0) {
          arr.push(
            ...o.protectedRanges.filter((r) => {
              if (type == "RANGE") {
                return checkKeys.every((k) => r.range.hasOwnProperty(k));
              } else if (type == "SHEET") {
                return checkKeys.every((k) => !r.range.hasOwnProperty(k));
              }
              return false;
            })
          );
        }
        return arr;
      }, []);
      const spreadsheet = this;
      return ar.map((e) => newFakeProtection(spreadsheet, e));
    }
    return [];
  }

  __batchUpdate({ spreadsheetId, requests }) {
    Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheetId);
  }

  __get({ spreadsheetId, ranges, fields = "*" }) {
    return Sheets.Spreadsheets.get(spreadsheetId, { ranges, fields });
  }
}
