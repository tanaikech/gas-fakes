import "../../main.js";
import { moveToTempFolder, deleteTempFile } from "./tempfolder.js";

const searchText = "sample";
const values = [
  ["sample", "sámplé"],
  ["SampleA", "sámplé"],
  ["=SAMPLE()", "=SámpléB()"],
  ["=sample()", "=sámpléB()"],
  ["=sampleA()", "=sámpléB()"],
];

const spreadsheet = SpreadsheetApp.create("sample");
const spreadsheetId = spreadsheet.getId();
moveToTempFolder(spreadsheetId);

const sheet = spreadsheet.getSheets()[0].clear();
sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
const range = sheet.getRange("A3:B5");

const obj = {
  spreadsheetTextFinder: spreadsheet,
  sheetTextFinder: sheet,
  rangeTextFinder: range,
};
const ar = Object.entries(obj);

const res1 = Object.fromEntries(
  [...ar].map(([k, v]) => [
    k,
    v
      .createTextFinder(searchText)
      .findAll()
      .map((r) => r.getA1Notation()),
  ])
);
console.log(res1);

const res2 = Object.fromEntries(
  [...ar].map(([k, v]) => [
    k,
    v
      .createTextFinder(searchText)
      .ignoreDiacritics(true)
      .matchCase(true)
      .matchEntireCell(true)
      .findAll()
      .map((r) => r.getA1Notation()),
  ])
);
console.log(res2);

const res3 = Object.fromEntries(
  [...ar].map(([k, v]) => [
    k,
    v
      .createTextFinder(searchText)
      .matchFormulaText(true)
      .findAll()
      .map((r) => r.getA1Notation()),
  ])
);
console.log(res3);

const res4 = Object.fromEntries(
  [...ar].map(([k, v]) => [
    k,
    v
      .createTextFinder(searchText)
      .matchFormulaText(true)
      .ignoreDiacritics(true)
      .matchCase(true)
      .matchEntireCell(true)
      .findAll()
      .map((r) => r.getA1Notation()),
  ])
);
console.log(res4);

const res5 = Object.fromEntries(
  [...ar].map(([k, v]) => {
    sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
    return [k, v.createTextFinder(searchText).replaceAllWith("test")];
  })
);
console.log(res5);

const res6 = Object.fromEntries(
  [...ar].map(([k, v]) => {
    sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
    return [
      k,
      v
        .createTextFinder(searchText)
        .matchFormulaText(true)
        .matchCase(true)
        .matchEntireCell(true)
        .replaceAllWith("test"),
    ];
  })
);
console.log(res6);

deleteTempFile(spreadsheetId);

/** Both gas-fakes and Google Apps Script editor returns the following result.
{
  spreadsheetTextFinder: [ 'A1', 'A2' ],
  sheetTextFinder: [ 'A1', 'A2' ],
  rangeTextFinder: []
}
{
  spreadsheetTextFinder: [ 'A1', 'B1', 'B2' ],
  sheetTextFinder: [ 'A1', 'B1', 'B2' ],
  rangeTextFinder: []
}
{
  spreadsheetTextFinder: [ 'A1', 'A2', 'A3', 'A4', 'A5' ],
  sheetTextFinder: [ 'A1', 'A2', 'A3', 'A4', 'A5' ],
  rangeTextFinder: [ 'A3', 'A4', 'A5' ]
}
{
  spreadsheetTextFinder: [ 'A1', 'B1', 'B2' ],
  sheetTextFinder: [ 'A1', 'B1', 'B2' ],
  rangeTextFinder: []
}
{ spreadsheetTextFinder: 2, sheetTextFinder: 2, rangeTextFinder: 0 }
{ spreadsheetTextFinder: 1, sheetTextFinder: 1, rangeTextFinder: 0 }
 */
