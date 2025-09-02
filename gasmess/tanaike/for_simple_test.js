import "../../main.js";
import { newFakeUser } from "../../src/services/common/fakeuser.js";

// ScriptApp.__behavior.sandBoxMode = true;
// const spreadsheet = SpreadsheetApp.create("sample1");
// const sheet = spreadsheet.getSheets()[0];
// sheet.setName("sample");
// ScriptApp.__behavior.trash();

// test1();
sample1();

function test1() {
  const spreadsheet = SpreadsheetApp.openById(
    "1xkf6x6z_n9dpogsjIb0QfbYmASo4H97xBS-OtEIw2Kw"
  );
  const sheet = spreadsheet.getSheets()[0];

  const unprotectedRanges = [sheet.getRange("A1:B1")];
  const p1 = sheet
    .protect()
    .setDescription("sample1")
    .setWarningOnly(true)
    .setUnprotectedRanges(unprotectedRanges);

  console.log(p1.object);
}

function sample1() {
  const spreadsheet = SpreadsheetApp.openById(
    "1xkf6x6z_n9dpogsjIb0QfbYmASo4H97xBS-OtEIw2Kw"
  );
  // const spreadsheet = SpreadsheetApp.create("sample");
  const sheet = spreadsheet.getSheets()[0];

  // Create protected sheet.
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
  p1.remove();

  // Create protected range with a range.
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

  // DriveApp.getFileById(spreadsheet.getId());
}

// const spreadsheet = SpreadsheetApp.openById(
//   "1xkf6x6z_n9dpogsjIb0QfbYmASo4H97xBS-OtEIw2Kw"
// );
// const sheet = spreadsheet.getSheets()[0];
// const r1 = sheet
//   .getRange("A1:C5")
//   .protect()
//   .addEditors(["science00001@gmail.com", "hinera8394@gmail.com"])
//   .setDescription("sample description 2");

// const range = sheet.getRange("D2:F6");
// r1.setRange(range);

// const namedRange = spreadsheet
//   .getNamedRanges()
//   .find((e) => e.getName() == "sampleNamedRange1");
// r1.setNamedRange(namedRange);

// r1.setRangeName("sampleNamedRange1");
// const rr = r1.getRangeName();
// console.log(rr);

// const r1 = sheet
//   .protect()
//   .addEditors(["science00001@gmail.com", "hinera8394@gmail.com"])
//   .setDescription("sample description");
// const ranges = [sheet.getRange("A1:B1"), sheet.getRange("A3:B3")];
// r1.setUnprotectedRanges(ranges);

// const rr = r1.getUnprotectedRanges();
// console.log(rr.map((r) => r.getA1Notation()));

// console.log(r1.getEditors());
// const r1 = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE)[0];
// console.log(r1.getEditors());
// r1.removeEditors(["science00001@gmail.com"]);
// console.log(r1.getEditors());

// const r = newFakeUser({ email: "science00001@gmail.com" });
// console.log(r);
// console.log(r.toString());

// const r = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
// console.log(r[0]);
// r.forEach((e) => console.log(e));

// console.log(r[1].remove());
