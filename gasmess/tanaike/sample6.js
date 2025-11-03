import "../../main.js";

// ScriptApp.__behavior.sandBoxMode = true;
const spreadsheet = SpreadsheetApp.openById("###");
const sheets = spreadsheet.getSheets().map((s) => {
  const sheetName = s.getSheetName();
  const temp = { sheetName };
  const images = s.getImages();
  if (images.length > 0) {
    temp.images = images.map((e) => ({
      anchourCell: e.getAnchorCell().getA1Notation(),
      anchorCellXOffset: e.getAnchorCellXOffset(),
      achorCellYOffset: e.getAnchorCellYOffset(),
      width: e.getWidth(),
      height: e.getHeight(),
    }));
  }
  return temp;
});
console.log(JSON.stringify(sheets, null, 2));
// ScriptApp.__behavior.trash();
