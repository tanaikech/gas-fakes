const sheet = SpreadsheetApp.openById('1h9IGIShgVBVUrUjjawk5MaCEQte_7t32XeEP1Z5jXKQ').getSheets()[0]
const fiddler = new bmFiddler.Fiddler(sheet)
console.log (fiddler.getData().slice(0, 5))
