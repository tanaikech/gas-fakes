import '@mcpher/gas-fakes';



const mockManifest = {
  dependencies: {
    libraries: [
      {
        libraryId: '13JUFGY18RHfjjuKmIRRfvmGlCYrEkEtN6uUm-iLUcxOUFRJD-WBX-tkR',
        userSymbol: 'bmPreFiddler',
      },
    ],
  },
}


// if we are running on node, we can optionally include apps script libraries
// by default these are those mentioned in the local apps script
if (ScriptApp.isFake) {
  LibHandlerApp.load(mockManifest)
}

// here' some code that uses the libraries mentioned in the manifest
// in this case we're using the fiddler library to read a sheet and concert to json objects
const sheet = SpreadsheetApp.openById('1h9IGIShgVBVUrUjjawk5MaCEQte_7t32XeEP1Z5jXKQ').getSheets()[0];
console.log (sheet.getName())
const fiddler = new bmFiddler.Fiddler(sheet);
// log the first few rows
console.log(fiddler.getData().slice(0, 5));



// here's using a library which calls another library
console.log(
  bmPreFiddler.PreFiddler()
    .getFiddler({ sheetName: 'airport list', id: '1h9IGIShgVBVUrUjjawk5MaCEQte_7t32XeEP1Z5jXKQ' })
    .getData()
    .slice(0, 5)
);

