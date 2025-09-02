# Generate and run Google Apps Script

Generate the script by referring to the sample scripts at "StackOverflow" obtained using a Google search. If an error occurs, modify the script by referring to StackOverflow again.

In order to run the script of Google Apps Script, use "@mcpher/gas-fakes". The base of the script is as follows: "BaseScript". Google Apps Script is safely run in the sandbox. As additional information, in the current stage, gas-fakes cannot use `Logger.log`. So, please use `console.log` instead of it.

<BaseScript>
```javascript
import "@mcpher/gas-fakes/main.js"
ScriptApp.__behavior.sandBoxMode = true;

//---
// Generated Google Apps Script
//---

ScriptApp.__behavior.trash();
```
</BaseScript>

Please replace the comment lines in "BaseScript" with the generated Google Apps Script. And, run the script by `node [filename.js]`.
