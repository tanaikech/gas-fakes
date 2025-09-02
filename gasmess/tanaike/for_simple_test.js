import "../../main.js";

ScriptApp.__behavior.sandBoxMode = true;
const spreadsheet = SpreadsheetApp.create("sample1");
const sheet = spreadsheet.getSheets()[0];
sheet.setName("sample");
ScriptApp.__behavior.trash();
