
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '../main.js'
import { wrapupTest } from './testassist.js';
import { initTests }  from  './testinit.js'


// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSession = (pack) => {
  const {unit, fixes} = pack || initTests()

  // It's possible that the session information (which depends on the OAuth token)
  // isn't ready when the tests run. Let's explicitly get the token first to ensure
  // the authentication flow, including fetching user info, is complete.
  ScriptApp.getOAuthToken();

  unit.section("session properties", t => {
    t.is(Session.getActiveUser().toString(), fixes.EMAIL)
    t.is(Session.getActiveUser().getEmail(), fixes.EMAIL)
    t.is(Session.getEffectiveUser().getEmail(), fixes.EMAIL)
    t.is(Session.getActiveUserLocale().replace (/_.*/, ''), fixes.TEST_LOCALE.replace (/_.*/, ''))
    t.is(Session.getScriptTimeZone(), fixes.TIMEZONE)
    t.true(is.nonEmptyString(Session.getTemporaryActiveUserKey()))
  }, {
    skip: false
  })

  if (!pack) {
    unit.report()
  }
  return { unit, fixes }
}


wrapupTest(testSession)