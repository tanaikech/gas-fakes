import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workerPath = path.join(__dirname, 'consumerworker.js');

const CONTROL_INDICES = {
  STATUS: 0,
  DATA_SIZE: 1,
  IS_ERROR: 2
};

export class ServerWorkerContext {
  constructor() {
    this._mainScriptPath = process.argv[1];
    
    // Create shared buffers for synchronous communication
    // 3 control Int32s
    this._controlBuf = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 3);
    this._control = new Int32Array(this._controlBuf);
    
    // 1MB data buffer (should be enough for template substitutions and function returns)
    this._dataBuf = new SharedArrayBuffer(1024 * 1024);
    this._dataView = new Uint8Array(this._dataBuf);
    this._textDecoder = new TextDecoder();
  }

  _executeSyncWorker(workerDataPayload) {
    if (!this._mainScriptPath) {
      throw new Error("Could not determine main script path. Ensure process.argv[1] is set.");
    }

    // Set lock to busy (1)
    Atomics.store(this._control, CONTROL_INDICES.STATUS, 1);

    const worker = new Worker(workerPath, {
      workerData: {
        ...workerDataPayload,
        mainScriptPath: this._mainScriptPath,
        controlBuf: this._controlBuf,
        dataBuf: this._dataBuf
      }
    });

    // Handle unexpected worker crashes
    worker.on('error', (err) => {
      console.error("Consumer worker crashed:", err);
      Atomics.store(this._control, CONTROL_INDICES.STATUS, 0);
      Atomics.notify(this._control, 0);
    });
    
    worker.on('exit', (code) => {
      if (code !== 0) {
        Atomics.store(this._control, CONTROL_INDICES.STATUS, 0);
        Atomics.notify(this._control, 0);
      }
    });

    // Block main thread until worker finishes (sets status to 0)
    Atomics.wait(this._control, CONTROL_INDICES.STATUS, 1);

    // Read result
    const hasError = Atomics.load(this._control, CONTROL_INDICES.IS_ERROR) === 1;
    const resultSize = Atomics.load(this._control, CONTROL_INDICES.DATA_SIZE);
    
    const resultBytes = this._dataView.slice(0, resultSize);
    const resultString = this._textDecoder.decode(resultBytes);
    
    const resultData = JSON.parse(resultString);

    if (hasError) {
      throw new Error(resultData.message);
    }

    return resultData;
  }

  /**
   * Synchronously evaluates a template string in a fresh consumer instance.
   */
  evaluateTemplate(templateString) {
    return this._executeSyncWorker({
      isTemplate: true,
      templateString
    });
  }

  /**
   * Synchronously executes a function in a fresh consumer instance.
   */
  runFunction(funcName, args) {
    return this._executeSyncWorker({
      isTemplate: false,
      funcName,
      args
    });
  }
}
