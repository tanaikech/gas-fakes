
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import '../main.js'
import { initTests }  from  './testinit.js'
import { testDrive } from './testdrive.js';
import { testSheets } from './testsheets.js';
import { testFetch } from './testfetch.js';
import { testSession } from './testsession.js';
import { testUtilities } from './testutilities.js';
import { testStores } from './teststores.js';
import { testScriptApp } from './testscriptapp.js';

const testFakes = () => {
  const pack = initTests()
  const {unit} = pack

  // add one of these for each service being tested
  
  testSheets(pack)
  testDrive(pack)
  testFetch(pack)
  testSession(pack)
  testUtilities(pack)
  testStores(pack)
  testScriptApp(pack)
  
  unit.report()
}

// this required on Node but not on Apps Script
if (ScriptApp.isFake) testFakes()
