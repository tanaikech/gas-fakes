
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { getSheetsPerformance } from '../src/support/sheetscache.js';
import { Fiddler } from '../gaslibtests/bmfiddler/Code.js'


// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testFiddler = (pack) => {
  const { unit, fixes } = pack || initTests()

  let copyFiddler = null
  let copyAirports = null
  let airports = null
  let fiddler = null
  const toTrash = []

  const getCopy = () => {
    if (!copyAirports) {
      airports = SpreadsheetApp.openById(fixes.TEST_AIRPORTS)
      copyAirports = SpreadsheetApp.create(fixes.PREFIX + airports.getName())
      const copySheet = copyAirports.insertSheet(fixes.TEST_AIRPORTS_NAME)
      const sheet = airports.getSheetByName(fixes.TEST_AIRPORTS_NAME)
      fiddler = new Fiddler(sheet)
      copyFiddler = new Fiddler(copySheet).setValues(fiddler.getValues()).dumpValues()

      if (fixes.CLEAN) {
        toTrash.push(DriveApp.getFileById(copyAirports.getId()))
      }
    }
  }


  unit.section ("fiddler coloring", t=> {
    getCopy ()
    const coloringFiddler = new Fiddler(copyFiddler.getSheet().getParent().insertSheet("coloring sheet")).setValues(fiddler.getValues())
    const baseColor = 0xffffff
    const countries = coloringFiddler.getUniqueValues("iso_country")
    const colorMap = new Map (countries.map ((f,i)=>[f,baseColor-(32*i)]))
    const backgrounds = coloringFiddler.getValues().map(row=>colorMap.get(row))
    coloringFiddler.setColumnFormat({backgrounds}).dumpValues()

  })

  unit.section("testfiddler fingerprinting", t => {
    getCopy()
    t.deepEqual(fiddler.getValues(), copyFiddler.getValues(), 'copy was successful')

    const playFiddler = new Fiddler().setData([{a:1}]);
    t.false (playFiddler.isDirty(), 'fingerprint tests')
    t.is (playFiddler.getFingerprint(), playFiddler.getInitialFingerprint())

    const playFiddler2 = new Fiddler().setValues (copyFiddler.getValues())
    t.false (playFiddler2.isDirty(), 'clean fingerprint tests')
    t.is (playFiddler2.getFingerprint(), playFiddler2.getInitialFingerprint())
    t.is (playFiddler2.getFingerprint(), copyFiddler.getFingerprint())

    playFiddler2.setHasHeaders(false)
    t.true(playFiddler2.isDirty(), 'dirty with headers removed')

    playFiddler2.setHasHeaders(true)
    t.false(playFiddler2.isDirty(), 'clean with headers added')

  })



  if (!pack) {
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
    unit.report()
  }
  return { unit, fixes }
}

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute" 
// for example node testdrive.js execute
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testFiddler()
