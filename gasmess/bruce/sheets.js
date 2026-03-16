import '@mcpher/gas-fakes'
import is from '@sindresorhus/is';

export const checkBackend = (name)=> {
    if (!ScriptApp.isFake) {
    console.log('...skipping ' + name + ' tests as not in fake mode')
    return false
  }
  if (!is.array(ScriptApp.__platforms)) {
    throw 'ScriptApp.__platforms- should be a list of supported platforms'
  }

  if (!ScriptApp.__isPlatformAuthed(name)) {
    console.log('...skipping ' + name + ' tests as not authenticated')
    return false
  } 
  return true
}


const setPlatform = (name) => {
  // first check we are faking it
  if (!checkBackend(name)) {
    throw `platform ${name} not authenticated`
  }
  ScriptApp.__platform = name;
}

// create a spreadseheet 
const createSpreadsheet = ( {platform, title}) => {
  setPlatform (platform)
  const ss =  SpreadsheetApp.create(title)
  console.log ('created spreadsheet' + ss.getName() + ' on ' + platform)
  return ss
}

const copyBetweenPlatforms = () => {
  const src = createSpreadsheet({platform: 'google', title: 'test-google'})
  const dst = createSpreadsheet({platform: 'msgraph', title: 'test-msgraph'})

  const data = [['a', 'b', 'c'], ['d', 'e', 'f']]
  setPlatform('google') 
  src.getSheetByName('Sheet1').getRange(1,1,data.length,data[0].length).setValues(data)
  setPlatform('msgraph') 
  dst.getSheetByName('Sheet1').getRange(1,1,data.length,data[0].length).setValues(data)

  setPlatform('google') 
  const srcData = src.getSheetByName('Sheet1').getRange(1,1,data.length,data[0].length).getValues()
  setPlatform('msgraph') 
  const dstData = dst.getSheetByName('Sheet1').getRange(1,1,data.length,data[0].length).getValues()

  if (JSON.stringify(srcData) !== JSON.stringify(dstData)) {
    console.log('data mismatch')
    console.log('src', srcData)
    console.log('dst', dstData)
  }
}
// enable sandbox mode
ScriptApp.__behavior.sandBoxMode = true;

// create some spreadsheets with data and copy between them
copyBetweenPlatforms()

// cleanup any files created
ScriptApp.__behavior.trash()