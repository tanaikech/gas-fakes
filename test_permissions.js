import './src/index.js';

const sharedId = '1uz4cxEDxtQzu0cBb1B4h6fsjgWy7hNFf';
const sheetId = '1DlKpVVYCrCPNfRbGsz6N_K3oPTgdC9gQIKi0aNb42uI';

console.log("SHARED_FILE_ID viewers:", DriveApp.getFileById(sharedId).getViewers().map(u => u.getEmail()));
console.log("SHARED_FILE_ID editors:", DriveApp.getFileById(sharedId).getEditors().map(u => u.getEmail()));

console.log("TEST_SHEET_ID viewers:", DriveApp.getFileById(sheetId).getViewers().map(u => u.getEmail()));
console.log("TEST_SHEET_ID editors:", DriveApp.getFileById(sheetId).getEditors().map(u => u.getEmail()));
