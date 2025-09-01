import "../../main.js";
import { newFakeUser } from "../../src/services/common/fakeuser.js";

// ScriptApp.__behavior.sandBoxMode = true;
// const spreadsheet = SpreadsheetApp.create("sample1");
// const sheet = spreadsheet.getSheets()[0];
// sheet.setName("sample");
// ScriptApp.__behavior.trash();

const spreadsheet = SpreadsheetApp.openById(
  "1xkf6x6z_n9dpogsjIb0QfbYmASo4H97xBS-OtEIw2Kw"
);
const sheet = spreadsheet.getSheets()[0];
// const r1 = sheet
//   .protect()
//   .addEditors(["science00001@gmail.com", "hinera8394@gmail.com"])
//   .setDescription("sample description");
// console.log(r1.getEditors());
const r1 = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE)[0];
console.log(r1.getEditors());
r1.removeEditors(["science00001@gmail.com"]);
console.log(r1.getEditors());

// const r = newFakeUser({ email: "science00001@gmail.com" });
// console.log(r);
// console.log(r.toString());

// const r = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
// console.log(r[0]);
// r.forEach((e) => console.log(e));

// console.log(r[1].remove());
