# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Collaborating

Testing and updating in a collaborative environment can be hard. Here's how it works to minimize merge problems
- Communicate what you're working on before starting
- Work on service separately where possible - for Example if A is working on Drive, B should work on Sheets

## testing

All tests are now modular and should contain sections that tests what you're working on - for example.

testutilities.js

````js

// all these imports 

import is from '@sindresorhus/is';
import '@mcpher/gas-fakes'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests, wrapupTest }  from  './testinit.js'

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testUtilities = (pack) => {
  const {unit, fixes} = pack || initTests()

  unit.section("utilities base64 encoding", t => {
    // ... tests

  })

  unit.section("utilities zipping", t => {
    //.. tests
    
  })
  // etc..

  if (!pack) {
    unit.report()
  }
  return { unit, fixes }
}

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute" 
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

wrapupTest(testUtilities);

````

## Running individual tests
The package.json should contain a reference to the test
````
  "scripts": {
    "test": "node  ./test/test.js",
    "testdrive": node ./test/testdrive.js execute",
    ....etc
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
...etc

const testFakes = () => {
  const pack = initTests()
  const {unit} = pack

  // add one of these for each service being tested
  
  testSheets(pack)
  testDrive(pack)
  ...etc
  
  unit.report()
}

// this required on Node but not on Apps Script
if (ScriptApp.isFake) testFakes()

````
and can be run with
````
npm run test
````

## how to redirect to use local files

When testing and you want to use the local files rather than @mcpher/gas-fakes, you can have a local package.json in the same folder as your tests which directs the package to a local file. just run npm i to install
````
  "dependencies": {
    "@mcpher/gas-fakes": "file:../../"
  }
````
where the file value points to the root of gas-fakes. If you want to instead use the npm version then just revert that normal npm syntax and install again. 



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
- [adc and restricted scopes](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
