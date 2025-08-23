import "../../main.js";
import { FakeSpreadsheetApp } from "../../src/services/spreadsheetapp/fakespreadsheetapp.js";
import { moveToTempFolder, deleteTempFile } from "./tempfolder.js";

const spreadsheet = SpreadsheetApp.create("sample");
const sheet = spreadsheet.getSheets()[0];
const spreadsheetId = spreadsheet.getId();
moveToTempFolder(spreadsheetId);

// Create named ranges
const name1 = "sampleNamedRange1";
const range1 = sheet.getRange("A1:B2");
const name2 = "sampleNamedRange2";
const range2 = sheet.getRange("C1:E2");
spreadsheet.setNamedRange(name1, range1);
spreadsheet.setNamedRange(name2, range2);

// Get created named ranges from Spreadsheet
const res1 = spreadsheet
  .getNamedRanges()
  .map(
    (rr) =>
      `${rr.getName()}: '${rr.getRange().getSheet().getSheetName()}'!${rr
        .getRange()
        .getA1Notation()}`
  );
console.log(res1);

// Get created named ranges from Sheet
const res2 = sheet
  .getNamedRanges()
  .map(
    (rr) =>
      `${rr.getName()}: '${rr.getRange().getSheet().getSheetName()}'!${rr
        .getRange()
        .getA1Notation()}`
  );
console.log(res2);

// Update named ranges.
spreadsheet.getNamedRanges().forEach((r, i) => {
  r.setName(`${r.getName()}_${i + 10}`);
  const range = r.getRange().offset(0, 2);
  r.setRange(range);
});
const res3 = spreadsheet
  .getNamedRanges()
  .map(
    (rr) =>
      `${rr.getName()}: '${rr.getRange().getSheet().getSheetName()}'!${rr
        .getRange()
        .getA1Notation()}`
  );
console.log(res3);

// Remove named ranges
spreadsheet.getNamedRanges().forEach((r) => r.remove());

deleteTempFile(spreadsheetId);
