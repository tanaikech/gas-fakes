import "../../main.js";
import { FakeSpreadsheetApp } from "../../src/services/spreadsheetapp/fakespreadsheetapp.js";
import { moveToTempFolder, deleteTempFile } from "./tempfolder.js";

const spreadsheet = SpreadsheetApp.create("sample");
const spreadsheetId = spreadsheet.getId();
moveToTempFolder(spreadsheetId);

const sheet = spreadsheet.getSheets()[0];

/**
 * setFrozenColumns, setFrozenRows
 */
sheet.setFrozenColumns(2);
sheet.setFrozenRows(2);

/**
 * moveColumns, moveRows
 */
const range1 = sheet.getRange("A1:B1");
sheet.moveColumns(range1, 8);
const range2 = sheet.getRange("A1:A2");
sheet.moveRows(range2, 8);

/**
 * isColumnHiddenByUser, isRowHiddenByUser, isRowHiddenByFilter
 */
sheet.hideColumn(sheet.getRange("B2"));
sheet.hideColumns(2, 1);
sheet.hideRow(sheet.getRange("B2"));
sheet.hideRows(2, 1);
console.log(sheet.isColumnHiddenByUser(2));
console.log(sheet.isRowHiddenByUser(2));
console.log(sheet.isRowHiddenByFilter(2));

deleteTempFile(spreadsheetId);
