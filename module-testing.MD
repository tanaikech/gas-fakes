# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Collaborating

Testing and updating in a collaborative environment can be hard. Here's how it works to minimize merge problems
- Communicate what you're working on before starting
- Work on service separately where possible - for Example if A is working on Drive, B should work on Sheets

## testing

All tests are now modular and should contain sections that tests what you're working on - for example.

testutilities.js

````js

// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '@mcpher/gas-fakes'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests }  from  './testinit.js'

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testUtilities = (pack) => {
  const {unit, fixes} = pack || initTests()

  unit.section("utilities base64 encoding", t => {
    // ... tests

  })

  unit.section("utilities zipping", t => {
    //.. tests
    
  })


  unit.section('utilities gzipping', t => {
    //.. tests

  })

  unit.section('utilities blob manipulation', t => {
    //.. tests
        
  })

  unit.section("utilities hmac", t => {
    //.. tests

  })

  unit.section('gas utiltities', t => {
    //.. tests
    
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

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testUtilities()


````

## Running individual tests
The package.json should contain a reference to the test
````
  "scripts": {
    "test": "node --env-file=.env ./test/test.js",
    "testdrive": "node --env-file=.env ./test/testdrive.js execute",
    "testsheets": "node --env-file=.env ./test/testsheets.js execute",
    "testfetch": "node --env-file=.env ./test/testfetch.js execute",
    "testsession": "node --env-file=.env ./test/testsession.js execute",
    "testutilities": "node --env-file=.env ./test/testutilities.js execute",
    "teststores": "node --env-file=.env ./test/teststores.js execute",
    "testscriptapp": "node --env-file=.env ./test/testscriptapp.js execute",
    "pub": "npm publish --access public"
  },
````
they can be run individually with - for example
````
npm run testdrive
````
## Running all tests
The consolidated test.js should contain references to all known tests
````
import '@mcpher/gas-fakes'
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

````
and can be run with
````
npm run test
````
## Running on apps script

execute `bash togas.sh` to copy all files to apps script IDE. All tests can be run there either indivually or as a whole just like on Node

## <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Further Reading

- [getting started](GETTING_STARTED.md) - how to handle authentication for restricted scopes.
- [readme](README.md)
- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/)
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [Russian version](README.RU.md) ([credit Alex Ivanov](https://github.com/oshliaer)) - needs updating
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](oddities.md) - a collection of oddities uncovered during this project
- [gemini](gemini.md) - some reflections and experiences on using gemini to help code large projects
- [named colors](named-colors.md)
- [sandbox](sandbox.md)
- [named range identity](named-range-identity.md)
- [restricted scopes](restricted_scopes.md) - how to handle authentication for restricted scopes.