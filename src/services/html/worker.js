import { parentPort, workerData } from 'worker_threads';
import fs from 'fs';
import path from 'path';
import { runInThisContext } from 'vm';
import { Utils as GasFakesUtils } from '../../support/utils.js';

// Initialize the gas-fakes environment in this worker isolate
import '../../index.js';

// The worker is spawned with the path to the main script
const { mainScriptPath, funcName, args, isTemplate, templateString } = workerData;

async function run() {
  try {
    const projectDir = path.dirname(mainScriptPath);
    
    // Simulate Apps Script's global execution model:
    // Read all .js and .gs files in the directory and evaluate them in this global context.
    const files = fs.readdirSync(projectDir);
    const scriptFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.gs'));
    
    // Sort files to ensure deterministic execution (like clasp does)
    scriptFiles.sort();

    for (const file of scriptFiles) {
      const fullPath = path.join(projectDir, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Strip ESM keywords to allow evaluation in the raw VM context
      const strippedContent = GasFakesUtils.stripEsmKeywords(content);
      
      try {
        // runInThisContext executes the code globally within the current V8 isolate
        runInThisContext(strippedContent, { filename: fullPath });
      } catch (e) {
        console.error(`gas-fakes Error parsing ${file}: ${e.message}`);
      }
    }

    if (isTemplate) {
        parentPort.postMessage({ result: "Template evaluation not yet implemented in worker" });
        return;
    }

    const func = globalThis[funcName];

    if (typeof func !== 'function') {
      throw new Error(`google.script.run: function "${funcName}" is not defined on the server.`);
    }

    // Apps Script functions can be async, so we await
    const result = await func(...args);
    
    // Apps Script parameters/returns are JSON serialized
    const serializedResult = typeof result === 'undefined' ? undefined : JSON.parse(JSON.stringify(result));
    
    parentPort.postMessage({ result: serializedResult });
  } catch (error) {
    parentPort.postMessage({ error: { message: error.message, stack: error.stack } });
  }
}

run();
