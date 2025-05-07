let __mss = null

export const trasher = (toTrash) => {
  // clean up if necessary
  toTrash.forEach(f => {
    console.log('trashing temp file', f.getId())
    f.setTrashed(true)
  })
}
// to minimize the number of test sheets created we'll share this with all sheet tests
export const maketss = (sheetName, toTrash, fixes, { clearContents = true, clearFormats = true } = {}) => {

  if (!__mss) {
    const aname = fixes.PREFIX + "tss-sheet"
    __mss = SpreadsheetApp.create(aname)
    console.log ('...created ss', __mss.getName(),__mss.getId())
  }

  if (fixes.CLEAN && !toTrash.find (f=>f.getId()==__mss.getId())) {
    console.log ('...will be deleting it later')
    toTrash.push(DriveApp.getFileById(__mss.getId()))
  }

  let sheet = null
  if (sheetName) {
    sheet = __mss.getSheetByName(sheetName)
  }

  if (!sheet) {
    sheet = __mss.insertSheet(sheetName)
    console.log('...created sheet', sheet.getName(), sheet.getSheetId())
  } else {
    if (clearContents || clearFormats) {
      sheet.clear({ contentsOnly: !clearFormats, formatsOnly: !clearContents })
    }
  }

  return {
    ss: __mss,
    sheet,
    sheets: __mss.getSheets()

  }
}

export const toHex = (c) => {
  if (!c) return '00';
  const val = Math.round(c * 255);
  const hex = val.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

export const rgbToHex = ({ red: r, green: g, blue: b }) => {

  const red = toHex(r);
  const green = toHex(g);
  const blue = toHex(b);
  return `#${red}${green}${blue}`;
}
export const getRandomRgb = () => ({ red: Math.random(), green: Math.random(), blue: Math.random() })
export const getRandomHex = () => rgbToHex(getRandomRgb())
export const getStuff = (range) => Array.from({ length: range.getNumRows() }, _ => Array.from({ length: range.getNumColumns() }, () => Utilities.getUuid()))

export const BLACK = '#000000'
export const RED = '#ff0000'