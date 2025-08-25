import "../../main.js";
import { FakeSpreadsheetApp } from "../../src/services/spreadsheetapp/fakespreadsheetapp.js";
import { moveToTempFolder, deleteTempFile } from "./tempfolder.js";

const spreadsheet = SpreadsheetApp.openById(
  "1xkf6x6z_n9dpogsjIb0QfbYmASo4H97xBS-OtEIw2Kw"
);
const sheet = spreadsheet.getSheets()[0];
sheet.setName("sample");
const r = spreadsheet.getRangeByName("test111");
if (r) {
  console.log(r.getA1Notation());
}
