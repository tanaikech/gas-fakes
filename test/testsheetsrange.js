// all these imports
// this is loaded by npm, but is a library on Apps Script side

import "../main.js";

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from "./testinit.js";
import { getDrivePerformance, getSheetsPerformance } from "./testassist.js";
import { maketss, trasher } from "./testassist.js";

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsRange = (pack) => {
  const { unit, fixes } = pack || initTests();
  const toTrash = [];
  unit.section("namedRange", (t) => {
    const { sheet, ss: spreadsheet } = maketss("sample", toTrash, fixes);
    sheet.clear();
    const spreadsheetId = spreadsheet.getId();

    // Create named ranges
    const name1 = "sampleNamedRange1";
    const range1 = sheet.getRange("A1:B2");
    const name2 = "sampleNamedRange2";
    const range2 = sheet.getRange("C1:E2");
    spreadsheet.setNamedRange(name1, range1);
    spreadsheet.setNamedRange(name2, range2);
    t.is(spreadsheet.getNamedRanges().length, 2);

    // Get created named ranges from Spreadsheet
    const res1 = spreadsheet
      .getNamedRanges()
      .map(
        (rr) =>
          `${rr.getName()}: '${rr.getRange().getSheet().getSheetName()}'!${rr
            .getRange()
            .getA1Notation()}`
      );
    t.is(spreadsheet.getNamedRanges().length, 2);
    const check1 = [
      "sampleNamedRange1: 'sample'!A1:B2",
      "sampleNamedRange2: 'sample'!C1:E2",
    ];
    t.is(res1.filter((e) => check1.includes(e)).length, 2);

    // Get created named ranges from Sheet
    const res2 = sheet
      .getNamedRanges()
      .map(
        (rr) =>
          `${rr.getName()}: '${rr.getRange().getSheet().getSheetName()}'!${rr
            .getRange()
            .getA1Notation()}`
      );
    const check2 = [
      "sampleNamedRange1: 'sample'!A1:B2",
      "sampleNamedRange2: 'sample'!C1:E2",
    ];
    t.is(res2.filter((e) => check2.includes(e)).length, 2);

    // Update named ranges.
    spreadsheet
      .getNamedRanges()
      .sort((a, b) => (a.getName() > b.getName() ? 1 : -1))
      .forEach((r, i) => {
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
    const check3 = [
      "sampleNamedRange1_10: 'sample'!C1:D2",
      "sampleNamedRange2_11: 'sample'!E1:G2",
    ];
    t.is(res3.filter((e) => check3.includes(e)).length, 2);

    // Remove named ranges
    spreadsheet.getNamedRanges().forEach((r) => r.remove());
    t.is(spreadsheet.getNamedRanges().length, 0);

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  // running standalone
  if (!pack) {
    if (Drive.isFake)
      console.log(
        "...cumulative drive cache performance",
        getDrivePerformance()
      );
    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
    unit.report();
  }

  trasher(toTrash);
  return { unit, fixes };
};

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute"
// for example node testdrive.js execute
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute"))
  testSheetsRange();
