
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '../main.js'
import { wrapupTest } from './testassist.js';



import { initTests }  from  './testinit.js'

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testScriptApp = (pack) => {
  const {unit, fixes} = pack || initTests()

  unit.section("scriptapp basics", t => {
    t.true(is.nonEmptyString(ScriptApp.getScriptId()))
    t.true(is.nonEmptyString(ScriptApp.__projectId), {
      skip: !ScriptApp.isFake
    })
    t.true(is.nonEmptyString(ScriptApp.__userId), {
      skip: !ScriptApp.isFake
    })
  })

  unit.section('scopes and oauth', t => {
    const token = ScriptApp.getOAuthToken()
    t.true(is.nonEmptyString(token))
    /**
     * Apps Script  doesn't throw an error on an an invalid requiredallscopes ENUM as it should
       it returns null just like a succesfful call for now will omit on Apps Script side tests
       see https://issuetracker.google.com/issues/395159729
     */
    if (ScriptApp.isFake) {
      t.rxMatch(
        t.threw(() => ScriptApp.requireAllScopes(ScriptApp.AuthMode.RUBBISH)),
        /only FULL is supported as mode for now/, {
        description: 'update test with whatever is thrown when APPS Script bug is fixed'
      })
    } else {
      // it should fail on apps script but doesn't
      t.is(ScriptApp.requireAllScopes(ScriptApp.AuthMode.RUBBISH), null)
    }
    t.is(ScriptApp.requireAllScopes(ScriptApp.AuthMode.FULL), null)


    /**
     * this works in fake, and should work in Apps Script, but there's an outstanding issue
     * see https://issuetracker.google.com/issues/395159730
     * for now we'll omit from Apps Script side tests
     */
    if (ScriptApp.isFake) {
      t.is(ScriptApp.requireScopes(ScriptApp.AuthMode.FULL, ['https://www.googleapis.com/auth/drive.readonly']),
        null, {
        description: 'skip on Apps Script till bug is fixed'
      })
    }

    /**
     * Apps Script  doesnt throw an error on an an invalid requiredallscopes ENUM as it should
       it returns null just like a succesfful call for now will omit on Apps Script side tests
       see https://issuetracker.google.com/issues/395159729
     */
    t.rxMatch(
      t.threw(() => ScriptApp.requireScopes(ScriptApp.AuthMode.FULL, ['https://www.googleapis.com/auth/RUBBISH'])),
      /required but have not been authorized/, {
      skip: !ScriptApp.isFake,
      description: 'skip on Apps Script till bug is fixed'
    })

  }, {
    skip: false
  })

  if (!pack) {
    unit.report()
  }
  return { unit, fixes }
}


wrapupTest(testScriptApp)