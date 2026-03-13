import '@mcpher/gas-fakes'
import { initTests } from './testinit.js'
import { wrapupTest, trasher, checkBackend } from './testassist.js'
import is from '@sindresorhus/is'

export const testMsGraphExcel = (pack) => {

  if (!checkBackend('msgraph')) return pack
  const { unit, fixes: originalFixes } = pack || initTests()

  ScriptApp.__platform = 'msgraph'
  const toTrash = []

  unit.section('MS Graph Excel Operations', t => {
    // Create a new workbook
    const name = `gas-fakes-test-excel-${Date.now()}.xlsx`;
    const ss = SpreadsheetApp.create(name);
    console.log(`...Created MS Excel Workbook: ${ss.getId()}`);
    t.true(is.nonEmptyString(ss.getId()));
    
    // We can't trash directly via SpreadsheetApp, but we can via DriveApp
    const file = DriveApp.getFileById(ss.getId());
    toTrash.push(file);

    const sheet = ss.getSheets()[0];
    t.is(sheet.getName(), 'Sheet1', 'Default sheet should be Sheet1');

    // Set and get values
    const range = sheet.getRange("A1:B2");
    const values = [["Hello", "Excel"], ["MS", "Graph"]];
    range.setValues(values);

    // MS Graph can have propagation delay
    Utilities.sleep(2000);

    const gotValues = range.getValues();
    t.deepEqual(gotValues, values, 'Values should match after set and get');

    // Test sheet name with spaces and special chars
    // (Note: MS Excel handles sheet renaming via workbook/worksheets/{id} PATCH)
    // For now we just test accessing existing sheet
  });

  if (!pack) {
    unit.report()
  }

  // Cleanup
  if (originalFixes.CLEAN) {
    unit.section('MS Graph Excel Cleanup', t => {
      trasher(toTrash);
    });
  }

  return { unit, fixes: originalFixes }
}

wrapupTest(testMsGraphExcel);
