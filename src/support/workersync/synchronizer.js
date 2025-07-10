import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Shared buffer for control signals
// [0]: status lock (0: free, 1: busy, 2: worker_init)
// [1]: result data size in bytes
// [2]: error flag (0: success, 1: error)
// [3]: result type (0: buffer, 1: file)
const controlBuf = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 4);
const control = new Int32Array(controlBuf);

// Shared buffer for data transfer (e.g., 16MB)
const dataBuf = new SharedArrayBuffer(16 * 1024 * 1024);
const dataView = new Uint8Array(dataBuf);

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// The single, long-lived worker
const worker = new Worker(path.resolve(__dirname, 'worker.js'));

// Pipe worker's stdout and stderr to the main process to see its logs
worker.stdout.pipe(process.stdout);
worker.stderr.pipe(process.stderr);

// It's crucial to listen for errors, otherwise a crash on worker startup
// will cause the main thread to hang indefinitely on Atomics.wait().
worker.on('error', (error) => {
  console.error('Worker thread encountered a fatal error:', error);
  // Unblock any pending Atomics.wait() call to prevent a deadlock.
  Atomics.store(control, 0, 0); // Set status to "free"
  Atomics.notify(control, 0);
  // Exit the main process, as the application is in an unrecoverable state.
  process.exit(1);
});

worker.on('exit', (code) => {
   console.error('Worker exited unexpectedly with code:', code);
  // This handles cases where the worker exits unexpectedly.
  if (code !== 0) {
    console.error(`Worker thread stopped with exit code ${code}`);
    Atomics.store(control, 0, 0); // Unblock main thread
    Atomics.notify(control, 0);
  }
});

// Send the shared buffers to the worker once and wait for it to confirm initialization
Atomics.store(control, 0, 2); // Set status to "worker_init"
worker.postMessage({ controlBuf, dataBuf });
Atomics.wait(control, 0, 2); // Wait for worker to set status to "free" (0)

// Allow the main process to exit even if the worker is still running.
worker.unref();

// Ensure worker is terminated when the main process exits
process.on('exit', () => {
  console.log ('...worker is terminating')
  worker.terminate()
});

/**
 * Calls an async function in the worker and blocks until it returns.
 * This is the replacement for `make-synchronous`.
 * @param {string} method The name of the sx* function to call in the worker.
 * @param  {...any} args Arguments for the function.
 * @returns {any} The result from the async function.
 */
export function callSync(method, ...args) {


  // 1. Set status to "busy". This acts as a lock.
  Atomics.store(control, 0, 1);

  // 2. Send the task to the worker.
  const payload = { method, args };
  worker.postMessage(payload);

  // 3. Block and wait for the worker to finish.
  // It's "busy" (1) until the worker sets it back to "free" (0).
  // This is a true blocking wait, consuming minimal CPU.
  Atomics.wait(control, 0, 1);

  // 4. Worker is done, result is in the shared buffer.
  const resultSize = Atomics.load(control, 1);
  const hasError = Atomics.load(control, 2) === 1;
  const resultIsFile = Atomics.load(control, 3) === 1;

  if (resultSize > dataBuf.byteLength) {
    throw new Error(
      `Result size (${resultSize}) exceeds shared buffer size (${dataBuf.byteLength}).`
    );
  }

  let resultString;
  if (resultIsFile) {
    // The buffer contains a path to a temporary file.
    const tempFilePathBytes = dataView.slice(0, resultSize);
    const tempFilePath = textDecoder.decode(tempFilePathBytes);
    try {
      resultString = fs.readFileSync(tempFilePath, 'utf-8');
    } finally {
      // Ensure the temporary file is deleted.
      fs.unlinkSync(tempFilePath);
    }
  } else {
    // The buffer contains the result directly.
    const resultBytes = dataView.slice(0, resultSize);
    resultString = textDecoder.decode(resultBytes);
  }

  // Note: JSON.parse can be a bottleneck for very large objects.
  const resultData = JSON.parse(resultString);

  if (hasError) {
    // Re-hydrate the error object on the main thread.
    const err = new Error(resultData.message);
    err.stack = resultData.stack;
    // Copy other properties if they exist.
    Object.assign(err, resultData);
    throw err;
  }

  return resultData;
}