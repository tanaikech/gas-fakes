---
description: How to run a generated Apps Script using gas-fakes
---

You can execute any generated Apps Script file using the `gas-fakes` CLI in a local sandbox.

1. Generate your script as a `.js` file (e.g., `myscript.js`).
// turbo
2. Execute the script using `npx`:

```bash
npx gas-fakes -f myscript.js
```

You can add sandbox flags as requested by the user to control the environment.


However this will test the globally installed version, and we most likely want to use the latest version in the branch we are in - so for that use `node gas-fakes -f myscript.js`

You also might want to use the local .env file with `node --env-file ./.env -f myscript.js`