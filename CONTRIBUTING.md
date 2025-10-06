# Some notes for gas-fakes collaborators 

This is a proof of concept so I've implemented a subset of number of services and methods, but the tricky parts are all in place so all that's left is a load of busy work (to which I heartily invite any interested collaborators).

## progress

This is a pretty huge task, so I'm working on adding services a little bit at a time, with usually just a few methods added in each release. I'm looking for collaborators who not only want to help on this project, but also to deepen their understanding of Apps Script services, and the worksace APIs. I've certainly learned a lot so far.

## Getting started

First take a look at the [readme](README.md) for how to get started as a user. The main difference is
- You'll be using a local fork from the [repo](https://github.com/brucemcpherson/gas-fakes) of the source code rather than from npm
- You'll need a companion Apps Script project so you can test your work as you go
- You can merge your updates, issues and tests into the main repo
- Merges are happening almost daily so you can pull the latest updates to your fork regularily


### Development schedule

As a background project I'm chipping away at this when I can. There's a mountain of work to do, and I'm not that bothered about the general order I do it in. If you would specifically like some service or method prioritized, let me know and I'll see if I can push it forward. Better still, if you'd like to have a crack at implementing it yourself, let me know and I'll get you started.


## Testing

Here's some guidance on testing. Before submitting a PR always run all the existing tests on both live Apps Script and gas-fakes to ensure your changes havn't broken anything.


### Create a unit.section for each class method or group of related methods

 If you are a collaborator and want to add some additional methods, you need to create a test section and always run a full set of tests on both environments before creating a merge request to ensure your changes havent broken anything. At the time of writing there are about 4,500 active tests.

### Unit tester for both GAS and Node

