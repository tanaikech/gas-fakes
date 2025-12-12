# How to access workspace resources
`gas-fakes` is a library that provides a local sandbox runtime for Apps Script. All workspace resources can be accessed by creating a simple Apps Script and executing it in a sandbox under control of the gas-fakes cli. 

- The full repo for gas-fakes is here https://github.com/brucemcpherson/gas-fakes
- Getting started with gas-fakes is here https://github.com/brucemcpherson/gas-fakes/blob/main/README.md
- How to use sandboxes is here https://github.com/brucemcpherson/gas-fakes/blob/main/sandbox.md
- All Apps Script documentation is here https://github.com/brucemcpherson/gas-fakes/tree/main/progress



You can run the following command to run any script you generate, adding any optional sandbox flags as requested.
```bash
npx gas-fakes -f yourscript.js
