
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '../main.js'
import { wrapupTest } from './testassist.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testStores = (pack) => {
  const { unit, fixes } = pack || initTests()
  // It's possible that the session information (which depends on the OAuth token)
  // isn't ready when the tests run. Let's explicitly get the token first to ensure
  // the authentication flow, including fetching user info, is complete.
  ScriptApp.getOAuthToken();
  unit.section("properties store", t => {
    const ps = {}
    const testKey = 't'

    t.is(typeof PropertiesService.getUserProperties, 'function')
    ps.up = PropertiesService.getUserProperties()

    t.is(typeof PropertiesService.getScriptProperties, 'function')
    ps.sp = PropertiesService.getScriptProperties()

    t.is(typeof PropertiesService.getDocumentProperties, 'function')
    ps.dp = PropertiesService.getDocumentProperties()

    const p = ['dp', 'sp', 'up']
    p.forEach(f => {
      const testValue = f + 'p'
      if (ps[f]) {
        t.is(ps[f].setProperty(testKey, testValue).getProperty(testKey), testValue)
        // in apps script delete returns the object for chaining
        t.is(ps[f].deleteProperty(testKey).getProperty(testKey), null)
      }
    })


  })


  unit.section("cache store", t => {
    const ps = {}
    const testKey = 't'

    t.is(typeof CacheService.getUserCache, 'function')
    ps.up = CacheService.getUserCache()

    t.is(typeof CacheService.getScriptCache, 'function')
    ps.sp = CacheService.getScriptCache()

    t.is(typeof CacheService.getDocumentCache, 'function')
    ps.dp = CacheService.getDocumentCache()

    const exValue = 'ex'
    const p = ['dp', 'sp', 'up']
    p.forEach(f => {
      const testValue = f + 'p'
      if (ps[f]) {
        t.is(ps[f].put(testKey, testValue), null)
        t.is(ps[f].get(testKey), testValue)
        t.is(ps[f].remove(testKey), null)
        t.is(ps[f].put(testKey, exValue, 2), null)
      } else {
        t.is(ps[f], null)
      }
    })

    p.forEach(f => {
      if (ps[f]) {
        t.is(ps[f].get(testKey), exValue)
      }
    })
    Utilities.sleep(2000)
    p.forEach(f => {
      if (ps[f]) {
        t.is(ps[f].get(testKey), null)
      }
    })
  })

  if (!pack) {
    unit.report()
  }
  return { unit, fixes }
}


wrapupTest(testStores)