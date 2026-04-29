import './src/index.js';

const sheetId = '1DlKpVVYCrCPNfRbGsz6N_K3oPTgdC9gQIKi0aNb42uI';
const viewers = SpreadsheetApp.openById(sheetId).getViewers();
console.log(`Viewers for ${sheetId}:`, viewers.map(v => v.getEmail()));
