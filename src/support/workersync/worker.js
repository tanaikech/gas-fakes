import { parentPort } from 'worker_threads';
import { Auth } from '../auth.js'; // The worker has its own instance of the Auth class
import * as allSxFunctions from './sxfunctions.js'; // This has to be a separate file for mocking in tests
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { syncLog, syncError } from './synclogger.js';

let control;
let dataView;
const textEncoder = new TextEncoder();

/**
 * Writes a result to the shared buffer and sets control flags.
 * @param {*} result The successful result to write.
 */
async function writeResult(result) {
  const resultString = JSON.stringify(result === undefined ? null : result);
  const encodedResult = textEncoder.encode(resultString);

  if (encodedResult.length > dataView.buffer.byteLength) {
    syncLog(`..result is very long ${encodedResult.length} - writing to file to return result`)
    // Result is too large for the buffer, write to a temporary file instead.
    const tempFile = path.join(os.tmpdir(), `gas-fakes-worker-result-${Date.now()}.tmp`);
    await fs.writeFile(tempFile, encodedResult);
    const pathBytes = textEncoder.encode(tempFile);

    // Write the path to the shared buffer
    dataView.set(pathBytes);
    Atomics.store(control, 1, pathBytes.length); // data size (of the path)
    Atomics.store(control, 2, 0); // success flag
    Atomics.store(control, 3, 1); // result type: file
  } else {
    // Result fits in the buffer, write it directly.

    dataView.set(encodedResult);
    Atomics.store(control, 1, encodedResult.length); // data size
    Atomics.store(control, 2, 0); // success flag
    Atomics.store(control, 3, 0); // result type: buffer
 
  }
}

/**
 * Serializes an error and writes it to the shared buffer.
 * @param {Error} error The error to write.
 */
function writeError(error) {
  const errorObject = {
    message: error.message,
    stack: error.stack,
    name: error.name,
  };
  const errorString = JSON.stringify(errorObject);
  const encodedError = textEncoder.encode(errorString);

  dataView.set(encodedError);
  Atomics.store(control, 1, encodedError.length); // data size
  Atomics.store(control, 2, 1); // error flag
  Atomics.store(control, 3, 0); // result type: buffer (errors are always small enough)
}

// 1. Receive the shared buffers from the main thread on startup.
parentPort.once('message', (msg) => {
  control = new Int32Array(msg.controlBuf);
  dataView = new Uint8Array(msg.dataBuf);

  // Signal that the worker is ready.
  Atomics.store(control, 0, 0);
  Atomics.notify(control, 0);
});

/**
 * Catches any error that happens outside the main task processing loop,
 * especially during worker initialization/module loading.
 * @param {Error} error The uncaught error.
 */
const handleUncaughtError = (error) => {
  // If control is not initialized, we can't report the error.
  // Just log it and exit.
  if (control) {
    syncError('A fatal, unhandled error occurred in the worker', error);
    writeError(error);
    Atomics.notify(control, 0);
  }
};
process.on('uncaughtException', handleUncaughtError);
process.on('unhandledRejection', handleUncaughtError);

// 2. Listen for tasks from the main thread.
parentPort.on('message', async (task) => {
  // Ignore the initial setup message which has no 'method' property.
  if (!task.method) return;


  try {
    const asyncFn = allSxFunctions[task.method];
    if (!asyncFn) {
      throw new Error(`[Worker] Unknown method: ${task.method}`);
    }

    let result;
    if (task.method === 'sxInit') {

      // sxInit is special: it creates the auth state and returns serializable info.
      result = await asyncFn(...task.args);

      // Configure the worker's persistent Auth object.
      Auth.setAdcPath(result.adcPath);
      // The projectId is already discovered and set within the initial `sxInit` -> `setAuth` call.
      // This subsequent call is redundant, so it is removed for clarity.
      // Auth.setProjectId(result.projectId);
      await Auth.setAuth(result.scopes);
      Auth.setAccessToken(result.accessToken);
      Auth.setSettings(result.settings);
      Auth.setClasp(result.clasp);
      Auth.setManifest(result.manifest);

    } else {
      // All other sx* functions receive the worker's Auth object as their first argument.
      if (!Auth.getProjectId()) {
        throw new Error('[Worker] Not initialized. fxInit must be called first.');
      }
      result = await asyncFn(Auth,...task.args);

    }

    await writeResult(result);

  } catch (error) {
    syncError('An unhandled error occurred in the worker', error);
    writeError(error);
  } finally {
    // 3. Signal completion and wake up the main thread.
    Atomics.store(control, 0, 0);
    Atomics.notify(control, 0);
  }
});