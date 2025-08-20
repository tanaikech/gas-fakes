import '../../main.js';
import { moveToTempFolder, deleteTempFile } from './tempfolder.js';

// put all this stuff in a temp folder for easy deletion
const ss = SpreadsheetApp.create("--gasmess-sheet")
moveToTempFolder(ss.getId())

const sheet = ss.insertSheet()
const values = [[1,2,3,'=A1+B1'],[4,5,6,'=sum(A2:c2)'],[7,8,9, '=d1+d2']]
const range = sheet.getRange(1,1,values.length,values[0].length)
range.setValues(values)

const result = range.getDisplayValues()

console.log (result)

/* result is correct
 * [
  [ '1', '2', '3', '3' ],
  [ '4', '5', '6', '15' ],
  [ '7', '8', '9', '18' ]
]
 */
deleteTempFile(ss.getId())
