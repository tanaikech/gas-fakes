import "../../main.js";
import { FakeSpreadsheetApp } from "../../src/services/spreadsheetapp/fakespreadsheetapp.js";
import { moveToTempFolder, deleteTempFile } from "./tempfolder.js";

const spreadsheet = SpreadsheetApp.openById("###");
const sheet = spreadsheet.getSheets()[0];
sheet.setName("sample");

const r = spreadsheet.getRangeByName("test111");
if (r) {
  console.log(r.getA1Notation());
}
