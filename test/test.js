
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
import { getPerformance } from '../src/support/filecache.js';
import { getSheetsPerformance } from '../src/support/sheetscache.js';
import { testFiddler } from './testfiddler.js';


const testFakes = () => {
  const pack = initTests()
  const {unit} = pack

  // add one of these for each service being tested
  testSheets(pack)
  testFiddler(pack)
  testDrive(pack)
  testFetch(pack)
  testSession(pack)
  testUtilities(pack)
  testStores(pack)
  testScriptApp(pack)

  // reports on cache performance
  if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())
  if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  
  // all tests cumulative unit report
  unit.report()
}

// this required on Node but not on Apps Script
if (ScriptApp.isFake) testFakes()
