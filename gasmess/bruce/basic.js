import '../../main.js';

// put all this stuff in a temp folder for easy deletion
const folderName = "---gasmess-bruce"
const folders = DriveApp.getFoldersByName (folderName)
let folder = null
if (folders.hasNext()) {
  folder = folders.next()
  console.log ('using existing temp folder', folder.getName(), folder.getId())
} else {
  folder = DriveApp.createFolder (folderName)
  console.log ('created temp folder', folder.getName(), folder.getId())
}

const ss = SpreadsheetApp.create("--gasmess-sheet")
const file = DriveApp.getFileById(ss.getId())
file.moveTo(folder)

const sheet = ss.insertSheet()
const values = [[1,2,3],[4,5,6],[7,8,9]]
const range = sheet.getRange(1,1,3,3)
range.setValues(values)

const result = range.getValues()
console.log (JSON.stringify(result) === JSON.stringify(values) ? 'success' : 'true')

file.setTrashed(true)