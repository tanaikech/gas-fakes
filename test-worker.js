import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

let myState = 0; // State in the main thread

export function getFreshState(adder) {
  myState += adder;
  return myState;
}

if (isMainThread) {
  console.log("Main thread state before worker:", myState);
  
  // Simulate google.script.run.getFreshState(5)
  const worker = new Worker(__filename, { 
    workerData: { funcName: 'getFreshState', args: [5] } 
  });
  
  worker.on('message', (result) => {
    console.log("Worker result:", result);
    console.log("Main thread state after worker:", myState); // Should still be 0
  });
  
  worker.on('error', console.error);
} else {
  // This is the worker thread executing a fresh instance of the script
  const { funcName, args } = workerData;
  
  // We need a way to find the exported function. 
  // In a real module, we'd dynamically import it.
  import(import.meta.url).then(module => {
    const func = module[funcName];
    if (func) {
      parentPort.postMessage(func(...args));
    } else {
      parentPort.postMessage({ error: 'Function not found' });
    }
  });
}
