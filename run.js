import fs from 'fs';
import path from 'path';
import vm from 'vm';

// Import gas-fakes to initialize the environment
import '@mcpher/gas-fakes';

// Create a sandboxed context
const context = vm.createContext({
  ScriptApp: global.ScriptApp,
  console: console,
  // Add other GAS globals you need here (e.g., DocumentApp, SpreadsheetApp)
});

// Read the user's script file
const scriptPath = path.resolve('src/Code.js');
const scriptCode = fs.readFileSync(scriptPath, 'utf8');

// Run the user's script in the sandbox to define the functions
vm.runInContext(scriptCode, context);

// Define and run the calling logic to execute a function from the script
const callingCode = `
// 1. Enable sandbox mode for safety
ScriptApp.__behavior.sandBoxMode = true;

// 2. Call the specific function from your Code.js file
// myFunction();

// 3. Clean up the gas-fakes environment
ScriptApp.__behavior.trash();
`;

// vm.runInContext(callingCode, context);
console.log("Project initialized. Edit run.js to execute a function.");