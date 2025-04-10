
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests }  from  './testinit.js'

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testFetch = (pack) => {
  const {unit, fixes} = pack || initTests()

  unit.section('urlfetchapp external and blobs', t => {
    const img = UrlFetchApp.fetch(fixes.RANDOM_IMAGE)
    const blob = img.getBlob()
    t.true(is.nonEmptyString(blob.getName()))
    t.is(blob.getContentType(), 'image/jpeg', 'assumes the random image is a jpeg')
    t.true(is.array(blob.getBytes()))

    // to an api fetch
    const text = UrlFetchApp.fetch(fixes.API_URL)
    const textBlob = text.getBlob()
    t.deepEqual(JSON.parse(textBlob.getDataAsString()), JSON.parse(text.getContentText()))
    t.true(is.array(JSON.parse(text.getContentText())))
    t.is(textBlob.getContentType(), fixes.API_TYPE, 'expected this be application/json but suggest actually returns this')
    t.true(is.nonEmptyString(textBlob.getName()))

  })

  if (!pack) {
    unit.report()
  }
  return { unit, fixes }
}

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute" 
// for example node testdrive.js execute
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testFetch()
