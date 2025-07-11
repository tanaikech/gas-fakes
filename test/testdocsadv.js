
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

  unit.section("basic adv docs props", t => {
    t.is(Docs.toString(), "AdvancedServiceIdentifier{name=docs, version=v1}")
    t.is(Docs.getVersion(), "v1")


    Reflect.ownKeys(Docs)
      .filter(f => is.string(f) && f.match(/^new/))
      .forEach(f => {
        t.true(is.function(Docs[f]), `check ${f} is a function`)
        const ob = Docs[f]()
        t.true(Reflect.ownKeys(ob).every(g => is.function(ob[g])), "all Docs.newsubprops are functions")
      })

    t.is (is (Docs.Documents), "Object")
    t.is (Docs.toString(), Docs.Documents.toString())
 
  })

  unit.section ("basic adv docs", t=> {
    const docName = fixes.PREFIX + "temp-doc"
    const resource = Docs.newDocument()
      .setTitle(docName)

    const doc = Docs.Documents.create (resource)
    t.true (is.nonEmptyString(doc.documentId))
    t.true (is.nonEmptyString(doc.revisionId))
    t.is (doc.title, docName)
    t.true (is.object(doc.body))
    t.true (is.object(doc.documentStyle))
    t.true (is.nonEmptyString(doc.suggestionsViewMode))
    t.true (is.object(doc.tabs))
 
    if (fixes.CLEAN)toTrash.push(DriveApp.getFileById(doc.documentId))

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
