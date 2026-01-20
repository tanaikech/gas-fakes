---
description: How to run tests for gas-fakes
---
All tests must be run from the `test` directory to ensure environment variables and dependencies are correctly loaded.

1. Set the working directory to the `test` folder.
// turbo
2. Run the specific test script using `npm run`.

Example for sandbox tests:
```bash
# Run from the root of the project
npm run testsandbox --prefix test
```
*Note: While `--prefix` works for npm, it's safer to ensure the process's working directory is actually `test` if the script uses relative paths like `./.env`.*

Or if you want to run a specific test file directly:
```bash
cd test && node --env-file ./.env testsandbox.js execute
```

> [!IMPORTANT]
> Never run tests from the root directory as they will fail to find the `.env` file and other local dependencies.
