// all these imports
// this is loaded by npm, but is a library on Apps Script side

import is from "@sindresorhus/is";
import "../main.js";

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from "./testinit.js";

import {
  prepareTarget,
  eString,
  maketss,
  trasher,
  rgbToHex,
  getRandomRgb,
  getRandomHex,
  getStuff,
  fillRange,
  fillRangeFromDomain,
  isEnum,
  BLACK,
  transpose2DArray,
} from "./testassist.js";
import { getSheetsPerformance } from "./testassist.js";

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheets = (pack) => {
  const { unit, fixes } = pack || initTests();
  const toTrash = [];

  unit.section("R1C1 Formula Notation", (t) => {
    const { sheet } = maketss("r1c1_formulas", toTrash, fixes);
    sheet.clear();

    // Test 1: Single cell, relative references
    const cellA1 = sheet.getRange("A1");
    cellA1.setFormulaR1C1("=R[1]C[1]"); // Should be =B2
    t.is(
      cellA1.getFormula(),
      "=B2",
      "A1: setFormulaR1C1 with relative refs should produce correct A1 formula"
    );
    t.is(
      cellA1.getFormulaR1C1(),
      "=R[1]C[1]",
      "A1: getFormulaR1C1 should return the same relative formula"
    );

    // Test 2: Single cell, absolute references
    const cellC3 = sheet.getRange("C3");
    cellC3.setFormulaR1C1("=R1C1"); // Should be =$A$1
    t.is(
      cellC3.getFormula(),
      "=$A$1",
      "C3: setFormulaR1C1 with absolute refs should produce correct A1 formula"
    );
    t.is(
      cellC3.getFormulaR1C1(),
      "=R1C1",
      "C3: getFormulaR1C1 for absolute ref should be correct"
    );

    // Test 3: Single cell, mixed references
    const cellD4 = sheet.getRange("D4");
    cellD4.setFormulaR1C1("=R[1]C1"); // Relative row, absolute col. From D4, this is row 5, col A. => =$A5
    t.is(
      cellD4.getFormula(),
      "=$A5",
      "D4: setFormulaR1C1 with mixed refs (R[1]C1) should be correct"
    );
    t.is(
      cellD4.getFormulaR1C1(),
      "=R[1]C1",
      "D4: getFormulaR1C1 for mixed refs (R[1]C1) should be correct"
    );

    cellD4.setFormulaR1C1("=R1C[1]"); // Absolute row, relative col. From D4, this is row 1, col E. => =E$1
    t.is(
      cellD4.getFormula(),
      "=E$1",
      "D4: setFormulaR1C1 with mixed refs (R1C[1]) should be correct"
    );
    t.is(
      cellD4.getFormulaR1C1(),
      "=R1C[1]",
      "D4: getFormulaR1C1 for mixed refs (R1C[1]) should be correct"
    );

    // Test 4: Single cell, negative relative references
    const cellE5 = sheet.getRange("E5");
    cellE5.setFormulaR1C1("=R[-2]C[-1]"); // From E5, this is D3. => =D3
    t.is(
      cellE5.getFormula(),
      "=D3",
      "E5: setFormulaR1C1 with negative relative refs should be correct"
    );
    t.is(
      cellE5.getFormulaR1C1(),
      "=R[-2]C[-1]",
      "E5: getFormulaR1C1 for negative relative refs should be correct"
    );

    // Test 5: Getting R1C1 from an A1 formula
    const cellF6 = sheet.getRange("F6");
    cellF6.setFormula("=G10"); // Relative
    t.is(
      cellF6.getFormulaR1C1(),
      "=R[4]C[1]",
      "F6: getFormulaR1C1 from relative A1 formula"
    );

    cellF6.setFormula("=$H$12"); // Absolute
    t.is(
      cellF6.getFormulaR1C1(),
      "=R12C8",
      "F6: getFormulaR1C1 from absolute A1 formula"
    );

    // Test 6: Multiple references in one formula
    const cellG7 = sheet.getRange("G7");
    cellG7.setFormulaR1C1("=R[-1]C[-1]+R1C1*R[1]C[1]"); // =F6+$A$1*H8
    t.is(
      cellG7.getFormula(),
      "=F6+$A$1*H8",
      "G7: setFormulaR1C1 with multiple refs"
    );
    t.is(
      cellG7.getFormulaR1C1(),
      "=R[-1]C[-1]+R1C1*R[1]C[1]",
      "G7: getFormulaR1C1 with multiple refs"
    );

    // Test 7: setFormulasR1C1 and getFormulasR1C1
    const rangeB10_C11 = sheet.getRange("B10:C11");
    const r1c1Formulas = [
      ["=R[1]C", "=R1C1"],
      ["=R[-1]C[-1]", "Value"],
    ];
    rangeB10_C11.setFormulasR1C1(r1c1Formulas);

    const expectedA1 = [
      ["=B11", "=$A$1"],
      ["=A10", "=Value"],
    ];
    t.deepEqual(
      rangeB10_C11.getFormulas(),
      expectedA1,
      "setFormulasR1C1 should produce correct A1 formulas"
    );
    const expectedR1C1 = [
      ["=R[1]C[0]", "=R1C1"],
      ["=R[-1]C[-1]", "=Value"],
    ];
    t.deepEqual(
      rangeB10_C11.getFormulasR1C1(),
      expectedR1C1,
      "getFormulasR1C1 should return correct canonical R1C1 formulas"
    );

    // Test 8: Formulas with text and references (to test quote handling)
    const cellH15 = sheet.getRange("H15");
    cellH15.setFormulaR1C1('=R[-1]C & " some text R1C1 not a ref"'); // =H14 & "..."
    t.is(
      cellH15.getFormula(),
      '=H14 & " some text R1C1 not a ref"',
      "R1C1 formula with quotes should convert correctly to A1"
    );
    t.is(
      cellH15.getFormulaR1C1(),
      '=R[-1]C[0] & " some text R1C1 not a ref"',
      "getFormulaR1C1 should handle quotes correctly"
    );

    // Test 9: Edge case - reference to self
    const cellJ20 = sheet.getRange("J20");
    cellJ20.setFormulaR1C1("=R[0]C[0]"); // =J20
    t.is(cellJ20.getFormula(), "=J20", "R1C1 self-reference to A1");
    t.is(cellJ20.getFormulaR1C1(), "=R[0]C[0]", "A1 self-reference to R1C1");

    // Test 10: Range references
    const cellA2 = sheet.getRange("A2");
    cellA2.setFormulaR1C1("=SUM(R[-1]C:R[-1]C[2])"); // From A2, this is SUM(A1:C1)
    t.is(cellA2.getFormula(), "=SUM(A1:C1)", "R1C1 relative range to A1");
    t.is(
      cellA2.getFormulaR1C1(),
      "=SUM(R[-1]C[0]:R[-1]C[2])",
      "A1 relative range to R1C1 canonical"
    );

    const cellB3 = sheet.getRange("B3");
    cellB3.setFormula("=SUM($A$1:B$2)"); // Mixed absolute/relative range
    t.is(
      cellB3.getFormulaR1C1(),
      "=SUM(R1C1:R2C[0])",
      "A1 mixed range to R1C1"
    );
    cellB3.setFormulaR1C1("=SUM(R1C1:R2C[0])");
    t.is(cellB3.getFormula(), "=SUM($A$1:B$2)", "R1C1 mixed range to A1");

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("getRange with R1C1 notation", (t) => {
    const { sheet } = maketss("getrange_r1c1", toTrash, fixes);

    // Test 1: Single cell R1C1
    const range1 = sheet.getRange("R5C3");
    t.is(range1.getA1Notation(), "C5", "getRange with R1C1 single cell");
    t.is(range1.getRow(), 5, "R1C1 single cell row");
    t.is(range1.getColumn(), 3, "R1C1 single cell column");

    // Test 2: Range R1C1
    const range2 = sheet.getRange("R2C2:R4C5");
    t.is(range2.getA1Notation(), "B2:E4", "getRange with R1C1 range");
    t.is(range2.getNumRows(), 3, "R1C1 range num rows");
    t.is(range2.getNumColumns(), 4, "R1C1 range num columns");

    // Test 3: Inverted Range R1C1
    const range3 = sheet.getRange("R10C5:R1C2");
    t.is(range3.getA1Notation(), "B1:E10", "getRange with inverted R1C1 range");

    // Test 4: Fallback to A1 for invalid R1C1
    const range4 = sheet.getRange("RC1"); // Invalid R1C1
    t.is(
      range4.getA1Notation(),
      "RC1",
      "Should fallback to A1 for invalid R1C1"
    );

    // Test 5: Lowercase R1C1
    const range5 = sheet.getRange("r1c1:r2c2");
    t.is(range5.getA1Notation(), "A1:B2", "getRange with lowercase r1c1 range");

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("Sheet.sort()", (t) => {
    const { sheet } = maketss("sheet_sort_tests", toTrash, fixes);

    // Test 1: Basic sort ascending, preserving header
    sheet.clear();
    let initialData = [
      ["Header1", "Header2", "Header3"],
      ["C", 30, "Z"],
      ["A", 10, "Y"],
      ["B", 20, "X"],
    ];
    sheet.getRange("A1:C4").setValues(initialData);
    sheet.sort(2); // Sort by column B, ascending (default)
    let sortedData = sheet.getDataRange().getValues();
    let expectedSortedAsc = [
      ["A", 10, "Y"],
      ["B", 20, "X"],
      ["C", 30, "Z"],
      ["Header1", "Header2", "Header3"],
    ];
    t.deepEqual(
      sortedData,
      expectedSortedAsc,
      "sort() should sort data ascending, including the header"
    );

    // Test 2: Sort descending
    sheet.getRange("A1:C4").setValues(initialData); // Reset data
    sheet.sort(1, false); // Sort by column A, descending
    sortedData = sheet.getDataRange().getValues();
    const expectedSortedDesc = [
      ["Header1", "Header2", "Header3"],
      ["C", 30, "Z"],
      ["B", 20, "X"],
      ["A", 10, "Y"],
    ];
    t.deepEqual(
      sortedData,
      expectedSortedDesc,
      "sort(col, false) should sort descending, including the header"
    );

    // Test 3: Sort an empty sheet
    sheet.clear();
    sheet.sort(1);
    const emptyValues = sheet.getDataRange().getValues();
    t.deepEqual(
      emptyValues,
      [[""]],
      "sort() on an empty sheet should do nothing and not throw an error"
    );

    // Test 4: Sort a sheet with only a header
    sheet.clear();
    const headerOnly = [["H1", "H2", "H3"]];
    sheet.getRange("A1:C1").setValues(headerOnly);
    sheet.sort(1);
    const headerValues = sheet.getDataRange().getValues();
    t.deepEqual(
      headerValues,
      headerOnly,
      "sort() on a sheet with only a header should do nothing and not throw an error"
    );

    // Test 5: Sort a sheet with a header and one data row
    sheet.clear();
    const oneDataRow = [
      ["H1", "H2", "H3"],
      ["B", "A", "C"],
    ];
    const expectedOneDataRowSorted = [
      ["B", "A", "C"],
      ["H1", "H2", "H3"],
    ];
    sheet.getRange("A1:C2").setValues(oneDataRow);
    sheet.sort(1);
    const oneDataRowValues = sheet.getDataRange().getValues();
    t.deepEqual(
      oneDataRowValues,
      expectedOneDataRowSorted,
      "sort() on a sheet with one data row should sort the header as well"
    );

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("Range Merging Methods", (t) => {
    const { sheet } = maketss("merging_tests", toTrash, fixes);

    // Setup: put some values in cells
    sheet.getRange("A1:F10").setValues(
      Array(10)
        .fill(0)
        .map((_, r) =>
          Array(6)
            .fill(0)
            .map((_, c) => `R${r + 1}C${c + 1}`)
        )
    );

    // Test 1: merge() and isPartOfMerge()
    const mergeRange = sheet.getRange("A1:B2");
    mergeRange.merge();
    t.true(
      sheet.getRange("A1").isPartOfMerge(),
      "A1 should be part of a merge"
    );
    t.true(
      sheet.getRange("B2").isPartOfMerge(),
      "B2 should be part of a merge"
    );
    t.true(
      mergeRange.isPartOfMerge(),
      "The whole merged range should be part of a merge"
    );
    t.false(
      sheet.getRange("C3").isPartOfMerge(),
      "C3 should not be part of a merge"
    );
    t.is(
      mergeRange.getDisplayValue(),
      "R1C1",
      "Display value of merged range should be top-left cell's value"
    );

    // Test 2: getMergedRanges()
    let mergedRanges = sheet.getRange("A1:C3").getMergedRanges();
    t.is(
      mergedRanges.length,
      1,
      "getMergedRanges should find one intersecting merge"
    );
    t.is(
      mergedRanges[0].getA1Notation(),
      "A1:B2",
      "The found merged range should be A1:B2"
    );

    // Test 3: breakApart()
    mergeRange.breakApart();
    t.false(
      sheet.getRange("A1").isPartOfMerge(),
      "A1 should no longer be part of a merge after breakApart"
    );
    mergedRanges = sheet.getDataRange().getMergedRanges();
    t.is(
      mergedRanges.length,
      0,
      "There should be no merged ranges on the sheet after breakApart"
    );

    // Test 4: mergeAcross()
    const acrossRange = sheet.getRange("D1:F2");
    acrossRange.mergeAcross();
    mergedRanges = sheet.getDataRange().getMergedRanges();
    t.is(
      mergedRanges.length,
      2,
      "mergeAcross on a 2-row range should create 2 merged ranges"
    );
    const notations = mergedRanges.map((r) => r.getA1Notation()).sort();
    t.deepEqual(
      notations,
      ["D1:F1", "D2:F2"],
      "mergeAcross should create correct horizontal merges"
    );
    t.is(
      sheet.getRange("D1").getDisplayValue(),
      "R1C4",
      "Display value of first across-merge"
    );
    t.is(
      sheet.getRange("D2").getDisplayValue(),
      "R2C4",
      "Display value of second across-merge"
    );
    acrossRange.breakApart();

    // Test 5: mergeVertically()
    const verticalRange = sheet.getRange("A5:B7");
    verticalRange.mergeVertically();
    mergedRanges = sheet.getDataRange().getMergedRanges();
    t.is(
      mergedRanges.length,
      2,
      "mergeVertically on a 2-column range should create 2 merged ranges"
    );
    const vertNotations = mergedRanges.map((r) => r.getA1Notation()).sort();
    t.deepEqual(
      vertNotations,
      ["A5:A7", "B5:B7"],
      "mergeVertically should create correct vertical merges"
    );
    t.is(
      sheet.getRange("A5").getDisplayValue(),
      "R5C1",
      "Display value of first vertical-merge"
    );
    t.is(
      sheet.getRange("B5").getDisplayValue(),
      "R5C2",
      "Display value of second vertical-merge"
    );
    verticalRange.breakApart();

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("Sheet clearing methods", (t) => {
    const { sheet } = maketss("sheet_clearing", toTrash, fixes);

    const setupSheet = () => {
      const range = sheet.getRange("A1:C3");
      const values = [
        ["A1", "B1", "C1"],
        ["A2", "B2", "C2"],
        ["A3", "B3", "C3"],
      ];
      const backgrounds = [
        ["#ff0000", "#00ff00", "#0000ff"],
        ["#ffff00", "#00ffff", "#ff00ff"],
        ["#cccccc", "#999999", "#666666"],
      ];
      const notes = [
        ["Note A1", "Note B1", "Note C1"],
        ["Note A2", "Note B2", "Note C2"],
        ["Note A3", "Note B3", "Note C3"],
      ];
      range.setValues(values);
      range.setBackgrounds(backgrounds);
      range.setNotes(notes);
      const validationRule = SpreadsheetApp.newDataValidation()
        .requireNumberEqualTo(5)
        .build();
      range.setDataValidation(validationRule);
      return { range, values, backgrounds, notes, validationRule };
    };

    // --- Test clear() ---
    let setup = setupSheet();
    sheet.clear();
    let testRange = sheet.getRange(setup.range.getA1Notation()); // Re-fetch range to get cleared state

    t.deepEqual(
      testRange.getValues(),
      fillRange(testRange, ""),
      "clear() should clear values"
    );
    t.deepEqual(
      testRange.getBackgrounds(),
      fillRange(testRange, "#ffffff"),
      "clear() should clear formats"
    );
    t.deepEqual(
      testRange.getNotes(),
      setup.notes,
      "clear() should NOT clear notes"
    );
    const validationsAfterClear = testRange.getDataValidations();
    t.truthy(
      validationsAfterClear[0][0],
      "clear() should NOT clear data validations"
    );

    // --- Test clearContents() ---
    setup = setupSheet();
    sheet.clearContents();
    testRange = sheet.getRange(setup.range.getA1Notation());
    t.deepEqual(
      testRange.getValues(),
      fillRange(testRange, ""),
      "clearContents() should clear values"
    );
    t.deepEqual(
      testRange.getBackgrounds(),
      setup.backgrounds,
      "clearContents() should NOT clear formats"
    );
    t.deepEqual(
      testRange.getNotes(),
      setup.notes,
      "clearContents() should NOT clear notes"
    );
    t.truthy(
      testRange.getDataValidations()[0][0],
      "clearContents() should NOT clear data validations"
    );

    // --- Test clearFormats() ---
    setup = setupSheet();
    sheet.clearFormats();
    testRange = sheet.getRange(setup.range.getA1Notation());
    t.deepEqual(
      testRange.getValues(),
      setup.values,
      "clearFormats() should NOT clear values"
    );
    t.deepEqual(
      testRange.getBackgrounds(),
      fillRange(testRange, "#ffffff"),
      "clearFormats() should clear formats"
    );
    t.deepEqual(
      testRange.getNotes(),
      setup.notes,
      "clearFormats() should NOT clear notes"
    );
    t.truthy(
      testRange.getDataValidations()[0][0],
      "clearFormats() should NOT clear data validations"
    );

    // --- Test clearNotes() ---
    setup = setupSheet();
    sheet.clearNotes();
    testRange = sheet.getRange(setup.range.getA1Notation());
    t.deepEqual(
      testRange.getValues(),
      setup.values,
      "clearNotes() should NOT clear values"
    );
    t.deepEqual(
      testRange.getBackgrounds(),
      setup.backgrounds,
      "clearNotes() should NOT clear formats"
    );
    t.deepEqual(
      testRange.getNotes(),
      fillRange(testRange, ""),
      "clearNotes() should clear notes"
    );
    t.truthy(
      testRange.getDataValidations()[0][0],
      "clearNotes() should NOT clear data validations"
    );

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("Range.moveTo", (t) => {
    const { sheet } = maketss("moveTo_tests", toTrash, fixes);

    const setupData = () => {
      sheet.clear();
      const sourceRange = sheet.getRange("A1:B2");
      sourceRange.setValues([
        ["A1", "B1"],
        ["A2", "B2"],
      ]);
      sourceRange.setBackground("#ff0000"); // Red
      sourceRange.setFontWeight("bold");
      return sourceRange;
    };

    // Test 1: Simple non-overlapping move
    let source = setupData();
    let target = sheet.getRange("D1");
    source.moveTo(target);

    const newRange = sheet.getRange("D1:E2");
    t.deepEqual(
      newRange.getValues(),
      [
        ["A1", "B1"],
        ["A2", "B2"],
      ],
      "Values should be moved"
    );
    t.is(newRange.getBackground(), "#ff0000", "Background should be moved");
    t.is(newRange.getFontWeight(), "bold", "Font weight should be moved");

    const clearedSource = sheet.getRange("A1:B2");
    t.deepEqual(
      clearedSource.getValues(),
      [
        ["", ""],
        ["", ""],
      ],
      "Original source values should be cleared"
    );
    t.is(
      clearedSource.getBackground(),
      "#ffffff",
      "Original source background should be cleared to default"
    );
    t.is(
      clearedSource.getFontWeight(),
      "normal",
      "Original source font weight should be cleared to default"
    );

    // Test 2: Overlapping move
    source = setupData();
    target = sheet.getRange("B1"); // Overlaps with the source
    source.moveTo(target);

    const expectedOverlapValues = [
      ["", "A1", "B1"],
      ["", "A2", "B2"],
    ];
    const overlapResultRange = sheet.getRange("A1:C2");
    t.deepEqual(
      overlapResultRange.getValues(),
      expectedOverlapValues,
      "Values should be moved correctly when overlapping"
    );
    t.is(
      sheet.getRange("B1:C2").getBackground(),
      "#ff0000",
      "Overlapping move should move format"
    );
    t.is(
      sheet.getRange("A1").getBackground(),
      "#ffffff",
      "Cleared part of overlap should have default format"
    );

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("Range.autoFill and autoFillToNeighbor", (t) => {
    const { sheet } = maketss("autofill_tests", toTrash, fixes);
    const AutoFillSeries = SpreadsheetApp.AutoFillSeries;

    // --- Test autoFill ---
    sheet.clear();
    sheet.getRange("A1:A4").setValues([[1], [2], [3], [4]]);
    const sourceRange = sheet.getRange("A1:A4");
    const destinationRange = sheet.getRange("A1:A10");
    sourceRange.autoFill(destinationRange, AutoFillSeries.DEFAULT_SERIES);

    const expectedValues = [[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]];
    t.deepEqual(
      destinationRange.getValues(),
      expectedValues,
      "autoFill should fill down with a number series"
    );

    // Test extending left
    sheet.clear();
    sheet.getRange("E1:H1").setValues([[10, 8, 6, 4]]);
    const sourceRight = sheet.getRange("E1:H1");
    const destLeft = sheet.getRange("B1:H1");
    sourceRight.autoFill(destLeft, AutoFillSeries.DEFAULT_SERIES);
    const expectedLeft = [[16, 14, 12, 10, 8, 6, 4]];
    t.deepEqual(
      destLeft.getValues(),
      expectedLeft,
      "autoFill should fill left with a decreasing number series"
    );

    // --- Test autoFillToNeighbor ---
    sheet.clear();
    const neighborData = Array.from({ length: 20 }, (_, i) => [i + 1]);
    sheet.getRange("A1:A20").setValues(neighborData);
    sheet.getRange("B1:B2").setValues([["Jan"], ["Feb"]]);

    const neighborSource = sheet.getRange("B1:B2");
    neighborSource.autoFillToNeighbor(AutoFillSeries.DEFAULT_SERIES);

    const neighborResult = sheet.getRange("B1:B20").getValues().flat();
    t.is(
      neighborResult[2],
      "Mar",
      "autoFillToNeighbor should fill month series (Mar)"
    );
    t.is(
      neighborResult.length,
      20,
      "autoFillToNeighbor should fill down to the neighbor's extent"
    );

    // Test error conditions for autoFill
    const invalidDest1 = sheet.getRange("C1:C5"); // Does not contain source
    t.rxMatch(
      t.threw(() =>
        sourceRange.autoFill(invalidDest1, AutoFillSeries.DEFAULT_SERIES)
      )?.message || "",
      /destination range must contain the source range/
    );

    const invalidDest2 = sheet.getRange("A1:B10"); // Extends in two directions
    t.rxMatch(
      t.threw(() =>
        sourceRange.autoFill(invalidDest2, AutoFillSeries.DEFAULT_SERIES)
      )?.message || "",
      /AutoFill destination range must extend the source range in only one direction./
    );
    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("notes", (t) => {
    const { sheet } = maketss("notes tests", toTrash, fixes);
    const range = sheet.getRange("c2:g20");
    const notes = fillRangeFromDomain(range, ["foo", "bar", ""]);

    const strNotes = notes.map((row) =>
      row.map((c) => {
        // because set notes adds .0 to integer string conversions
        // but see issue https://issuetracker.google.com/issues/429373214
        let v = c?.toString() || "";
        if (is.number(c) && is.integer(c)) v = c.toFixed(1);
        return v;
      })
    );

    range.setNote(notes[0][0]);
    t.is(range.getNote(), strNotes[0][0]);
    t.deepEqual(range.getNotes(), fillRange(range, strNotes[0][0]));

    range.setNotes(notes);
    t.deepEqual(range.getNotes(), strNotes);

    t.rxMatch(
      t.threw(() => range.setNotes("foo"))?.message || "no throw",
      /don't match the method signature/
    );

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("rich text tests", (t) => {
    const { sheet } = maketss("rich text tests", toTrash, fixes);

    // Test 1: single rich text value
    const range1 = sheet.getRange("A1");
    const boldStyle = SpreadsheetApp.newTextStyle().setBold(true).build();
    const italicStyle = SpreadsheetApp.newTextStyle().setItalic(true).build();

    const richTextValue = SpreadsheetApp.newRichTextValue()
      .setText("Bold Italic Link")
      .setTextStyle(0, 4, boldStyle)
      .setTextStyle(5, 11, italicStyle)
      .setLinkUrl(12, 16, "https://google.com")
      .build();

    range1.setRichTextValue(richTextValue);

    const result1 = range1.getRichTextValue();
    t.is(result1.getText(), "Bold Italic Link", "Text should match");

    const runs1 = result1.getRuns();
    t.is(runs1.length, 5, "Should have 5 runs, including unstyled segments");

    // Check first run (Bold)
    t.is(runs1[0].getStartIndex(), 0, "Run 1 (Bold) start index");
    t.is(runs1[0].getEndIndex(), 4, "Run 1 (Bold) end index");
    t.true(runs1[0].getTextStyle().isBold(), "Run 1 should be bold");
    t.false(runs1[0].getTextStyle().isItalic(), "Run 1 should not be italic");
    t.is(runs1[0].getLinkUrl(), null, "Run 1 should not have a link");

    // Check second run (space)
    t.is(runs1[1].getStartIndex(), 4, "Run 2 (space) start index");
    t.is(runs1[1].getEndIndex(), 5, "Run 2 (space) end index");
    t.false(runs1[1].getTextStyle().isBold(), "Run 2 should not be bold");
    t.false(runs1[1].getTextStyle().isItalic(), "Run 2 should not be italic");
    t.is(runs1[1].getLinkUrl(), null, "Run 2 should not have a link");

    // Check third run (Italic)
    t.is(runs1[2].getStartIndex(), 5, "Run 3 (Italic) start index");
    t.is(runs1[2].getEndIndex(), 11, "Run 3 (Italic) end index");
    t.false(runs1[2].getTextStyle().isBold(), "Run 3 should not be bold");
    t.true(runs1[2].getTextStyle().isItalic(), "Run 3 should be italic");
    t.is(runs1[2].getLinkUrl(), null, "Run 3 should not have a link");

    // Check fourth run (space)
    t.is(runs1[3].getStartIndex(), 11, "Run 4 (space) start index");
    t.is(runs1[3].getEndIndex(), 12, "Run 4 (space) end index");
    t.false(runs1[3].getTextStyle().isBold(), "Run 4 should not be bold");
    t.false(runs1[3].getTextStyle().isItalic(), "Run 4 should not be italic");
    t.is(runs1[3].getLinkUrl(), null, "Run 4 should not have a link");

    // Check fifth run (Link)
    t.is(runs1[4].getStartIndex(), 12, "Run 5 (Link) start index");
    t.is(runs1[4].getEndIndex(), 16, "Run 5 (Link) end index");
    t.is(
      runs1[4].getLinkUrl(),
      "https://google.com",
      "Run 5 should have a link"
    );

    // Test 2: array of rich text values
    const range2 = sheet.getRange("B1:C2");
    const redColor = SpreadsheetApp.newColor().setRgbColor("#ff0000").build();
    const redStyle = SpreadsheetApp.newTextStyle()
      .setForegroundColorObject(redColor)
      .build();
    const blueStyle = SpreadsheetApp.newTextStyle()
      .setForegroundColor("#0000ff")
      .build();
    const underlineStyle = SpreadsheetApp.newTextStyle()
      .setUnderline(true)
      .build();
    const strikethroughStyle = SpreadsheetApp.newTextStyle()
      .setStrikethrough(true)
      .build();

    const values = [
      [
        SpreadsheetApp.newRichTextValue()
          .setText("Red")
          .setTextStyle(0, 3, redStyle)
          .build(),
        SpreadsheetApp.newRichTextValue()
          .setText("Blue")
          .setTextStyle(0, 4, blueStyle)
          .build(),
      ],
      [
        SpreadsheetApp.newRichTextValue()
          .setText("Underline")
          .setTextStyle(0, 9, underlineStyle)
          .build(),
        SpreadsheetApp.newRichTextValue()
          .setText("Strikethrough")
          .setTextStyle(0, 13, strikethroughStyle)
          .build(),
      ],
    ];

    range2.setRichTextValues(values);

    const results2 = range2.getRichTextValues();
    t.is(results2.length, 2, "Should have 2 rows");
    t.is(results2[0].length, 2, "Should have 2 columns in first row");

    t.is(results2[0][0].getText(), "Red", "B1 text");
    t.is(
      results2[0][0].getRuns()[0].getTextStyle().getForegroundColor(),
      "#ff0000",
      "B1 color"
    );

    t.is(results2[0][1].getText(), "Blue", "C1 text");
    t.is(
      results2[0][1].getRuns()[0].getTextStyle().getForegroundColor(),
      "#0000ff",
      "C1 color"
    );

    t.is(results2[1][0].getText(), "Underline", "B2 text");
    t.true(
      results2[1][0].getRuns()[0].getTextStyle().isUnderline(),
      "B2 underline"
    );

    t.is(results2[1][1].getText(), "Strikethrough", "C2 text");
    t.true(
      results2[1][1].getRuns()[0].getTextStyle().isStrikethrough(),
      "C2 strikethrough"
    );

    // Test 3: plain text cell
    const range3 = sheet.getRange("E5");
    range3.setValue("Plain text");

    const result3 = range3.getRichTextValue();
    t.is(result3.getText(), "Plain text", "Plain text should be preserved");
    t.is(
      result3.getRuns().length,
      1,
      "Should have one default run for plain text"
    );

    const style3 = result3.getTextStyle();
    t.false(style3.isBold(), "Default style should not be bold");
    t.is(style3.getFontSize(), 10, "Default font size should be 10");
    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("Range.deleteCells and Range.insertCells", (t) => {
    const { sheet } = maketss("cell_shifting_tests", toTrash, fixes);
    const Dimension = SpreadsheetApp.Dimension;

    const initialData = [
      ["A1", "B1", "C1", "D1"],
      ["A2", "B2", "C2", "D2"],
      ["A3", "B3", "C3", "D3"],
      ["A4", "B4", "C4", "D4"],
    ];

    // --- Test deleteCells(Dimension.COLUMNS) ---
    sheet.getRange("A1:D4").setValues(initialData);
    sheet.getRange("B2:C3").deleteCells(Dimension.COLUMNS);
    const expectedAfterColDelete = [
      ["A1", "B1", "C1", "D1"],
      ["A2", "D2", "", ""],
      ["A3", "D3", "", ""],
      ["A4", "B4", "C4", "D4"],
    ];
    t.deepEqual(
      sheet.getRange("A1:D4").getValues(),
      expectedAfterColDelete,
      "deleteCells(COLUMNS) should shift cells left"
    );

    // --- Test deleteCells(Dimension.ROWS) ---
    sheet.getRange("A1:D4").setValues(initialData);
    sheet.getRange("B2:C3").deleteCells(Dimension.ROWS);
    const expectedAfterRowDelete = [
      ["A1", "B1", "C1", "D1"],
      ["A2", "B4", "C4", "D2"],
      ["A3", "", "", "D3"],
      ["A4", "", "", "D4"],
    ];
    t.deepEqual(
      sheet.getRange("A1:D4").getValues(),
      expectedAfterRowDelete,
      "deleteCells(ROWS) should shift cells up"
    );

    // --- Test insertCells(Dimension.COLUMNS) ---
    sheet.getRange("A1:D4").setValues(initialData);
    sheet.getRange("B2:C2").insertCells(Dimension.COLUMNS);
    t.deepEqual(
      sheet.getRange("A1:D4").getValues(),
      [
        ["A1", "B1", "C1", "D1"],
        ["A2", "", "", "B2"],
        ["A3", "B3", "C3", "D3"],
        ["A4", "B4", "C4", "D4"],
      ],
      "insertCells(COLUMNS) should shift cells right"
    );

    // --- Test insertCells(Dimension.ROWS) ---
    sheet.getRange("A1:D4").setValues(initialData);
    sheet.getRange("B2:B3").insertCells(Dimension.ROWS);
    t.deepEqual(
      sheet.getRange("A1:D4").getValues(),
      [
        ["A1", "B1", "C1", "D1"],
        ["A2", "", "C2", "D2"],
        ["A3", "", "C3", "D3"],
        ["A4", "B2", "C4", "D4"],
      ],
      "insertCells(ROWS) should shift cells down"
    );

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("Range.getNextDataCell", (t) => {
    const { sheet } = maketss("getNextDataCell_tests", toTrash, fixes);
    const Direction = SpreadsheetApp.Direction;

    // --- Setup for DOWN/UP tests ---
    sheet.clear();
    sheet.getRange("B2").setValue("B2-val");
    sheet.getRange("B5").setValue("B5-val");
    sheet.getRange("D2:D4").setValues([["D2-val"], ["D3-val"], ["D4-val"]]);
    const maxRows = sheet.getMaxRows();
    sheet.getRange(`F${maxRows}`).setValue("F-last-val");

    // --- Test DOWN ---
    t.is(
      sheet.getRange("B1").getNextDataCell(Direction.DOWN).getA1Notation(),
      "B2",
      "DOWN: From empty to next data"
    );
    t.is(
      sheet.getRange("B2").getNextDataCell(Direction.DOWN).getA1Notation(),
      "B5",
      "DOWN: From data, over empty, to next data"
    );
    t.is(
      sheet.getRange("D2").getNextDataCell(Direction.DOWN).getA1Notation(),
      "D4",
      "DOWN: From data to end of contiguous block"
    );
    t.is(
      sheet.getRange("B5").getNextDataCell(Direction.DOWN).getA1Notation(),
      `B${maxRows}`,
      "DOWN: From data to end of sheet when no more data"
    );
    t.is(
      sheet.getRange("A1").getNextDataCell(Direction.DOWN).getA1Notation(),
      `A${maxRows}`,
      "DOWN: From empty with no data below to end of sheet"
    );
    t.is(
      sheet
        .getRange(`F${maxRows}`)
        .getNextDataCell(Direction.DOWN)
        .getA1Notation(),
      `F${maxRows}`,
      "DOWN: From last cell stays at last cell"
    );
    t.is(
      sheet.getRange("F1").getNextDataCell(Direction.DOWN).getA1Notation(),
      `F${maxRows}`,
      "DOWN: From empty cell to last cell with data"
    );

    // --- Test UP ---
    t.is(
      sheet.getRange("B4").getNextDataCell(Direction.UP).getA1Notation(),
      "B2",
      "UP: From empty to next data"
    );
    t.is(
      sheet.getRange("B5").getNextDataCell(Direction.UP).getA1Notation(),
      "B2",
      "UP: From data, over empty, to next data"
    );
    t.is(
      sheet.getRange("D4").getNextDataCell(Direction.UP).getA1Notation(),
      "D2",
      "UP: From data to start of contiguous block"
    );
    t.is(
      sheet.getRange("B2").getNextDataCell(Direction.UP).getA1Notation(),
      "B1",
      "UP: From first data to top of sheet"
    );
    t.is(
      sheet.getRange("A6").getNextDataCell(Direction.UP).getA1Notation(),
      "A1",
      "UP: From empty with no data above to top of sheet"
    );
    t.is(
      sheet.getRange("A1").getNextDataCell(Direction.UP).getA1Notation(),
      "A1",
      "UP: From first cell stays at first cell"
    );

    // --- Setup for NEXT/PREVIOUS tests ---
    sheet.clear();
    sheet.getRange("B2").setValue("B2-val");
    sheet.getRange("E2").setValue("E2-val");
    sheet.getRange("B4:D4").setValues([["B4-val", "C4-val", "D4-val"]]);
    const maxCols = sheet.getMaxColumns();
    const maxColsLetter = sheet
      .getRange(1, maxCols)
      .getA1Notation()
      .replace(/\d/g, "");
    sheet.getRange(`${maxColsLetter}6`).setValue("Last-col-val");

    // --- Test NEXT (RIGHT) ---
    t.is(
      sheet.getRange("A2").getNextDataCell(Direction.NEXT).getA1Notation(),
      "B2",
      "NEXT: From empty to next data"
    );
    t.is(
      sheet.getRange("B2").getNextDataCell(Direction.NEXT).getA1Notation(),
      "E2",
      "NEXT: From data, over empty, to next data"
    );
    t.is(
      sheet.getRange("B4").getNextDataCell(Direction.NEXT).getA1Notation(),
      "D4",
      "NEXT: From data to end of contiguous block"
    );
    t.is(
      sheet.getRange("E2").getNextDataCell(Direction.NEXT).getA1Notation(),
      `${maxColsLetter}2`,
      "NEXT: From data to end of sheet when no more data"
    );
    t.is(
      sheet.getRange("A1").getNextDataCell(Direction.NEXT).getA1Notation(),
      `${maxColsLetter}1`,
      "NEXT: From empty with no data to the right to end of sheet"
    );
    t.is(
      sheet
        .getRange(`${maxColsLetter}1`)
        .getNextDataCell(Direction.NEXT)
        .getA1Notation(),
      `${maxColsLetter}1`,
      "NEXT: From last cell stays at last cell"
    );
    t.is(
      sheet.getRange("A6").getNextDataCell(Direction.NEXT).getA1Notation(),
      `${maxColsLetter}6`,
      "NEXT: From empty cell to last cell with data"
    );

    // --- Test PREVIOUS (LEFT) ---
    t.is(
      sheet.getRange("E4").getNextDataCell(Direction.PREVIOUS).getA1Notation(),
      "D4",
      "PREVIOUS: From empty to next data"
    );
    t.is(
      sheet.getRange("E2").getNextDataCell(Direction.PREVIOUS).getA1Notation(),
      "B2",
      "PREVIOUS: From data, over empty, to next data"
    );
    t.is(
      sheet.getRange("D4").getNextDataCell(Direction.PREVIOUS).getA1Notation(),
      "B4",
      "PREVIOUS: From data to start of contiguous block"
    );
    t.is(
      sheet.getRange("B2").getNextDataCell(Direction.PREVIOUS).getA1Notation(),
      "A2",
      "PREVIOUS: From first data to start of sheet"
    );
    t.is(
      sheet.getRange("G1").getNextDataCell(Direction.PREVIOUS).getA1Notation(),
      "A1",
      "PREVIOUS: From empty with no data to the left to start of sheet"
    );
    t.is(
      sheet.getRange("A1").getNextDataCell(Direction.PREVIOUS).getA1Notation(),
      "A1",
      "PREVIOUS: From first cell stays at first cell"
    );

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("Range.copyTo", (t) => {
    const { sheet } = maketss("copyToTests", toTrash, fixes);

    // Source range setup
    const sourceRange = sheet.getRange("A1:B2");
    const sourceValues = [
      ["V1", "V2"],
      ["V3", "V4"],
    ];
    const sourceBgColor = "#ff0000"; // Red
    const sourceFontColor = "#0000ff"; // Blue
    const sourceFontSize = 14;
    const sourceFontWeight = "bold";

    sourceRange.setValues(sourceValues);
    sourceRange.setBackground(sourceBgColor);
    sourceRange.setFontColor(sourceFontColor);
    sourceRange.setFontSize(sourceFontSize);
    sourceRange.setFontWeight("bold");
    let targetRange;
    // Helper to verify formats
    const verifyFormats = (
      range,
      expectedBg,
      expectedFontColor,
      expectedFontSize,
      expectedFontWeight,
      description
    ) => {
      t.is(range.getBackground(), expectedBg, `${description} - Background`);
      t.is(
        range.getFontColor(),
        expectedFontColor,
        `${description} - Font Color`
      );
      t.is(range.getFontSize(), expectedFontSize, `${description} - Font Size`);
      t.is(
        range.getFontWeight(),
        expectedFontWeight,
        `${description} - Font Weight`
      );
    };

    // Helper to verify values
    const verifyValues = (range, expectedValues, description) => {
      t.deepEqual(range.getValues(), expectedValues, `${description} - Values`);
    };

    targetRange = sheet.getRange("A1:B2");
    t.rxMatch(
      t.threw(() => sourceRange.copyTo()).toString(),
      /don't match the method signature/
    );
    t.rxMatch(
      t.threw(() => sourceRange.copyTo()).toString(),
      /don't match the method signature/
    );
    t.rxMatch(
      t.threw(() => sourceRange.copyTo("not a range")).toString(),
      /don't match the method signature/
    );
    // skip this if on GAS since this incorrectly does not throw error - https://issuetracker.google.com/issues/427192537
    if (SpreadsheetApp.isFake) {
      t.rxMatch(
        (() => {
          const v = t.threw(() =>
            sourceRange.copyTo(targetRange, "INVALID_TYPE")
          );
          return v ? v.toString() : "t.threw - no error was thrown";
        })(),
        /don't match the method signature/
      );

      t.rxMatch(
        t
          .threw(() =>
            sourceRange.copyTo(targetRange, {
              contentsOnly: true,
              formatOnly: true,
            })
          )
          .toString(),
        /don't match the method signature/,
        "Should throw error for conflicting options"
      );

      t.rxMatch(
        t
          .threw(() =>
            sourceRange.copyTo(targetRange, { someOtherOption: true })
          )
          .toString(),
        /don't match the method signature/,
        "Should throw error for unknown options"
      );
    }
    t.rxMatch(
      t
        .threw(() =>
          sourceRange.copyTo(
            targetRange,
            SpreadsheetApp.CopyPasteType.PASTE_NORMAL,
            "not a boolean"
          )
        )
        .toString(),
      /don't match the method signature/,
      "Should throw error for invalid transposed type"
    );
    // --- Test Case 1: copyTo(destination) - PASTE_NORMAL ---

    // Target same size as source
    targetRange = sheet.getRange("D1:E2");
    sourceRange.copyTo(targetRange);
    verifyValues(targetRange, sourceValues, "PASTE_NORMAL: Same size - Values");
    verifyFormats(
      targetRange,
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "PASTE_NORMAL: Same size - Formats"
    );

    // Target smaller than source (Apps Script copies full source)
    targetRange = sheet.getRange("G1:G1"); // 1x1 target
    sourceRange.copyTo(targetRange);
    // Expected: G1:H2 should have source values/formats
    verifyValues(
      sheet.getRange("G1:H2"),
      sourceValues,
      "PASTE_NORMAL: Smaller target - Values"
    );
    verifyFormats(
      sheet.getRange("G1:H2"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "PASTE_NORMAL: Smaller target - Formats"
    );

    // Target larger than source (Apps Script repeats source)
    targetRange = sheet.getRange("J1:L4"); // 4x3 target, source 2x2
    sourceRange.copyTo(targetRange);
    let expectedValuesLarger = prepareTarget(sourceValues, targetRange); // prepareTarget handles value repetition
    verifyValues(
      sheet.getRange("J1:K4"),
      expectedValuesLarger,
      "PASTE_NORMAL: Larger target - Values"
    ); // Only check the repeated part
    verifyFormats(
      sheet.getRange("J1:K2"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "PASTE_NORMAL: Larger target - Formats (top-left repeat)"
    );
    verifyFormats(
      sheet.getRange("J3:K4"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "PASTE_NORMAL: Larger target - Formats (bottom-left repeat)"
    );
    t.is(
      sheet.getRange("L1").getBackground(),
      "#ffffff",
      "PASTE_NORMAL: Larger target - Unfilled column should be default background"
    );

    // --- Test Case 2: copyTo(destination, {contentsOnly: true}) ---

    // Clear target area first
    sheet.getRange("D5:F8").clear();
    sheet.getRange("G5:H6").clear();
    sheet.getRange("J5:L8").clear();

    // Set some initial format on target to ensure it's not overwritten
    sheet.getRange("D5:E6").setBackground("#cccccc"); // Grey background

    // Target same size
    targetRange = sheet.getRange("D5:E6");
    sourceRange.copyTo(targetRange, { contentsOnly: true });
    verifyValues(targetRange, sourceValues, "PASTE_VALUES: Same size - Values");
    t.is(
      targetRange.getBackground(),
      "#cccccc",
      "PASTE_VALUES: Same size - Background should remain"
    ); // Format should not change

    // Target smaller
    targetRange = sheet.getRange("G5:G5");
    sheet.getRange("G5:H6").setBackground("#cccccc");
    sourceRange.copyTo(targetRange, { contentsOnly: true });
    verifyValues(
      sheet.getRange("G5:H6"),
      sourceValues,
      "PASTE_VALUES: Smaller target - Values"
    );
    t.is(
      sheet.getRange("G5").getBackground(),
      "#cccccc",
      "PASTE_VALUES: Smaller target - Background should remain"
    );

    // Target larger
    targetRange = sheet.getRange("J5:L8");
    sheet.getRange("J5:L8").setBackground("#cccccc");
    sourceRange.copyTo(targetRange, { contentsOnly: true });
    expectedValuesLarger = prepareTarget(sourceValues, targetRange);
    verifyValues(
      sheet.getRange("J5:K8"),
      expectedValuesLarger,
      "PASTE_VALUES: Larger target - Values"
    );
    t.is(
      sheet.getRange("J5").getBackground(),
      "#cccccc",
      "PASTE_VALUES: Larger target - Background should remain"
    );
    t.is(
      sheet.getRange("L5").getBackground(),
      "#cccccc",
      "PASTE_VALUES: Larger target - Unfilled column background should remain"
    );

    // --- Test Case 3: copyTo(destination, {formatOnly: true}) ---

    // Clear target area first
    sheet.getRange("D9:F12").clear();
    sheet.getRange("G9:H10").clear();
    sheet.getRange("J9:L12").clear();

    // Set some initial values on target to ensure they're not overwritten
    sheet.getRange("D9:E10").setValues([
      ["X1", "X2"],
      ["X3", "X4"],
    ]);

    // Target same size
    targetRange = sheet.getRange("D9:E10");
    sourceRange.copyTo(targetRange, { formatOnly: true });
    verifyValues(
      targetRange,
      [
        ["X1", "X2"],
        ["X3", "X4"],
      ],
      "PASTE_FORMAT: Same size - Values should remain"
    ); // Values should not change
    verifyFormats(
      targetRange,
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "PASTE_FORMAT: Same size - Formats"
    );

    // Target smaller
    targetRange = sheet.getRange("G9:G9");
    sheet.getRange("G9:H10").setValues([
      ["Y1", "Y2"],
      ["Y3", "Y4"],
    ]);
    sourceRange.copyTo(targetRange, { formatOnly: true });
    verifyValues(
      sheet.getRange("G9:H10"),
      [
        ["Y1", "Y2"],
        ["Y3", "Y4"],
      ],
      "PASTE_FORMAT: Smaller target - Values should remain"
    );
    verifyFormats(
      sheet.getRange("G9:H10"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "PASTE_FORMAT: Smaller target - Formats"
    );

    // Target larger
    targetRange = sheet.getRange("J9:L12");
    sheet.getRange("J9:L12").setValues([
      ["Z1", "Z2", "Z3"],
      ["Z4", "Z5", "Z6"],
      ["Z7", "Z8", "Z9"],
      ["Z10", "Z11", "Z12"],
    ]);
    sourceRange.copyTo(targetRange, { formatOnly: true });
    verifyValues(
      sheet.getRange("J9:L12"),
      [
        ["Z1", "Z2", "Z3"],
        ["Z4", "Z5", "Z6"],
        ["Z7", "Z8", "Z9"],
        ["Z10", "Z11", "Z12"],
      ],
      "PASTE_FORMAT: Larger target - Values should remain"
    );
    verifyFormats(
      sheet.getRange("J9:K10"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "PASTE_FORMAT: Larger target - Formats (top-left repeat)"
    );
    verifyFormats(
      sheet.getRange("J11:K12"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "PASTE_FORMAT: Larger target - Formats (bottom-left repeat)"
    );
    t.is(
      sheet.getRange("L9").getBackground(),
      "#ffffff",
      "PASTE_FORMAT: Larger target - Unfilled column should be default background"
    );

    // --- Test Case 4: copyTo(destination, SpreadsheetApp.CopyPasteType.PASTE_VALUES) ---

    // Clear target area first
    sheet.getRange("D13:F16").clear();
    sheet.getRange("G13:H14").clear();
    sheet.getRange("J13:L16").clear();

    // Set some initial format on target to ensure it's not overwritten
    sheet.getRange("D13:E14").setBackground("#cccccc");

    // Target same size
    targetRange = sheet.getRange("D13:E14");
    sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_VALUES);
    verifyValues(
      targetRange,
      sourceValues,
      "PASTE_VALUES enum: Same size - Values"
    );
    // buggy in GAS so skip - see https://issuetracker.google.com/issues/427192537
    if (SpreadsheetApp.isFake) {
      t.is(
        targetRange.getBackground(),
        "#cccccc",
        "PASTE_VALUES enum: Same size - Background should remain"
      );
    }
    // Target smaller
    targetRange = sheet.getRange("G13:G13");
    sheet.getRange("G13:H14").setBackground("#cccccc");
    sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_VALUES);
    verifyValues(
      sheet.getRange("G13:H14"),
      sourceValues,
      "PASTE_VALUES enum: Smaller target - Values"
    );
    // buggy in GAS so skip - see https://issuetracker.google.com/issues/427192537
    if (SpreadsheetApp.isFake) {
      t.is(
        sheet.getRange("G13").getBackground(),
        "#cccccc",
        "PASTE_VALUES enum: Smaller target - Background should remain"
      );
    }

    // Target larger
    targetRange = sheet.getRange("J13:L16");
    sheet.getRange("J13:L16").setBackground("#cccccc");
    sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_VALUES);
    expectedValuesLarger = prepareTarget(sourceValues, targetRange);
    verifyValues(
      sheet.getRange("J13:K16"),
      expectedValuesLarger,
      "PASTE_VALUES enum: Larger target - Values"
    );
    // buggy in GAS so skip - see https://issuetracker.google.com/issues/427192537
    if (SpreadsheetApp.isFake) {
      t.is(
        sheet.getRange("J13").getBackground(),
        "#cccccc",
        "PASTE_VALUES enum: Larger target - Background should remain"
      );
    }
    t.is(
      sheet.getRange("L13").getBackground(),
      "#cccccc",
      "PASTE_VALUES enum: Larger target - Unfilled column background should remain"
    );

    // --- Test Case 5: copyTo(destination, SpreadsheetApp.CopyPasteType.PASTE_NORMAL, true) - Transposed ---

    // Clear target area first
    sheet.getRange("D17:F20").clear();
    sheet.getRange("G17:H18").clear();
    sheet.getRange("J17:L20").clear();

    // Target same size (transposed)
    targetRange = sheet.getRange("D17:E18"); // Source 2x2, target 2x2
    const transposedSourceValues = transpose2DArray(sourceValues); // [[V1, V3], [V2, V4]]
    sourceRange.copyTo(
      targetRange,
      SpreadsheetApp.CopyPasteType.PASTE_NORMAL,
      true
    );
    verifyValues(
      targetRange,
      transposedSourceValues,
      "Transposed PASTE_NORMAL: Same size - Values"
    );
    // Formats also transpose
    verifyFormats(
      sheet.getRange("D17"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "Transposed PASTE_NORMAL: Same size - Formats (D17)"
    );
    verifyFormats(
      sheet.getRange("E17"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "Transposed PASTE_NORMAL: Same size - Formats (E17)"
    );
    verifyFormats(
      sheet.getRange("D18"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "Transposed PASTE_NORMAL: Same size - Formats (D18)"
    );
    verifyFormats(
      sheet.getRange("E18"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "Transposed PASTE_NORMAL: Same size - Formats (E18)"
    );

    // Target smaller (transposed)
    targetRange = sheet.getRange("G17:G17"); // 1x1 target
    sourceRange.copyTo(
      targetRange,
      SpreadsheetApp.CopyPasteType.PASTE_NORMAL,
      true
    );
    // Expected: G17:H18 should have transposed source values/formats
    verifyValues(
      sheet.getRange("G17:H18"),
      transposedSourceValues,
      "Transposed PASTE_NORMAL: Smaller target - Values"
    );
    verifyFormats(
      sheet.getRange("G17:H18"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "Transposed PASTE_NORMAL: Smaller target - Formats"
    );

    // Target larger (transposed)
    targetRange = sheet.getRange("J17:L20"); // 4x3 target, source 2x2
    sourceRange.copyTo(
      targetRange,
      SpreadsheetApp.CopyPasteType.PASTE_NORMAL,
      true
    );
    // Use prepareTarget with the transposed source values
    const expectedTransposedRepeatedValues = prepareTarget(
      transposedSourceValues,
      targetRange
    );
    // The target is J17:L20 (4 rows, 3 cols). Transposed source is 2x2.
    // It will repeat 2 times vertically (4/2) and 1 time horizontally (3/2 = 1.5 -> 1 full repeat)
    // So the effective copied area is 4x2.
    verifyValues(
      sheet.getRange("J17:K20"),
      expectedTransposedRepeatedValues,
      "Transposed PASTE_NORMAL: Larger target - Values"
    );
    verifyFormats(
      sheet.getRange("J17:K18"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "Transposed PASTE_NORMAL: Larger target - Formats (top-left repeat)"
    );
    verifyFormats(
      sheet.getRange("J19:K20"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "Transposed PASTE_NORMAL: Larger target - Formats (bottom-left repeat)"
    );
    t.is(
      sheet.getRange("L17").getBackground(),
      "#ffffff",
      "Transposed PASTE_NORMAL: Larger target - Unfilled column should be default background"
    );

    // --- Test Case 6: Empty Source Range ---

    const emptySourceRange = sheet.getRange("A100:B101"); // An empty range
    targetRange = sheet.getRange("D100:E101");
    targetRange.setValues([
      ["X", "Y"],
      ["Z", "W"],
    ]); // Put some values in target
    targetRange.setBackground("#00ff00"); // Green background

    emptySourceRange.copyTo(targetRange);
    // Expect target to be cleared (values and formats)
    verifyValues(
      targetRange,
      [
        ["", ""],
        ["", ""],
      ],
      "Empty source: Values should be cleared"
    );
    t.is(
      targetRange.getBackground(),
      "#ffffff",
      "Empty source: Background should be cleared to default"
    );

    // --- Test Case 7: Invalid arguments ---

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("copy values and formats to range", (t) => {
    const { sheet } = maketss("prepareTarget", toTrash, fixes);

    const gargs = (target) => {
      return [
        target.getSheet(),
        target.getColumn(),
        target.getNumColumns() + target.getColumn() - 1,
        target.getRow(),
        target.getRow() + target.getNumRows() - 1,
      ];
    };

    const copyToRangeTest = (domain, method, getMethod, setMethod) => {
      const s22 = sheet.getRange(1, 1, 2, 2);
      const v22 = fillRangeFromDomain(s22, domain);

      // Case 1: Target is smaller than source (e.g., 1x1)
      let t11 = sheet.getRange(101, 11, 1, 1);
      let p11 = prepareTarget(v22, t11);
      t.deepEqual(
        v22,
        p11,
        "Target smaller than source should return full source"
      );

      // lets try writing and reading
      s22[setMethod](p11);
      s22[method](...gargs(t11));
      t.deepEqual(
        t11.offset(0, 0, s22.getNumRows(), s22.getNumColumns())[getMethod](),
        p11
      );

      // Case 2: Target is same size as source (2x2)
      const t22 = sheet.getRange(105, 11, 2, 2);
      const p22 = prepareTarget(v22, t22);
      t.deepEqual(p22, v22, "Target same size as source should return source");
      s22[method](...gargs(t22));
      t.deepEqual(t22[getMethod](), p22);

      // Case 3: Target is an exact multiple of source (e.g., 4x6)
      const t46 = sheet.getRange(110, 1, 4, 6);
      const p46 = prepareTarget(v22, t46);
      s22[method](...gargs(t46));
      t.deepEqual(t46[getMethod](), p46);

      // Case 4: Target is larger but not an exact multiple (e.g., 5x5)
      const t55 = sheet.getRange(116, 1, 5, 5);
      const p55 = prepareTarget(v22, t55);
      s22[method](...gargs(t55));
      t.deepEqual(
        t55.offset(0, 0, p55.length, p55[0].length)[getMethod](),
        p55
      );

      // Case 5: Target has one dimension smaller, one larger (e.g., 1x3)
      const t13 = sheet.getRange(122, 1, 1, 3);
      const p13 = prepareTarget(v22, t13);
      s22[method](...gargs(t13));
      t.deepEqual(
        t13.offset(0, 0, p13.length, p13[0].length)[getMethod](),
        p13
      );

      // Case 6: Target has one dimension as exact multiple, one not (e.g., 4x3)
      const t43 = sheet.getRange(128, 1, 4, 3);
      const p43 = prepareTarget(v22, t43);
      s22[method](...gargs(t43));
      t.deepEqual(
        t43.offset(0, 0, t43.getNumRows(), s22.getNumColumns())[getMethod](),
        p43
      );

      // Case 7: Non-square source (e.g., 3x2) and non-square target (e.g., 7x5)
      const s32 = sheet.getRange(11, 1, 3, 2);
      const v32 = fillRangeFromDomain(s32, domain);
      const t75 = sheet.getRange(132, 1, 7, 5);
      const p75 = prepareTarget(v32, t75);
      s32[setMethod](v32);
      s32[method](...gargs(t75));
      t.deepEqual(
        t75.offset(0, 0, p75.length, p75[0].length)[getMethod](),
        p75
      );
    };

    copyToRangeTest(
      ["bar", "foo", 1, 0, true],
      "copyValuesToRange",
      "getValues",
      "setValues"
    );
    copyToRangeTest(
      ["Comic Sans MS", "Helvetica", "Verdana,Sans Serif"],
      "copyFormatToRange",
      "getFontFamilies",
      "setFontFamilies"
    );
    copyToRangeTest(
      [10, 20, 12, 32],
      "copyFormatToRange",
      "getFontSizes",
      "setFontSizes"
    );

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("exotic styles", (t) => {
    const { sheet } = maketss("exoticcellformats", toTrash, fixes);
    const startAt = sheet.getRange("b2:e5");

    const w1 = SpreadsheetApp.WrapStrategy.OVERFLOW;
    const rw1 = startAt.offset(10, 5);
    rw1.clearFormat();
    rw1.setWrapStrategy(w1);
    const wa1 = rw1.getWrapStrategy();
    t.is(wa1.compareTo(w1), 0);
    const wa2 = rw1.getWrapStrategies();
    wa2.flat().forEach((f) => t.is(f.toString(), w1.toString()));

    const rw2 = startAt.offset(11, 6);
    const w2 = fillRangeFromDomain(rw2, [
      SpreadsheetApp.WrapStrategy.WRAP,
      SpreadsheetApp.WrapStrategy.OVERFLOW,
      SpreadsheetApp.WrapStrategy.CLIP,
    ]);

    rw2.clearFormat();
    rw2.setWrapStrategies(w2);
    const rw2s = rw2.getWrapStrategies();
    t.deepEqual(
      rw2s.flat().map((f) => f.toString()),
      w2.flat().map((f) => f.toString())
    );

    const rw3 = startAt.offset(12, 7);
    rw3.clearFormat();
    rw3.setWrapStrategy(w1);
    const w3a = rw3.getWrap();
    t.is(w3a, false);
    const w3b = rw3.getWrapStrategy();
    t.is(w3b.toString(), w1.toString());
    const rw3sb = rw3.getWrap();
    t.is(rw3sb, false);

    const rw4 = startAt.offset(14, 8);
    rw4.clearFormat();
    const w4a = rw4.getWrap();
    t.is(w4a, true);
    const w4 = fillRange(rw4, SpreadsheetApp.WrapStrategy.CLIP);
    rw4.setWrapStrategies(w4);
    const rw4sa = rw4.getWrapStrategies();
    t.deepEqual(
      rw4sa.flat().map((f) => f.toString()),
      w4.flat().map((f) => f.toString())
    );
    const rw4sb = rw4.getWraps();
    t.true(rw4sb.flat().every((f) => f === false));

    const rw5 = startAt.offset(16, 9);
    rw5.clearFormat();
    const w5a = rw5.getWrap();
    t.is(w5a, true);
    const w5 = fillRange(rw4, SpreadsheetApp.WrapStrategy.WRAP);
    rw5.setWrapStrategies(w5);
    const rw5sa = rw5.getWrapStrategies();
    t.deepEqual(
      rw5sa.flat().map((f) => f.toString()),
      w5.flat().map((f) => f.toString())
    );
    const rw5sb = rw5.getWraps();
    t.true(rw5sb.flat().every((f) => f === true));

    const rw6 = startAt.offset(18, 11);
    rw6.clearFormat();
    const w6 = fillRangeFromDomain(rw6, [true, false]);
    rw6.setWraps(w6);
    const rw6sa = rw6.getWraps();
    t.deepEqual(rw6sa, w6);
    const rw6sb = rw6.getWrapStrategies();
    t.deepEqual(
      rw6sb.flat().map((f) => f.toString()),
      w6.flat().map((f) => (f ? "WRAP" : "OVERFLOW"))
    );
    t.is(rw6.getWrap(), rw6sa[0][0]);
    rw6.setWrap(true);
    t.is(rw6.getWrap(), true);
    t.is(rw6.getWrapStrategy().toString(), "WRAP");

    // set styles
    const tob = SpreadsheetApp.ThemeColorType.ACCENT1;
    const cob = SpreadsheetApp.newColor().setThemeColor(tob);
    const t1 = SpreadsheetApp.newTextStyle()
      .setFontSize(20)
      .setForegroundColorObject(cob.build())
      .build();
    const r1 = startAt.offset(0, 0);
    r1.clearFormat();
    r1.setTextStyle(t1);
    const a1 = r1.getTextStyle();
    t.is(a1.getFontSize(), 20);
    t.is(
      a1
        .getForegroundColorObject()
        .asThemeColor()
        .getThemeColorType()
        .compareTo(tob),
      0
    );

    const t2 = SpreadsheetApp.newTextStyle()
      .setFontSize(12)
      .setFontFamily("helvetica,times new roman,arial")
      .build();
    const r2 = startAt.offset(1, 0);
    r2.clearFormat();
    r2.setTextStyle(t2);
    const a2 = r2.getTextStyles();
    a2.flat().forEach((f) => {
      t.is(f.getFontSize(), 12);
      t.is(f.getFontFamily(), "helvetica,times new roman,arial");
    });

    const t3a = SpreadsheetApp.newTextStyle()
      .setFontSize(32)
      .setFontFamily("helvetica")
      .setBold(true)
      .setUnderline(false)
      .setForegroundColor("#00ff00")
      .build();

    // check that copy works
    const t3 = t3a.copy().build();
    const r3 = startAt.offset(2, 1);
    r3.clearFormat();
    r3.setTextStyle(t3);
    const a3 = r3.getTextStyles();
    a3.flat().forEach((f) => {
      t.is(f.getFontSize(), 32);
      t.is(f.getFontFamily(), "helvetica");
      t.is(f.isBold(), true);
      t.is(f.isUnderline(), false);
      t.is(f.getForegroundColor(), "#00ff00");
    });

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("setting and repeating cell formats", (t) => {
    const tester = (range, prop, props, domain, nullIs, patcher) => {
      /// console.log(prop, props)

      // this is source data - will be randomly drawn from a set of acceptable values
      const rd = fillRangeFromDomain(range, domain);

      // in some cases the api returns different values to those set, so we fix the input data to patch what to expect instead
      // this is all about makeing the input look like what the api will return in response
      const rdn = rd
        .map((row) =>
          row.map((f) => {
            return is.null(f) ? nullIs : f;
          })
        )
        // we also may need to stringify enums to compare
        .map((row) => row.map(eString))
        // sometimes the api returns a different value to what was set or what gas expects
        .map((row) =>
          row.map((f) => {
            return patcher && Reflect.has(patcher, f) ? patcher[f] : f;
          })
        );

      // we'lso need to check when the entire range is set to the same value
      const rdnFill = fillRange(range, rdn[0][0]);

      // now do a multiple set
      range["set" + props](rd);

      // get the result of multiple set
      const cobs = range["get" + props]();

      // need to massage the results to normalize enums
      const cobsn = cobs.map((row) => row.map(eString));

      // finally we can compare results
      t.deepEqual(cobsn, rdn, props);

      // now test setting the same value on ech member of the range
      range["set" + prop](rd[0][0]);

      // get back the entire thing
      const cob = range["get" + props]();
      // normalize for enums
      const cobn = cob.map((row) => row.map(eString));

      // check all set to the expexted response
      t.deepEqual(cobn, rdnFill, prop);

      // do a single get
      const gs = range["get" + prop]();
      const gsn = eString(gs);

      t.is(gsn, rdnFill[0][0], props);

      // we can also check that the original enum matches
      if (isEnum(gs)) {
        t.is(gs.compareTo(cobs[0][0]), 0, props);
      }
    };
    const { sheet } = maketss("cellsformats", toTrash, fixes);
    const startAt = sheet.getRange("b2:e5");

    tester(
      startAt.offset(0, 0),
      "FontWeight",
      "FontWeights",
      ["bold", "normal", null],
      "normal"
    );
    tester(
      startAt.offset(5, 1),
      "FontStyle",
      "FontStyles",
      ["italic", "normal", null],
      "normal"
    );
    // note that fontsize doesnt allow anything other than an integer (ie - there is no null option)
    tester(
      startAt.offset(10, 2),
      "FontSize",
      "FontSizes",
      [10, 8, 4, 5, 20, 11],
      null
    );
    tester(
      startAt.offset(10, 2),
      "FontSize",
      "FontSizes",
      [10, 8, 4, 5, 20, 11],
      null
    );
    tester(
      startAt.offset(15, 3),
      "FontLine",
      "FontLines",
      ["line-through", "none", "underline", null],
      "none"
    );
    tester(
      startAt.offset(20, 4),
      "FontFamily",
      "FontFamilies",
      [
        "Arial,Tahoma,Times New Roman",
        "Helvetica",
        "Verdana,Sans Serif",
        "Courier New",
      ],
      null
    );
    tester(
      startAt.offset(25, 5),
      "NumberFormat",
      "NumberFormats",
      ["0.0000", "#,##0.00", "$#.##0.00", "general"],
      null,
      {
        // because we set general, but receive this default in return
        general: "0.###############",
      }
    );
    tester(
      startAt.offset(30, 6),
      "HorizontalAlignment",
      "HorizontalAlignments",
      ["left", "center", "right", "normal", null],
      "general",
      {
        // see readme oddities for why this....
        normal: Sheets.isFake ? "general" : "general-left",
      }
    );
    tester(
      startAt.offset(35, 6),
      "VerticalAlignment",
      "VerticalAlignments",
      ["top", "middle", "bottom", null],
      "bottom"
    );

    tester(
      startAt.offset(40, 7),
      "TextDirection",
      "TextDirections",
      [
        SpreadsheetApp.TextDirection.LEFT_TO_RIGHT,
        SpreadsheetApp.TextDirection.RIGHT_TO_LEFT,
        null,
      ],
      null
    );

    // note that a repeat cell will autoincrement the formulas, so Im using absolute values here
    tester(
      startAt.offset(45, 8),
      "Formula",
      "Formulas",
      [null, "=SUM($B$2:$B$4)", "=SUM($C$2:$4)", "=AVERAGE($C$2:$C$4)"],
      ""
    );
    // lets do a quick text on autincrement
    const fr1 = startAt.offset(50, 0, 2, 2);
    const frv = "=A1";
    const frr = [
      ["=A1", "=B1"],
      ["=A2", "=B2"],
    ];
    fr1.setFormula(frv);
    t.deepEqual(fr1.getFormulas(), frr);

    // TODO can't properly do text rotation because of https://issuetracker.google.com/issues/425390984.
    // revisit this when fixed
    const fr0 = startAt.offset(50, 9);
    fr0.setTextRotation(45);
    // see https://issuetracker.google.com/issues/425390984 and readme oddities - textRotation. The fake returns 0 because the API doesn't return the angle.
    const tr0 = fr0.getTextRotation();
    t.is(tr0.getDegrees(), SpreadsheetApp.isFake ? 0 : 45);
    t.is(tr0.isVertical(), false);

    fr0.setVerticalText(true);
    const tr0v = fr0.getTextRotation();
    t.is(tr0v.getDegrees(), 0);
    t.is(tr0v.isVertical(), true);

    fr0.setVerticalText(false);
    const tr1v = fr0.getTextRotation();
    t.is(tr1v.getDegrees(), 0);
    t.is(tr1v.isVertical(), false);

    // this also doesnt work in GAS so we'll skipuntil its fixed
    if (SpreadsheetApp.isFake) {
      const rotd = fillRangeFromDomain(fr0, [-2, 9, 89, null]);
      fr0.setTextRotations(rotd);
      const r2 = fr0.getTextRotations();
      // see https://issuetracker.google.com/issues/425390984 and readme oddities - textRotation. The fake returns 0 because the API doesn't return the angle.
      t.deepEqual(
        r2.flat().map((f) => f.getDegrees()),
        rotd.flat().map((f) => (SpreadsheetApp.isFake ? 0 : f))
      );
      // this should always be false if we've set rotation with a number
      t.true(r2.flat().every((f) => !f.isVertical()));
      // Note that pass TextRotation object rather than degrees throws an error in GAS so we wont be implementing that overload yet.
    }

    const startAgain = startAt.offset(100, 0);

    // fontcolorobjects
    // these are more complex so i wont bother trying to push them thru standard test
    const fr = startAgain.offset(1, 0);
    const tct = SpreadsheetApp.ThemeColorType;
    const td = Object.keys(tct)
      .filter((f) => f !== "UNSUPPORTED" && !is.function(tct[f]))
      .map((f) => tct[f]);
    const rd = fillRangeFromDomain(fr, td);
    const rc = rd.map((row) =>
      row.map((f) => SpreadsheetApp.newColor().setThemeColor(f).build())
    );

    const fr2 = startAgain.offset(5, 1);
    fr2.setFontColorObject(rc[0][0]);
    const cobs2 = fr2
      .getFontColorObjects()
      .map((row) => row.map((f) => f.asThemeColor().getThemeColorType()));
    t.deepEqual(cobs2, fillRange(fr2, rd[0][0]));
    const cob2 = fr2.getFontColorObject().asThemeColor().getThemeColorType();
    t.is(cob2, rc[0][0].asThemeColor().getThemeColorType());

    fr.setFontColorObjects(rc);
    const cobs = fr
      .getFontColorObjects()
      .map((row) => row.map((f) => f.asThemeColor().getThemeColorType()));
    t.deepEqual(cobs, rd);

    // try all that with rgb color object
    const fr3 = startAgain.offset(10, 2);
    const rd3 = fillRange(fr3, getRandomHex);
    const rc3 = rd3.map((row) =>
      row.map((f) => SpreadsheetApp.newColor().setRgbColor(f).build())
    );
    fr3.setFontColorObjects(rc3);

    const fr4 = startAgain.offset(15, 3);
    fr4.setFontColorObject(rc3[0][0]);
    const cobs4 = fr4
      .getFontColorObjects()
      .map((row) => row.map((f) => f.asRgbColor().asHexString()));
    t.deepEqual(cobs4, fillRange(fr4, rd3[0][0]));
    const cob4 = fr4.getFontColorObject().asRgbColor().asHexString();
    t.is(cob4, rc3[0][0].asRgbColor().asHexString());

    const fr5 = startAgain.offset(20, 4);
    const rd5 = fillRange(fr5, getRandomHex);
    fr5.setBackground(rd5[0][0]);
    const cobs5 = fr5.getBackgrounds();
    t.deepEqual(cobs5, fillRange(fr5, rd5[0][0]));
    const cob5 = fr5.getBackground();
    t.is(cob5, rd5[0][0]);
    fr5.setBackgrounds(rd5);
    t.deepEqual(fr5.getBackgrounds(), rd5);

    // these are undocumented
    const fr6 = startAgain.offset(25, 4);
    fr6.setBackground(rd5[0][0]);
    const cobs6 = fr6.getBackgrounds();
    t.deepEqual(cobs6, fillRange(fr6, rd5[0][0]));
    const cob6 = fr6.getBackground();
    t.is(cob5, rd5[0][0]);
    fr6.setBackgroundColors(rd5);
    t.deepEqual(fr6.getBackgroundColors(), rd5);

    // check clearing works
    const clearRange = sheet.getRange("a1:z100");
    clearRange.clearFormat();

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  // this section is kind of redundant now as I've consolodated most of these tests into setting and repearing cell formats
  // however we'll just leave these here as extra tests in any case
  unit.section("assorted cell userenteredformats", (t) => {
    const { sheet } = maketss("assorted", toTrash, fixes);
    const range = sheet.getRange("b15:e19");
    const nFormat = "0.#";
    const nFormats = fillRange(range, nFormat);
    range.setNumberFormat(nFormat);

    const nf = range.getNumberFormat();
    t.is(nf, nFormat);
    range.setNumberFormats(nFormats);
    const nfs = range.getNumberFormats();

    t.is(nf, nfs[0][0]);
    t.is(nfs.length, range.getNumRows());
    t.is(nfs[0].length, range.getNumColumns());
    t.deepEqual(nfs, nFormats);

    const fl = range.getFontLine();
    t.is(fl, "none");
    t.true(
      range
        .getFontLines()
        .flat()
        .every((f) => f === fl)
    );

    // newly created sheet has all null borders
    t.is(range.getBorder(), null);

    // default colot and style
    range.setBorder(true, true, true, true, true, true);
    // this doesnt work on GAS
    // const b1 = range.getBorders()
    const b1 = range.getBorder();
    t.is(b1.getTop().getColor().getColorType().toString(), "RGB");
    t.is(b1.getTop().getBorderStyle().toString(), "SOLID");
    t.is(b1.getBottom().getBorderStyle().toString(), "SOLID");
    t.is(b1.getLeft().getBorderStyle().toString(), "SOLID");
    t.is(b1.getRight().getBorderStyle().toString(), "SOLID");
    t.is(b1.getTop().getColor().asRgbColor().asHexString(), BLACK);

    // hopefully we can get something from an offset to mitigate the range.getBorders() thing
    const b0 = range.offset(1, 1, 1, 1).getBorder();

    // this will drop any symbols in the response
    t.deepEqual(JSON.stringify(b0), JSON.stringify(b1));

    // left should remain as before
    const GREEN = "#00ff00";
    range.setBorder(
      true,
      null,
      true,
      true,
      true,
      true,
      GREEN,
      SpreadsheetApp.BorderStyle.DASHED
    );
    const b2 = range.getBorder();
    t.is(b2.getTop().getBorderStyle().toString(), "DASHED");
    t.is(b2.getLeft().getBorderStyle().toString(), "SOLID");
    t.is(b2.getTop().getColor().asRgbColor().asHexString(), GREEN);
    t.is(b2.getLeft().getColor().asRgbColor().asHexString(), BLACK);

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("cell and font backgrounds, styles and alignments", (t) => {
    const { sheet } = maketss("cells", toTrash, fixes);

    // text styles - an empty sheet shoud all be defaults
    const range = sheet.getRange("A1:C5");
    const txss = range.getTextStyles();
    const txs = range.getTextStyle();
    t.is(txss.length, range.getNumRows());
    t.is(txss[0].length, range.getNumColumns());
    t.is(txs.toString(), "TextStyle");
    t.is(txs.getFontSize(), 10);
    t.is(txs.getFontFamily(), "arial,sans,sans-serif");
    t.is(txs.isBold(), false);
    t.is(txs.isItalic(), false);
    t.is(txs.isUnderline(), false);
    t.is(txs.isStrikethrough(), false);
    t.is(txs.getForegroundColor(), BLACK);
    t.is(txs.getForegroundColorObject().asRgbColor().asHexString(), BLACK);
    t.true(txss.flat().every((f) => f.getFontSize() === txs.getFontSize()));
    t.true(txss.flat().every((f) => f.getFontFamily() === txs.getFontFamily()));
    t.true(txss.flat().every((f) => f.isBold() === txs.isBold()));
    t.true(txss.flat().every((f) => f.isItalic() === txs.isItalic()));
    t.true(txss.flat().every((f) => f.isUnderline() === txs.isUnderline()));
    t.true(
      txss.flat().every((f) => f.isStrikethrough() === txs.isStrikethrough())
    );
    t.true(
      txss
        .flat()
        .every((f) => f.getForegroundColor() === txs.getForegroundColor())
    );
    t.true(
      txss
        .flat()
        .every(
          (f) =>
            f.getForegroundColorObject().asRgbColor().asHexString() ===
            txs.getForegroundColorObject().asRgbColor().asHexString()
        )
    );

    // backgrounds
    const backgrounds = range.getBackgrounds();
    const background = range.getBackground();
    t.true(is.nonEmptyString(background));
    t.true(is.array(backgrounds));

    // these 2 i think have just been renamed - they dont exist in the documentation any more
    t.is(range.getBackgroundColor(), background);
    t.deepEqual(range.getBackgroundColors(), backgrounds);

    t.is(backgrounds.length, range.getNumRows());
    t.is(backgrounds[0].length, range.getNumColumns());
    t.is(backgrounds[0][0], background);
    t.true(backgrounds.flat().every((f) => is.nonEmptyString(f)));
    t.is(background.substring(0, 1), "#");
    t.is(background.length, 7);
    t.is(
      background,
      "#ffffff",
      "newly created sheet will have white background"
    );

    const color = getRandomHex();
    range.setBackground(color);
    t.is(range.getBackground(), color);
    t.true(
      range
        .getBackgrounds()
        .flat()
        .every((f) => f === color)
    );

    const colorRgb = getRandomRgb();
    const color255 = [
      Math.round(colorRgb.red * 255),
      Math.round(colorRgb.green * 255),
      Math.round(colorRgb.blue * 255),
    ];
    range.setBackgroundRGB(...color255);
    t.is(range.getBackground(), rgbToHex(colorRgb));

    // some random colorsas
    const colors = fillRange(range, getRandomHex);
    const fontColors = fillRange(range, getRandomHex);

    range.setBackgrounds(colors);
    t.deepEqual(range.getBackgrounds(), colors);

    range.setFontColors(fontColors);

    // text rotations
    const rots = range.getTextRotations();
    const rot = range.getTextRotation();
    t.is(rots.length, range.getNumRows());
    t.is(rots[0].length, range.getNumColumns());
    t.true(rots.flat().every((f) => f.getDegrees() === 0));
    t.is(rot.getDegrees(), 0);
    t.true(rots.flat().every((f) => f.isVertical() === false));
    t.is(rot.isVertical(), false);

    // this is deprec, but we'll implement it anyway
    const fcs = range.getFontColors();
    const fc = range.getFontColor();
    t.is(fcs.length, range.getNumRows());
    t.is(fcs[0].length, range.getNumColumns());
    t.deepEqual(fcs, fontColors);
    t.is(fc, fontColors[0][0]);

    // default font family
    const defFamily = "Arial";
    const ffs = range.getFontFamilies();
    const ff = range.getFontFamily();
    t.is(ffs.length, range.getNumRows());
    t.is(ffs[0].length, range.getNumColumns());
    t.true(ffs.flat().every((f) => f === ff));
    t.is(ff, defFamily);

    // default font family
    const defFontSize = 10;
    const fss = range.getFontSizes();
    const fs = range.getFontSize();
    t.is(fss.length, range.getNumRows());
    t.is(fss[0].length, range.getNumColumns());
    t.true(fss.flat().every((f) => f === fs));
    t.is(fs, defFontSize);

    // default wrap
    const defWrap = true;
    const fws = range.getWraps();
    const fw = range.getWrap();
    t.is(fws.length, range.getNumRows());
    t.is(fws[0].length, range.getNumColumns());
    t.true(fws.flat().every((f) => f === fw));
    t.is(fw, defWrap);

    const defWrapStrategy = "OVERFLOW";
    const wss = range.getWrapStrategies();
    const ws = range.getWrapStrategy();
    t.is(wss.length, range.getNumRows());
    t.is(wss[0].length, range.getNumColumns());
    t.true(wss.flat().every((f) => f.toString() === ws.toString()));
    t.is(ws.toString(), defWrapStrategy);

    // the preferred way nowadays
    const fcobs = range.getFontColorObjects();
    const fcob = range.getFontColorObject();
    t.is(fcobs.length, range.getNumRows());
    t.is(fcobs[0].length, range.getNumColumns());
    t.deepEqual(
      fcobs.flat().map((f) => f.asRgbColor().asHexString()),
      fontColors.flat()
    );
    t.is(fcob.asRgbColor().asHexString(), fontColors[0][0]);

    range.setFontColor(getRandomHex());

    // now with rangelists
    const range2 = range.offset(3, 3, 2, 2);
    const rangeList = range
      .getSheet()
      .getRangeList([range, range2].map((r) => r.getA1Notation()));
    rangeList.setBackground(color);
    rangeList.getRanges().forEach((range) =>
      t.true(
        range
          .getBackgrounds()
          .flat()
          .every((f) => f === color)
      )
    );
    rangeList.getRanges().forEach((range) => {
      range.setBackgroundRGB(...color255);
      t.is(range.getBackground(), rgbToHex(colorRgb));
    });

    // now alignments
    const verticalAlignments = range.getVerticalAlignments();
    const verticalAlignment = range.getVerticalAlignment();
    t.is(verticalAlignments.length, range.getNumRows());
    t.is(verticalAlignments[0].length, range.getNumColumns());
    t.true(verticalAlignments.flat().every((f) => is.nonEmptyString(f)));
    t.is(verticalAlignments[0][0], verticalAlignment);
    // sometimes this is upper sometimes lower - havent figured out rule yet
    t.is(
      verticalAlignment.toUpperCase(),
      "BOTTOM",
      "newly created sheet will have bottom"
    );

    const horizontalAlignments = range.getHorizontalAlignments();
    const horizontalAlignment = range.getHorizontalAlignment();
    t.is(horizontalAlignments.length, range.getNumRows());
    t.is(horizontalAlignments[0].length, range.getNumColumns());
    t.true(horizontalAlignments.flat().every((f) => is.nonEmptyString(f)));
    t.is(horizontalAlignments[0][0], horizontalAlignment);
    t.is(
      horizontalAlignment,
      "general",
      "newly created sheet will have general"
    );

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section(
    "TODO - currently skipped - range.getBorder() does work on GAS although it's not documented",
    (t) => {
      // TODO figure out how to handle thick/medium etc.

      const rt = sb.getRange("a26:b28");

      // the top of of the first row should be null
      // the bottom of the last row should be null
      // the left of the first column should be null
      // the right of last column should be null
      const topRow = rt.offset(0, 0, 1).getBorder();
      const bottomRow = rt.offset(rt.getNumRows() - 1, 1).getBorder();
      const leftCol = rt.offset(0, 0, rt.getNumRows(), 1).getBorder();
      const rightCol = rt
        .offset(0, rt.getNumColumns() - 1, rt.getNumRows(), 1)
        .getBorder();

      t.is(topRow.getTop().getColor().getColorType().toString(), "UNSUPPORTED");
      t.is(
        bottomRow.getBottom().getColor().getColorType().toString(),
        "UNSUPPORTED"
      );
      t.is(
        leftCol.getLeft().getColor().getColorType().toString(),
        "UNSUPPORTED"
      );
      t.is(
        rightCol.getRight().getColor().getColorType().toString(),
        "UNSUPPORTED"
      );
      t.is(topRow.getTop().getBorderStyle(), null);
      t.is(bottomRow.getBottom().getBorderStyle(), null);
      t.is(leftCol.getLeft().getBorderStyle(), null);
      t.is(rightCol.getRight().getBorderStyle(), null);

      if (SpreadsheetApp.isFake)
        console.log(
          "...cumulative sheets cache performance",
          getSheetsPerformance()
        );
    },
    { skip: true }
  );

  unit.section("text Style objects and builders", (t) => {
    const builder = SpreadsheetApp.newTextStyle();
    t.is(builder.toString(), "TextStyleBuilder");
    const fontFamily = "Helvetica";
    builder
      .setFontSize(10)
      .setBold(true)
      .setItalic(true)
      .setUnderline(false)
      .setStrikethrough(false)
      .setFontFamily(fontFamily);
    const textStyle = builder.build();
    t.is(textStyle.toString(), "TextStyle");
    t.is(textStyle.getFontSize(), 10);
    t.is(textStyle.getFontFamily(), fontFamily);
    t.is(textStyle.isBold(), true);
    t.is(textStyle.isItalic(), true);
    t.is(textStyle.isUnderline(), false);
    t.is(textStyle.isStrikethrough(), false);

    t.is(textStyle.getForegroundColor(), null);
    t.is(textStyle.getForegroundColorObject(), null);

    const rgbColor = getRandomHex();
    const rgbBuilder = SpreadsheetApp.newTextStyle();
    rgbBuilder.setForegroundColor(rgbColor);
    const rgbStyle = rgbBuilder.build();
    t.is(rgbStyle.getForegroundColor(), rgbColor);
    t.is(
      rgbStyle.getForegroundColorObject().asRgbColor().asHexString(),
      rgbColor
    );

    const tc = "ACCENT4";
    const tcb = SpreadsheetApp.newColor();
    tcb.setThemeColor(SpreadsheetApp.ThemeColorType[tc]).build();
    const themeBuilder = SpreadsheetApp.newTextStyle()
      .setForegroundColorObject(tcb)
      .build();
    // strangely enough, if it's a theme color it returns the enum for the colortype
    t.is(themeBuilder.getForegroundColor(), tc);
    t.is(
      themeBuilder
        .getForegroundColorObject()
        .asThemeColor()
        .getThemeColorType()
        .toString(),
      tc
    );

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("color objects and builders", (t) => {
    const builder = SpreadsheetApp.newColor();
    t.is(builder.toString(), "ColorBuilder");
    t.is(
      t.threw(() => builder.asThemeColor()).message,
      "Object is not of type ThemeColor."
    );
    t.is(
      t.threw(() => builder.asRgbColor()).message,
      "Object is not of type RgbColor."
    );
    t.is(builder.getColorType().toString(), "UNSUPPORTED");
    const rgbColor = getRandomHex();

    builder.setRgbColor(rgbColor);
    t.is(
      t.threw(() => builder.asThemeColor()).message,
      "Object is not of type ThemeColor."
    );
    t.is(builder.getColorType().toString(), "RGB");
    t.is(builder.asRgbColor().toString(), "RgbColor");
    t.is(builder.asRgbColor().asHexString(), rgbColor);
    t.is(builder.asRgbColor().getRed(), parseInt(rgbColor.substring(1, 3), 16));

    const builtRgb = builder.build();
    t.is(builtRgb.toString(), "Color");
    t.is(builtRgb.getColorType().toString(), "RGB");
    t.is(builtRgb.asRgbColor().toString(), "RgbColor");
    t.is(
      builtRgb.asRgbColor().getGreen(),
      parseInt(rgbColor.substring(3, 5), 16)
    );
    t.is(
      builtRgb.asRgbColor().getBlue(),
      parseInt(rgbColor.substring(5, 7), 16)
    );
    t.is(
      builtRgb.asRgbColor().getRed(),
      parseInt(rgbColor.substring(1, 3), 16)
    );
    t.is(
      t.threw(() => builtRgb.asThemeColor()).message,
      "Object is not of type ThemeColor."
    );

    const themeBuilder = SpreadsheetApp.newColor();
    themeBuilder.setThemeColor(SpreadsheetApp.ThemeColorType.ACCENT1);
    t.is(themeBuilder.getColorType().toString(), "THEME");
    t.is(themeBuilder.asThemeColor().getColorType().toString(), "THEME");
    t.is(themeBuilder.asThemeColor().getThemeColorType().toString(), "ACCENT1");
    t.is(
      t.threw(() => themeBuilder.asRgbColor()).message,
      "Object is not of type RgbColor."
    );

    const builtTheme = themeBuilder.build();
    t.is(builtTheme.toString(), "Color");
    t.is(builtTheme.getColorType().toString(), "THEME");
    t.is(builtTheme.asThemeColor().getColorType().toString(), "THEME");
    t.is(
      t.threw(() => builtTheme.asRgbColor()).message,
      "Object is not of type RgbColor."
    );

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("setting and getting color objects}", (t) => {
    const { sheet } = maketss("colors", toTrash, fixes);
    const range = sheet.getRange("c6:i12");

    // so we can see the colors better if necessary add some random values
    const stuff = getStuff(range);
    range.setValues(stuff);
    t.deepEqual(range.getValues(), stuff);

    const cts = [
      "TEXT",
      "BACKGROUND",
      "ACCENT1",
      "ACCENT2",
      "ACCENT3",
      "ACCENT4",
      "ACCENT5",
      "ACCENT6",
      "LINK",
    ];

    const colorObjects = Array.from(
      {
        length: range.getNumRows(),
      },
      (_) =>
        Array.from(
          {
            length: range.getNumColumns(),
          },
          (_, i) =>
            SpreadsheetApp.newColor()
              .setThemeColor(SpreadsheetApp.ThemeColorType[cts[i % cts.length]])
              .build()
        )
    );

    t.true(
      colorObjects
        .flat()
        .every((f) => f.asThemeColor().getColorType().toString() === "THEME")
    );
    t.true(
      colorObjects.flat().every((f) => f.getColorType().toString() === "THEME")
    );

    range.setBackgroundObjects(colorObjects);
    const tobs = range.getBackgroundObjects();
    t.true(tobs.flat().every((f) => f.getColorType().toString() === "THEME"));
    t.deepEqual(
      tobs.flat().map((f) => f.asThemeColor().getThemeColorType().toString()),
      colorObjects
        .flat()
        .map((f) => f.asThemeColor().getThemeColorType().toString())
    );

    // color objects can be rgb too
    const rgbObjects = Array.from(
      {
        length: range.getNumRows(),
      },
      (_) =>
        Array.from(
          {
            length: range.getNumColumns(),
          },
          (_, i) =>
            SpreadsheetApp.newColor().setRgbColor(getRandomHex()).build()
        )
    );

    const rgbRange = range.offset(range.getNumRows() + 1, 0);
    rgbRange.setBackgroundObjects(rgbObjects);
    const robs = rgbRange.getBackgroundObjects();
    t.true(robs.flat().every((f) => f.getColorType().toString() === "RGB"));
    t.deepEqual(
      robs.flat().map((f) => f.asRgbColor().asHexString()),
      rgbObjects.flat().map((f) => f.asRgbColor().asHexString())
    );

    // and they can be mixed
    const mixedRange = rgbRange.offset(rgbRange.getNumRows() + 1, 0);
    const half = Math.floor(mixedRange.getNumRows() / 2);
    const mixed = colorObjects
      .slice(0, half)
      .concat(rgbObjects.slice(0, mixedRange.getNumRows() - half));
    mixedRange.setBackgroundObjects(mixed);
    const mobs = mixedRange.getBackgroundObjects();
    t.deepEqual(
      mobs.flat().map((f) => f.getColorType().toString()),
      mixed.flat().map((f) => f.getColorType().toString())
    );

    const singleColor = getRandomHex();
    const singleColorObj = SpreadsheetApp.newColor()
      .setRgbColor(singleColor)
      .build();
    const singleRange = mixedRange.offset(mixedRange.getNumRows() + 1, 0);
    singleRange.setBackgroundObject(singleColorObj);
    const back1 = singleRange.getBackgrounds();
    t.true(back1.flat().every((f) => f === singleColor));
    const sobs = singleRange.getBackgroundObjects();
    t.true(
      sobs.flat().every((f) => f.asRgbColor().asHexString() === singleColor)
    );

    const singleRgbRange = singleRange.offset(singleRange.getNumRows() + 1, 0);
    const singleColorRgbObj = SpreadsheetApp.newColor()
      .setRgbColor(singleColor)
      .build();
    singleRgbRange.setBackgroundObject(singleColorRgbObj);
    const back2 = singleRgbRange.getBackgrounds();
    t.true(back2.flat().every((f) => f === singleColor));
    const srobs = singleRange.getBackgroundObjects();
    t.true(
      srobs.flat().every((f) => f.asRgbColor().asHexString() === singleColor)
    );
    t.deepEqual(back1, back2);

    const clearRange = sheet.getRange("a1:z100");
    clearRange.clear();
    t.true(
      clearRange
        .getValues()
        .flat()
        .every((f) => f === "")
    );

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  unit.section("setName", (t) => {
    const { sheet, ss: spreadsheet } = maketss("sample", toTrash, fixes);
    const spreadsheetId = spreadsheet.getId();

    sheet.setName("sample");
    const sheetName = sheet.getName();
    t.is(sheetName, "sample");

    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
  });

  // running standalone
  if (!pack) {
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

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute"
// for example node testdrive.js execute
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) {
  testSheets();
  ScriptApp.__behavior.trash()
}
