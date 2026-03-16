import '@mcpher/gas-fakes'


// create a spreadseheet 
const createSpreadsheet = ( {platform = "google", title}) => {
  ScriptApp.__platform = platform
  const ss =  SpreadsheetApp.create(title)
  console.log ('created spreadsheet' + ss.getName() + ' on ' + platform)
  return ss
}

const setPlatform = (name) => ScriptApp.__platform = name

const copySheetBetweenPlatforms = ( {source, target}) => {

  // get a fiddler for the source
  setPlatform(source.platform)
  const fiddler =  bmPreFiddler.PreFiddler().getFiddler(source)

  // create the output spreadsheet, and get a fiddler
  setPlatform(target.platform)
  const dst = createSpreadsheet(target)
  const dstFiddler = bmPreFiddler.PreFiddler().getFiddler({id: dst.getId(), sheetName: source.sheetName , createIfMissing: true})
  // copy the data and dump to target
  dstFiddler.setData(fiddler.getData()).dumpValues()

  // now we check that both match
  const after = bmPreFiddler.PreFiddler().getFiddler ({id: dstFiddler.getSheet().getParent().getId(), sheetName: dstFiddler.getSheet().getName()})
  if (after.fingerPrint === fiddler.fingerPrint) {
    console.log ('Bingo')
  } else {
    console.log ('data doesnt match')
  }

}

// load any libraries
LibHandlerApp.load()

// enable sandbox mode
ScriptApp.__behavior.sandBoxMode = true;

// create some spreadsheets with data and copy between them
const source = {
  id: "1h9IGIShgVBVUrUjjawk5MaCEQte_7t32XeEP1Z5jXKQ",
  platform: "google",
  sheetName: 'airport list'
}

// add that to sanbox for read without marking it for trashing
ScriptApp.__behavior.whitelistFile(source.id)

copySheetBetweenPlatforms({ source, target: {platform: 'msgraph', title: 'test-msgraph-libraries'}})

// cleanup any files created
ScriptApp.__behavior.trash()