function getSheetData() {
  var sheet = SpreadsheetApp.openById('15MDlPLVH4IhnY2KJBWYGANoyyoUFaxeWVDOe-pupKxs').getSheets()[0];
  var data = sheet.getRange(1, 1, 5, sheet.getLastColumn()).getValues();
  console.log(JSON.stringify(data, null, 2));
}
getSheetData();