import "../../main.js";
import { FakeSpreadsheetApp } from "../../src/services/spreadsheetapp/fakespreadsheetapp.js";
import { moveToTempFolder, deleteTempFile } from "./tempfolder.js";

const spreadsheet = SpreadsheetApp.openById("");
const sheet = spreadsheet.getSheets()[0];
const data = ["sample1", "sample2", "sample3"];
sheet.appendRow(data).getSheetId();
const a = [sheet.getLastRow(), 1];
const b = [sheet.getLastColumn(), data.length];
const c = [sheet.getRange(1, 1, 1, data.length).getValues(), [data]];
console.log(a);
console.log(b);
console.log(c);
