// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { maketss, trasher, getPerformance, getSheetsPerformance } from './testassist.js';
import is from '@sindresorhus/is';



// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsExotics = (pack) => {

  const { unit, fixes } = pack || initTests()
  const toTrash = []

  unit.section('Range.setShowHyperlink', (t) => {
    const { ss, sheet } = maketss(t.options.description, toTrash, fixes);
    const range = sheet.getRange('A1');
    range.setFormula('=HYPERLINK("http://www.google.com","Google")');

    const spreadsheetId = ss.getId();
    const sheetName = sheet.getName();
    const fields = 'sheets.data.rowData.values.userEnteredFormat.hyperlinkDisplayType';

    const getDisplayType = (a1Notation) => {
      const result = Sheets.Spreadsheets.get(spreadsheetId, {
        ranges: [`'${sheetName}'!${a1Notation}`],
        fields: fields
      });
      return result.sheets?.[0]?.data?.[0]?.rowData?.[0]?.values?.[0]?.userEnteredFormat?.hyperlinkDisplayType;
    };

    // Default behavior is LINKED. In the API, this is often represented by the property being absent.
    let displayType = getDisplayType('A1');
    t.true(displayType === 'LINKED' || is.undefined(displayType), 'Hyperlink should be shown by default (LINKED or undefined)');


    range.setShowHyperlink(false);
    SpreadsheetApp.flush();
    t.is(getDisplayType('A1'), 'PLAIN_TEXT', 'Hyperlink should be hidden and display as plain text');

    range.setShowHyperlink(true);
    SpreadsheetApp.flush();
    t.is(getDisplayType('A1'), 'LINKED', 'Hyperlink should be shown again');

    t.rxMatch(t.threw(() => range.setShowHyperlink(null))?.message || "no error thrown",
      /The parameters \(null\) don't match the method signature/,
      "The live environment throws an error for setShowHyperlink(null), so this test sould throw."
    )


    // Test RangeList
    const rangeList = sheet.getRangeList(['C1', 'D1']);
    sheet.getRange('C1').setFormula('=HYPERLINK("http://www.example.com","Example")');
    sheet.getRange('D1').setFormula('=HYPERLINK("http://www.bing.com","Bing")');
    SpreadsheetApp.flush();

    rangeList.setShowHyperlink(false);
    SpreadsheetApp.flush();
    t.is(getDisplayType('C1'), 'PLAIN_TEXT', 'RangeList: C1 hyperlink should be hidden');
    t.is(getDisplayType('D1'), 'PLAIN_TEXT', 'RangeList: D1 hyperlink should be hidden');

    rangeList.setShowHyperlink(true);
    SpreadsheetApp.flush();
    t.is(getDisplayType('C1'), 'LINKED', 'RangeList: C1 hyperlink should be shown');
    t.is(getDisplayType('D1'), 'LINKED', 'RangeList: D1 hyperlink should be shown');

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance());


  });

  unit.section("Range Grouping Methods", t => {
    const { sheet, ss } = maketss('grouping_tests', toTrash, fixes);

    // Helper function to get groups from the sheet
    const getGroups = (sheetId) => {
      const meta = Sheets.Spreadsheets.get(ss.getId(), { fields: 'sheets(properties.sheetId,rowGroups(range,depth,collapsed),columnGroups(range,depth,collapsed))' });
      const sheetMeta = meta.sheets.find(s => s.properties.sheetId === sheetId);
      return {
        rowGroups: sheetMeta.rowGroups || [],
        columnGroups: sheetMeta.columnGroups || []
      };
    };

    let rowGroups, columnGroups;

    // 1. Test creating row groups
    const rowRange = sheet.getRange("A2:A5"); // 4 rows
    rowRange.shiftRowGroupDepth(1); // Create one level of grouping
    ({ rowGroups, columnGroups } = getGroups(sheet.getSheetId()));

    t.is(rowGroups.length, 1, "Should create one row group");
    t.is(columnGroups.length, 0, "Should be no column groups yet");
    t.is(rowGroups[0].range.startIndex, 1, "Row group start index should be 1 (for row 2)");
    t.is(rowGroups[0].range.endIndex, 5, "Row group end index should be 5 (for row 5)");
    t.is(rowGroups[0].depth, 1, "Row group depth should be 1");
    // The API omits the 'collapsed' property when it's false. A falsy check handles this.
    t.falsey(rowGroups[0].collapsed, "Row group should not be collapsed by default");

    // 2. Test creating a nested row group
    const nestedRowRange = sheet.getRange("A3:A4");
    nestedRowRange.shiftRowGroupDepth(1);
    ({ rowGroups, columnGroups } = getGroups(sheet.getSheetId()));


    t.is(rowGroups.length, 2, "Should now have two row groups");
    const outerGroup = rowGroups.find(g => g.depth === 1);
    const innerGroup = rowGroups.find(g => g.depth === 2);
    t.truthy(outerGroup, "Outer group should exist");
    t.truthy(innerGroup, "Inner group should exist");
    t.is(innerGroup.range.startIndex, 2, "Inner row group start index");
    t.is(innerGroup.range.endIndex, 4, "Inner row group end index");

    // 3. Test collapsing groups
    sheet.getRange("A1:A10").collapseGroups(); // Collapse all groups in this range
    ({ rowGroups, columnGroups } = getGroups(sheet.getSheetId()));
    const outerGroupAfterCollapse = rowGroups.find(g => g.depth === 1);
    const innerGroupAfterCollapse = rowGroups.find(g => g.depth === 2);
    t.true(outerGroupAfterCollapse.collapsed, "Outermost group should be collapsed");
    t.falsey(innerGroupAfterCollapse.collapsed, "Inner group should not be collapsed by a non-recursive call");

    // 4. Test expanding groups
    sheet.getRange("A3:A4").expandGroups(); // Expand only the inner group
    ({ rowGroups, columnGroups } = getGroups(sheet.getSheetId()));
    const outerGroupAfterExpand = rowGroups.find(g => g.depth === 1);
    const innerGroupAfterExpand = rowGroups.find(g => g.depth === 2);
    t.falsey(outerGroupAfterExpand.collapsed, "Outer group should also be expanded");
    t.falsey(innerGroupAfterExpand.collapsed, "Inner group should be expanded");

    // 5. Test creating column groups
    const colRange = sheet.getRange("C1:E1");
    colRange.shiftColumnGroupDepth(2); // Create two levels of grouping at once
    ({ rowGroups, columnGroups } = getGroups(sheet.getSheetId()));
    t.is(columnGroups.length, 2, "Should create two column groups");
    t.is(columnGroups[0].depth, 1, "First column group depth");
    t.is(columnGroups[1].depth, 2, "Second column group depth");
    t.is(columnGroups[0].range.startIndex, 2, "Column group start index (for col C)");
    t.is(columnGroups[0].range.endIndex, 5, "Column group end index (for col E)");

    // 6. Test removing a group level
    rowRange.shiftRowGroupDepth(-1); // Remove one level from the outer group
    ({ rowGroups, columnGroups } = getGroups(sheet.getSheetId()));
    t.is(rowGroups.length, 1, "Should have one row group left after removing one level");
    t.is(rowGroups[0].depth, 1, "Remaining row group should now have depth 1");

    // 7. Test removing all groups
    sheet.getRange("A1:Z100").shiftRowGroupDepth(-10).shiftColumnGroupDepth(-10); // Remove all possible groups
    ({ rowGroups, columnGroups } = getGroups(sheet.getSheetId()));
    t.is(rowGroups.length, 0, "All row groups should be removed");
    t.is(columnGroups.length, 0, "All column groups should be removed");

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

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testSheetsExotics()
