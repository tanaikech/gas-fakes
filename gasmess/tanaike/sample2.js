import "../../main.js";
import { FakeSpreadsheetApp } from "../../src/services/spreadsheetapp/fakespreadsheetapp.js";
import { moveToTempFolder, deleteTempFile } from "./tempfolder.js";

const spreadsheet = SpreadsheetApp.create("sample");
const spreadsheetId = spreadsheet.getId();
moveToTempFolder(spreadsheetId);

spreadsheet.insertSheet("temp");
const sheet = spreadsheet.getSheets()[0];

/**
 * appendRow
 */
sheet.appendRow(["sample1", "sample2", "sample3"]);

/**
 * hideSheet, showSheet
 */
sheet.hideSheet();
sheet.showSheet();

/**
 * autoResizeColumn, autoResizeColumns
 */
sheet.getRange(1, 1, 1, 3).setValues([["sample1", "sample2", "sample3"]]);
sheet.autoResizeColumn(2);
sheet.autoResizeColumns(1, 3);

/**
 * insertColumnAfter,insertColumnBefore,insertColumns,insertColumnsAfter,insertColumnsBefore
 */
sheet.insertColumnAfter(2);
sheet.insertColumnBefore(2);
sheet.insertColumns(2, 2);
sheet.insertColumnsAfter(2, 2);
sheet.insertColumnsBefore(2, 2);

/**
 * insertRowAfter, insertRowBefore, insertRows, insertRowsAfter, insertRowsBefore
 */
sheet.insertRowAfter(2);
sheet.insertRowBefore(2);
sheet.insertRows(2, 2);
sheet.insertRowsAfter(2, 2);
sheet.insertRowsBefore(2, 2);

/**
 * deleteColumn, deleteColumns, deleteRow, deleteRows
 */
sheet.deleteColumn(2);
sheet.deleteColumns(2, 2);
sheet.deleteRow(2);
sheet.deleteRows(2, 2);

/**
 * hideColumn, hideColumns, hideRow, hideRows, unhideColumn, unhideRow
 */
sheet.hideColumn(sheet.getRange("B2"));
sheet.hideColumns(2, 2);
sheet.hideRow(sheet.getRange("B2"));
sheet.hideRows(2, 2);
sheet.unhideColumn(sheet.getRange("B2"));
sheet.unhideRow(sheet.getRange("B2"));

deleteTempFile(spreadsheetId);