Note that I use a [unit tester](https://ramblings.mcpher.com/apps-script-test-runner-library-ported-to-node/) that runs in both GAS and Node, so the exact same tests will run in both environments. There are some example tests in the repo. Each test has been proved on both Node and GAS. There's also a shell (togas.sh) which will use clasp to push the test code to Apps Script.

Each test can be run individually (for example `npm run testdrive`) or all with `npm test`

### Test Settings

Test settings and fixtures are in test/testfixes.js. Some readonly files are publicly shared and can be left at current values. Most files which are written are created and deleted afterwards on successful completion. They will be named something starting with -- and often centralized into a scratch folder for easy maintentance. In case of failures you may need to delete these yourself. 

##### Breaking fixtures change at v1.0.27

Previously we were using the .env file to pass fixed values to the tests. That has proved to be problematic, so now the test values are in ./test/testfixes.js 

If you need to convert an existing .env file, there's a shell script for that. 
- go to the test folder
- execute sh efixconvert.sh
- run once, check testfixes.js, run a test 
- if all okay - you can now delete from ../env all keys that are required for testing. In other words delete all the items that are not in ../.env-setup-template
- from v1.0.27 .env fixtures are no longer supprted.
- the package.json in the test folder has been updated as below, so you'll need to reinstall there.

##### how to redirect to use local files

When testing and you want to use the local files rather than @mcpher/gas-fakes, you can have a local package.json in the same folder as your tests which directs the package to a local file. just run npm i to install
````
  "dependencies": {
    "@mcpher/gas-fakes": "file:../../"
  }
````
where the file value points to the root of gas-fakes. If you want to instead use the npm version then just revert that normal npm syntax and install again. 

#### Specifics on expectations for test files. 

In principle test files specified in the .env file should belong to you, although for simplicity and to test predefined ui set values, some are necesseraily shared - here are all the test files expected by the test suite.

| name | value | ownership | comments |
|---|---|---|---|
| TEST_BORDERS_ID | 1hRGdrYHEPixXTuQLeL3Z0qGRZVs_8ojMIm6D4KrCh1o | shared | used to test UI set values | 
| TEST_AIRPORTS_ID | 1h9IGIShgVBVUrUjjawk5MaCEQte_7t32XeEP1Z5jXKQ | shared | used to test fiddler library with known values | 
| TEST_FOLDER_NAME | your own folder name | you | a folder in the top Drive level you create |
| TEST_FOLDER_FILES | the number of files | your value | the number of files we should expect to find in TEST_FOLDER_NAME | 
| TEST_FOLDER_ID | your own folder id | you | a folder you have write access to - its used to move files into |
| DRIVE_TEST_FILE_ID | your own file id | you | a file you have read access to - token.sh uses it to check authenticated properly |
| TEXT_FILE_NAME | fake.txt | shared | the name of a known file we'll check for content can be your own or shared |
| TEXT_FILE_ID | 1142Vn7W-pGl5nWLpUSkpOB82JDiz9R6p | shared | the id of the TEXT_FILE_NAME |
| TEXT_FILE_TYPE | text/plain | shared | the type of the TEXT_FILE_ID |
| TEXT_FILE_CONTENT | foo is not bar | shared | the content of the TEXT_FILE_ID |
| TEST_SHEET_ID | 1DlKpVVYCrCPNfRbGsz6N_K3oPTgdC9gQIKi0aNb42uI | shared | a sheet you have read access to |
| TEST_SHEET_NAME | sharedlibraries | shared | the name of TEST_SHEET_ID |
| PDF_ID | 17t4ep9Jt6jRyDx0KlxMhHQNGZ3whg6GS | shared | id of a test pdf file you have access to |
| SCRATCH_VIEWER | viewer@mcpher.com" | your own version | email addresses to use to test assigning permissions |
| SCRATCH_EDITOR | editor@mcpher.com" | .. | .. |
| SCRATCH_B_VIEWER | viewer2@mcpher.com" | .. | .. |
| SCRATCH_B_EDITOR | editor2@mcpher.com" | .. | .. |
| MIN_ROOT_PDFS | 20 | change to your own | the minimum number of pdfs to expect to find in your root folder |
| MIN_PDFS | 400 | change to your own | the minimum number of pdfs to expect to find everywhere in drive |
| MIN_FOLDERS_ROOT | change to your own | the minimum number of folders to expect to find in your root folder |

### cleaning up

Most unit sections are isolated so will create their own files with some easily recognizable nonsense names. Tis can lead to many files appearing in Drive. Test runs are supposed to clean them up afterards, but if you have a failure they won't. Lately I've been adding all test files to a specific folder. If you move that folder to the bin, then all test files will automatocally end up in the bin too.

### Pushing to GAS

The script uses togas.sh will move the test scripts to GAS with clasp - just set the `SOURCE` and `TARGET` folders in the TOGAS script. Make sure you have an `appsscript.json` manifest in the `SOURCE` folder, as **gas-fakes** reads that to handle OAuth on Node.

You can write your project to run on Node and call GAS services, and it will also run on the GAS environment with no code changes, except on the Node side you have this one import

```sh
// all the fake services are here
import '@mcpher/gas-fakes/main.js'
```

togas.sh will remove imports and exports on the way to apps script, which doesnt support them.

## Mocking

I haven't found a real need to create many mocks, as the Live Apps Script environment has all you need to check test scripts. I always run all tests on Apps Script first, then strive to get the same result in Node. In principle there should be no 'special exceptions' in the test files, except in the case of outstanding issues reported in buganizer (where apps script is not behaving as it should) and also in the issues of the repo.

## Experiments

There's a folder 'experiments' for this. They don't form part of the project, but can be used for playing around. It can be useful to preservce these for future use. See the readme in the experiments folder for more info.

## Using Gemini code assist

I've had mixed result with Gemini on this large project. If you're planning to use Gemini to do some legwork, I have no objections but here's some [notes](gemini.md) - some reflections and experiences on using Gemini to help code large projects on my experience so far.

## Help

As I mentioned earlier, to take this further, I'm going to need a lot of help to extend the methods and services supported - so if you feel this would be useful to you, and would like to collaborate, please ping me on [bruce@mcpher.com](mailto:bruce@mcpher.com) and we'll talk.

## Translations and writeups

- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [Russian version](README.RU.md) ([credit Alex Ivanov](https://github.com/oshliaer)) - needs updating
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](oddities.md) - a collection of oddities uncovered during this project
- [gemini](gemini.md) - some reflections and experiences on using gemini to help code large projects
- [readme](README.md)
- [named colors](named-colors.md)
- [sandbox](sandbox.md)
- [named range identity](named-range-identity.md)
