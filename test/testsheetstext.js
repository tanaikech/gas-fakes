// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { getDrivePerformance, getSheetsPerformance } from './testassist.js';
import { maketss, trasher, makeSheetsGridRange, makeExtendedValue, dateToSerial, fillRange } from './testassist.js';
import is from '@sindresorhus/is';


// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsText = (pack) => {

  const { unit, fixes } = pack || initTests()
  const toTrash = []

  unit.section("spreadsheet textfinder", t => {
    const searchText = "sample";
    const values = [
      ["sample", "sámplé"],
      ["SampleA", "sámplé"],
      ["=SAMPLE()", "=SámpléB()"],
      ["=sample()", "=sámpléB()"],
      ["=sampleA()", "=sámpléB()"],
    ];

    const { sheet, ss: spreadsheet } = maketss('sample', toTrash, fixes);
    sheet.clear();
    const spreadsheetId = spreadsheet.getId();

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

    t.deepEqual(res1, {
      spreadsheetTextFinder: ['A1', 'A2'],
      sheetTextFinder: ['A1', 'A2'],
      rangeTextFinder: []
    })


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
    t.deepEqual(res2, {
      spreadsheetTextFinder: ['A1', 'B1', 'B2'],
      sheetTextFinder: ['A1', 'B1', 'B2'],
      rangeTextFinder: []
    })

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
    t.deepEqual(res3, {
      spreadsheetTextFinder: ['A1', 'A2', 'A3', 'A4', 'A5'],
      sheetTextFinder: ['A1', 'A2', 'A3', 'A4', 'A5'],
      rangeTextFinder: ['A3', 'A4', 'A5']
    })

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
    t.deepEqual(res4, {
      spreadsheetTextFinder: ['A1', 'B1', 'B2'],
      sheetTextFinder: ['A1', 'B1', 'B2'],
      rangeTextFinder: []
    })


    const res5 = Object.fromEntries(
      [...ar].map(([k, v]) => {
        sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
        return [k, v.createTextFinder(searchText).replaceAllWith("test")];
      })
    );
    t.deepEqual(res5, { spreadsheetTextFinder: 2, sheetTextFinder: 2, rangeTextFinder: 0 })

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
    t.deepEqual(res6, { spreadsheetTextFinder: 1, sheetTextFinder: 1, rangeTextFinder: 0 })


    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())

  })




  // running standalone
  if (!pack) {
    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
    unit.report()

  }

  trasher(toTrash)
  return { unit, fixes }
}

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute" 
// for example node testdrive.js execute
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testSheetsText()
