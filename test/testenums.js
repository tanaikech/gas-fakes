
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { getSheetsPerformance } from '../src/support/sheetscache.js';
import {  trasher  } from './testassist.js';


// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testEnums = (pack) => {

  const { unit, fixes } = pack || initTests()
  const toTrash = []

  unit.section("check enums", t => {
   
    t.is (SpreadsheetApp.ThemeColorType.toString(), "UNSUPPORTED")
    t.is (SpreadsheetApp.ColorType.toString(), "UNSUPPORTED")
    t.is (SpreadsheetApp.ColorType.RGB.toString(), "RGB")
    t.is (SpreadsheetApp.ColorType.RGB.ordinal(), 1)
    t.is (SpreadsheetApp.ColorType.THEME.name(), "THEME")
    t.is (SpreadsheetApp.ThemeColorType.ACCENT1.compareTo(SpreadsheetApp.ThemeColorType.ACCENT3), -2)

  })


  

  // running standalone
  if (!pack) {
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

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testEnums()
