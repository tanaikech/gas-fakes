import './src/index.js';

const sheetId = '1DlKpVVYCrCPNfRbGsz6N_K3oPTgdC9gQIKi0aNb42uI';
const ssViewers = SpreadsheetApp.openById(sheetId).getViewers().map(v => v.getEmail());
const fileViewers = DriveApp.getFileById(sheetId).getViewers().map(v => v.getEmail());

console.log(`Spreadsheet viewers for ${sheetId}:`, ssViewers);
console.log(`DriveApp file viewers for ${sheetId}:`, fileViewers);
