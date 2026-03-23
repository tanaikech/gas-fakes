import '@mcpher/gas-fakes'



// load any libraries
LibHandlerApp.load()

const setPlatform = (name) => ScriptApp.__platform = name

// enable sandbox mode
ScriptApp.__behavior.sandBoxMode = true;

// create some spreadsheets with data and copy between them
console.log(DriveApp.getRootFolder().getName());

const source = {
  id: "1h9IGIShgVBVUrUjjawk5MaCEQte_7t32XeEP1Z5jXKQ",
  platform: "google",
  sheetName: 'airport list'
}

// add that to sanbox for read without marking it for trashing
ScriptApp.__behavior.whitelistFile(source.id)

setPlatform(source.platform)
const fiddler = bmPreFiddler.PreFiddler().getFiddler(source)

// cleanup any files created
ScriptApp.__behavior.trash()
