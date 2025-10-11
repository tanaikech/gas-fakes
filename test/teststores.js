
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '@mcpher/gas-fakes'
import { wrapupTest } from './testassist.js'
import is from '@sindresorhus/is'


import { initTests } from './testinit.js'
import { isNonEmptyString } from '@sindresorhus/is'

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testStores = (pack) => {
  const { unit, fixes } = pack || initTests()

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
        ps[f].setProperty(testKey, testValue);
        t.is(ps[f].getProperty(testKey), testValue);
        // in apps script deleteProperty returns the object for chaining, but not always in the fake
        ps[f].deleteProperty(testKey);
        t.is(ps[f].getProperty(testKey), null);
        // check that we got the right thing from process if runing on node
        if (ScriptApp.isFake) {
          const st = process.env.STORE_TYPE
          t.is(ps[f].type, st, 'store should match store type in env')
        }
      }
    })


  })


  unit.section("cache store", t => {
    const cs = {}
    const testKey = 't'

    t.is(typeof CacheService.getUserCache, 'function')
    cs.up = CacheService.getUserCache()

    t.is(typeof CacheService.getScriptCache, 'function')
    cs.sp = CacheService.getScriptCache()

    t.is(typeof CacheService.getDocumentCache, 'function')
    cs.dp = CacheService.getDocumentCache()

    const exValue = 'ex'
    const p = ['dp', 'sp', 'up']
    p.forEach(f => {
      const testValue = f + 'p'
      if (cs[f]) {
        t.is(cs[f].put(testKey, testValue), null)
        t.is(cs[f].get(testKey), testValue)
        t.is(cs[f].remove(testKey), null)
        t.is(cs[f].put(testKey, exValue, 2), null)
      } else {
        t.is(cs[f], null)
      }
      // check that we got the right thing from process if runing on node
      if (ScriptApp.isFake && cs[f]) {
        const st = process.env.STORE_TYPE
        t.is(cs[f].type, st, 'store should match store type in env')
      }
    })

    p.forEach(f => {
      if (cs[f]) {
        t.is(cs[f].get(testKey), exValue)
      }
    })
    Utilities.sleep(2000)
    p.forEach(f => {
      if (cs[f]) {
        t.is(cs[f].get(testKey), null)
      }
    })
  })



  unit.section("properties and cache store cross-environment ", t => {

    // these tests are about interoperatibility between fake and live
    // first we'll create spefic drop in instances
    // 1. get some creds from if we can from env
    const inFake = PropertiesService.isFake
    const sp = PropertiesService.getScriptProperties()
    const dope = sp.externalService || null
    const isUpstash = dope && dope.type === "upstash"

    if (inFake) {
      if (isUpstash) {
        t.true(isNonEmptyString(dope.url), 'we should have an upstash url')
        t.true(isNonEmptyString(dope.token), 'we should have an upstash token')
        t.is(dope.kind, 'property', 'kind should be property')
        t.is(dope.type, 'upstash', 'type should be upstash')
        t.true(is.undefined(dope.defaultExpirationSeconds), 'no expiration in properties')
      } else {
        console.log('...cant test upstash as we dont have creds from env')
      }
    } else {
      // not available in live
      t.is(dope, null)
    }


    // we have some local creds so we can do all his
    if (isUpstash) {
      const creds = {
        ...dope,
        scriptId: ScriptApp.getScriptId()
      }
      const newCacheDropin = ScriptApp.__newCacheDropin
      t.true(is.function(newCacheDropin, 'scriptapp should be able to export an instance of this'))
      const props = newCacheDropin({ creds: { ...creds, kind: "property" } });
      const cache = newCacheDropin({ creds: { ...creds, kind: "cache" } });

      // this should show up in the dropin  stores of live apps script if they are set up
      // we'll use the same key in props and cache to check partitioning works
      props.setProperty('fkey', 'fpvalue')
      cache.put('fkey', 'fcvalue')
      t.is(props.getProperty('fkey'), 'fpvalue')
      t.is(cache.get('fkey'), 'fcvalue')

      // the fake property store should also be using upstash
      PropertiesService.getScriptProperties().setProperty('fskey', 'fpsvalue')
      CacheService.getScriptCache().put('fskey', 'fcsvalue')
      t.is(PropertiesService.getScriptProperties().getProperty('fskey'), 'fpsvalue')
      t.is(CacheService.getScriptCache().get('fskey'), 'fcsvalue')

    }

    // now on the live gas we can read these values
    if (!inFake) {
      // the creds should be in the prop store of the live apps script
      t.true(is.function(newCacheDropin, 'should be defined globallly from the library'))
      const dope = PropertiesService.getScriptProperties().getProperty("dropin_upstash_credentials")
      t.true(is.nonEmptyString(dope), 'needs flex-cache creds in live test script property store')
      const crob = dope && JSON.parse(dope)
      if (crob) {
        const creds = {
          ...crob,
          scriptId: ScriptApp.getScriptId()
        }
        // we can go ahead and create a dropin to check the store
        const props = newCacheDropin({ creds: { ...creds, kind: "property" } });
        const cache = newCacheDropin({ creds: { ...creds, kind: "cache" } });
        t.is(props.getProperty('fkey'), 'fpvalue')
        t.is(cache.get('fkey'), 'fcvalue')
        t.is(props.getProperty('fskey'), 'fpsvalue')
        t.is(cache.get('fskey'), 'fcsvalue')
      }
    }

  })

  if (!pack) {
    unit.report()
  }

  return { unit, fixes }
}


wrapupTest(testStores)