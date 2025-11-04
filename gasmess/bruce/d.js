// initialize gas-fake environment
import '../../main.js'


// start coding in Apps Script!

// find all the files on Drive, owned by me and with untitled in the name
const files = DriveApp.searchFiles('title contains "untitled" and "me" in owners');

// show their name and folder
while (files.hasNext()) {
    const file = files.next();
    const folder = file.getParents().next();
    console.log (`${file.getName()} is in ${folder.getName()}`)
}
