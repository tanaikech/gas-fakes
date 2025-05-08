
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { getSheetsPerformance } from '../src/support/sheetscache.js';
import { getPerformance } from '../src/support/filecache.js';
import { maketss, trasher, toHex, rgbToHex, getRandomRgb, getRandomHex, getStuff, BLACK, RED } from './testassist.js';


// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsPermissions = (pack) => {

  const { unit, fixes } = pack || initTests()
  const toTrash = []

  unit.section ("protected cells", t=> {
    const sp = SpreadsheetApp.openById(fixes.TEST_BORDERS_ID)
    const sb = sp.getSheetByName("permissions")

    t.is (SpreadsheetApp.ProtectionType.SHEET.toString(),'SHEET')
    t.is (SpreadsheetApp.ProtectionType.RANGE.toString(),'RANGE')

    console.log (JSON.stringify(sp.getProtections(SpreadsheetApp.ProtectionType.RANGE)))

  })


  unit.section("permissions for ranges", t => {
    const sp = SpreadsheetApp.openById(fixes.TEST_BORDERS_ID)
    const sb = sp.getSheets()[0]
    const flr = sb.getRange("c2:e3")

    t.true (flr.canEdit())
  })

  // running standalone
  if (!pack) {
    if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
    unit.report()

  }

  trasher(toTrash)
  return { unit, fixes }
}

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute" 
// for example node testdrive.js execute
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testSheetsPermissions()
