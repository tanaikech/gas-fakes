
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { trasher } from './testassist.js';
// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testDocsAdv = (pack) => {

  const { unit, fixes } = pack || initTests()
  const toTrash = []

  unit.section ("basic adv docs props", t=>{
    t.is (Docs.toString(), "AdvancedServiceIdentifier{name=docs, version=v1}")
    t.is (Docs.getVersion(), "v1")

  })

  // running standalone
  if (!pack) {
    /// if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
    unit.report()

  }

  trasher(toTrash)
  return { unit, fixes }
}

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute" 

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute" 
// for example node testdrive.js execute
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testDocsAdv()
