function createSpreadsheet() {
  const spreadsheet = SpreadsheetApp.create("New Spreadsheet from Apps Script");
  Logger.log("Spreadsheet created: " + spreadsheet.getUrl());
}