import { parentPort, workerData } from 'worker_threads';

// The worker is spawned with the path to the main script
const { mainScriptPath, funcName, args, isTemplate, templateString } = workerData;

async function run() {
  try {
    // Dynamically import the consumer's main script
    // This executes the script in a completely fresh isolate
    const consumerModule = await import('file://' + mainScriptPath);
    
    // We also want to expose global functions they might have defined
    // since they might not export them
    const availableFunctions = { ...consumerModule, ...globalThis };

    if (isTemplate) {
        // Implement template logic here
        // We'll need a way to pass the template string and get back the evaluated string
        // For now, let's just send back a stub
        parentPort.postMessage({ result: "Template evaluation not yet implemented in worker" });
        return;
    }

    const func = availableFunctions[funcName];

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
