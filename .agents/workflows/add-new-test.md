---
description: How to create and register a new test script
---

When creating new test scripts, follow the existing patterns in the `test/` folder.

1. Create the test file in the `test/` directory (e.g., `test/testnewfeature.js`).
2. Add the test file to the `test/test.js` entry point.
3. Add a corresponding test script to `test/package.json`.

> [!IMPORTANT]
> All tests MUST be run from the `test/` folder to ensure environment variables (`.env`) and dependencies are correctly resolved.

Be sure that you use the correct test runner. Exampeles of use are in all the test/*.js files.