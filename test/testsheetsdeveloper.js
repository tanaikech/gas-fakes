// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { getSheetsPerformance } from '../src/support/sheetscache.js';
import { getPerformance } from '../src/support/filecache.js';
import { maketss, trasher, makeSheetsGridRange, makeExtendedValue, dateToSerial, fillRange } from './testassist.js';
import is from '@sindresorhus/is';


// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsDeveloper = (pack) => {

  const { unit, fixes } = pack || initTests()
  const toTrash = []

  unit.section("Developer Metadata", t => {
    const { ss, sheet } = maketss('dev_metadata_tests', toTrash, fixes);

    let colMeta, entireRowMeta, sheetMeta;

    // Define ranges for testing
    const multiDimRange = sheet.getRange("B2:D4");      // Arbitrary multi-row, multi-column
    const partialRowRange = sheet.getRange("B6:D6");    // Arbitrary single-row, multi-column
    const partialColumnRange = sheet.getRange("F2:F5"); // Arbitrary single-column, multi-row
    const singleCellRange = sheet.getRange("A1"); // Valid single-cell
    const entireRowRange = sheet.getRange("8:8");      // Valid entire row
    const entireColumnRange = sheet.getRange("G:G");   // Valid entire column

    // Test adding to a multi-column, multi-row range (should fail)
    const expectedError = /Adding developer metadata to arbitrary ranges is not currently supported. Developer metadata may only be added to the top-level spreadsheet, an individual sheet, or an entire row or column./;
    t.rxMatch((t.threw(() => multiDimRange.addDeveloperMetadata("multiKey", "multiValue")))?.message || "no error thrown", expectedError, "Should throw error for multi-dimension arbitrary range");

    // Test adding to a partial row range (should fail)
    t.rxMatch((t.threw(() => partialRowRange.addDeveloperMetadata("partialRowKey", "partialRowValue")))?.message || "no error thrown", expectedError, "Should throw error for partial row arbitrary range");

    // Test adding to a partial column range (should fail)
    t.rxMatch((t.threw(() => partialColumnRange.addDeveloperMetadata("partialColKey", "partialColValue")))?.message || "no error thrown", expectedError, "Should throw error for partial column arbitrary range");

    // Test adding to a single cell range (should fail as it's not an entire row/column)
    t.rxMatch((t.threw(() => singleCellRange.addDeveloperMetadata("cellKey", "cellValue")))?.message || "no error thrown", expectedError, "Should throw error for single cell range");

    // Test adding to an entire column range (should succeed)
    const returnedColRange = entireColumnRange.addDeveloperMetadata("colKey", "colValue", SpreadsheetApp.DeveloperMetadataVisibility.PROJECT);
    t.is(returnedColRange.getA1Notation(), entireColumnRange.getA1Notation(), "addDeveloperMetadata on Range should return the same range");
    const colMetas = entireColumnRange.getDeveloperMetadata();
    t.is(colMetas.length, 1, "Should find one metadata on entire column range");
    colMeta = colMetas[0];
    t.is(colMeta.getKey(), "colKey", "Column metadata key");
    t.is(colMeta.getValue(), "colValue", "Column metadata value");
    t.is(colMeta.getVisibility().toString(), "PROJECT", "Column metadata visibility");
    t.is(colMeta.getLocation().getLocationType().toString(), "COLUMN", "Column metadata location type");
    const foundColMeta = sheet.getRange("G3").getDeveloperMetadata();
    t.is(foundColMeta.length, 0, "Should NOT find column metadata on an intersecting single cell");

    // Test adding to an entire row range (should succeed)
    const returnedRowRange = entireRowRange.addDeveloperMetadata("entireRowKey", "entireRowValue");
    t.is(returnedRowRange.getA1Notation(), entireRowRange.getA1Notation(), "addDeveloperMetadata on Range should return the same range");
    const entireRowMetas = entireRowRange.getDeveloperMetadata();
    t.is(entireRowMetas.length, 1, "Should find one metadata on entire row range");
    entireRowMeta = entireRowMetas[0];
    t.is(entireRowMeta.getKey(), "entireRowKey", "Entire row metadata key");
    t.is(entireRowMeta.getLocation().getLocationType().toString(), "ROW", "Entire row metadata location type");
    const foundEntireRowMeta = sheet.getRange("C8").getDeveloperMetadata();
    t.is(foundEntireRowMeta.length, 0, "Should NOT find row metadata on an intersecting single cell");

    // Test Sheet metadata
    const returnedSheet = sheet.addDeveloperMetadata("sheetKey", "sheetValue");
    t.is(returnedSheet.getSheetId(), sheet.getSheetId(), "addDeveloperMetadata on Sheet should return the same sheet");
    const foundSheetMeta = sheet.getDeveloperMetadata();
    t.is(foundSheetMeta.length, 1, "Should find one metadata entry on sheet");
    sheetMeta = foundSheetMeta[0];
    t.is(sheetMeta.getKey(), "sheetKey", "Sheet metadata key");
    t.is(sheetMeta.getValue(), "sheetValue", "Sheet metadata value");
    t.is(sheetMeta.getVisibility().toString(), "DOCUMENT", "Sheet metadata default visibility");
    t.is(sheetMeta.getLocation().getLocationType().toString(), "SHEET", "Sheet metadata location type");
    t.is(foundSheetMeta.length, 1, "Should find one metadata entry on sheet");
    t.is(foundSheetMeta[0].getKey(), "sheetKey", "Found sheet metadata key should match");

    // Test Finder from Spreadsheet
    const finder = ss.createDeveloperMetadataFinder();
    finder.withKey("colKey");
    const results = finder.find();
    t.is(results.length, 1, "Finder should find metadata by key");
    t.is(results[0].getValue(), "colValue", "Finder result value should be correct");

    // Test finder with multiple criteria
    const finder2 = ss.createDeveloperMetadataFinder().withKey("sheetKey").withValue("sheetValue");
    const results2 = finder2.find();
    t.is(results2.length, 1, "Finder with multiple criteria should find metadata");
    t.is(results2[0].getId(), sheetMeta.getId(), "Finder with multiple criteria should find correct metadata");

    // Test update
    sheetMeta.setValue("updatedValue").setKey("updatedKey");
    const updatedMeta = sheet.getDeveloperMetadata()[0];
    t.is(updatedMeta.getValue(), "updatedValue", "Metadata value should be updated");
    t.is(updatedMeta.getKey(), "updatedKey", "Metadata key should be updated");

    // Test remove
    colMeta.remove();
    t.is(entireColumnRange.getDeveloperMetadata().length, 0, "Column metadata should be removed from range");

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance());
  });


  // running standalone
  if (!pack) {
    if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())
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

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testSheetsDeveloper()
