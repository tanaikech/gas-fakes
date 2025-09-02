import "../../main.js";

ScriptApp.__behavior.sandBoxMode = true;
sample();
ScriptApp.__behavior.trash();

function sample() {
  const spreadsheet = SpreadsheetApp.create("sample");
  const sheet = spreadsheet.getSheets()[0];

  // Create protected sheet.
  // For Class Sheet
  const unprotectedRanges = [sheet.getRange("A1:B1")];
  const p1 = sheet
    .protect()
    .setDescription("sample1")
    .setWarningOnly(true)
    .setUnprotectedRanges(unprotectedRanges);
  console.log(p1.getDescription()); // "sample1"
  console.log(p1.getUnprotectedRanges()[0].getA1Notation()); // "A1:B1"
  console.log(p1.canEdit()); // true
  console.log(p1.getEditors().length); // 1
  console.log(p1.getProtectionType().toString()); // SHEET
  console.log(p1.isWarningOnly()); // true

  // For Class Spreadsheet
  const protections = spreadsheet.getProtections(
    SpreadsheetApp.ProtectionType.SHEET
  );
  console.log(protections.some((p) => p.getDescription() == "sample1")); // true

  p1.remove();

  // Create protected range with a range.
  // For Class Range
  const p2 = sheet.getRange("A1:D5").protect().setDescription("sample2");
  p2.setRange(sheet.getRange("B2:E6"));
  console.log(p2.getRange().getA1Notation()); // "B2:E6"
  console.log(p2.getProtectionType().toString()); // RANGE
  p2.remove();

  // Create named range.
  const rangeName = "sampleNamedRange1";
  const range1 = sheet.getRange("C3:F7");
  spreadsheet.setNamedRange(rangeName, range1);
  const namedRange = spreadsheet
    .getNamedRanges()
    .find((e) => e.getName() == rangeName);

  // Create protected range with named range 1.
  const p3 = sheet.getRange("A1:D5").protect().setDescription("sample2");
  p3.setRangeName(rangeName);
  console.log(p3.getRangeName()); // sampleNamedRange1
  p3.remove();

  // Create protected range with named range 2.
  const p4 = sheet.getRange("A1:D5").protect().setDescription("sample2");
  p4.setNamedRange(namedRange);
  console.log(p4.getRangeName()); // sampleNamedRange1
  p4.remove();

  namedRange.remove();
}
