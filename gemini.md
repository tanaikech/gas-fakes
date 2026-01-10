# How to access workspace resources
`gas-fakes` is a library that provides a local sandbox runtime for Apps Script. All workspace resources can be accessed by creating a simple Apps Script and executing it in a sandbox under control of the gas-fakes cli. 

- The full repo for gas-fakes is here https://github.com/brucemcpherson/gas-fakes
- Getting started with gas-fakes is here https://github.com/brucemcpherson/gas-fakes/blob/main/README.md
- How to use sandboxes is here https://github.com/brucemcpherson/gas-fakes/blob/main/sandbox.md
- All Apps Script documentation is here https://github.com/brucemcpherson/gas-fakes/tree/main/progress

We are building a fake environment to exactly emulate the Google Workspace environment. This means that each test in the test folder will run on both enviroments and produce exactly the same result.

You can run the following command to run any script you generate, adding any optional sandbox flags as requested.

```bash
npx gas-fakes -f yourscript.js
```
## test scripts

When you create test scripts, you should folow the patterns in the other testscripts in the test folder.  A new test script should be addeded to test/test.js and test/package.json. All tests are to be run from the test folder.

## dynamic resources

Notice that each class usually has a dynamic resource. For example the CalendarApp class has a __resource property that is a Calendar resource from the Google Calendar API. This resource is used to get the state of the calendar in the fake environment.  It always make a call to the Google Calendar API to get the state of the calendar. However, there is caching in place to prevent unnecessary calls to the Google Calendar API. Every time a destructive api call is made, the cache is cleared.  Therefore the resource should never be stored in a class otherwise it will get stale. Always access the resource via the dynamic __resource getter.