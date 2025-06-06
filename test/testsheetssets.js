
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { getSheetsPerformance } from '../src/support/sheetscache.js';
import { getPerformance } from '../src/support/filecache.js';
import { maketss, trasher } from './testassist.js';

import is from '@sindresorhus/is';

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsSets = (pack) => {

  const { unit, fixes } = pack || initTests()
  const toTrash = []


  unit.section("clearing ranges", t => {
    const { sheet: sv } = maketss('clearing', toTrash, fixes)

    // make a couple of fake validations
    const builder = SpreadsheetApp.newDataValidation()
    const values = [[1, 2], true]
    const dv = builder.requireValueInList(...values).build()
    const cr = sv.getRange("!c2:e5")
    cr.setDataValidation(dv)
    const cbs = cr.getDataValidations()
    t.is(cbs.length, cr.getNumRows())
    t.is(cbs[0].length, cr.getNumColumns())

    cr.clearDataValidations()
    const cbs2 = cr.getDataValidations()
    t.is(cbs2, null)
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
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

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testSheetsSets()
