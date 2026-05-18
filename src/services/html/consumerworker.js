import fs from 'fs';
import path from 'path';
import { workerData } from 'worker_threads';

const { mainScriptPath, funcName, args, isTemplate, templateString } = workerData;
const control = new Int32Array(workerData.controlBuf);
const dataView = new Uint8Array(workerData.dataBuf);
const textEncoder = new TextEncoder();

// Initialize the Apps Script environment
globalThis.__gasFakesMainScriptPath = mainScriptPath;
await import('../../../main.js');

// Bootstrap Auth with settings from environment
import { Auth } from '../../support/auth.js';
Auth.setSettings({
  documentId: process.env.GF_DOCUMENT_ID,
  scriptId: process.env.GF_SCRIPT_ID,
  cache: process.env.GF_CACHE_PATH,
  properties: process.env.GF_PROPERTIES_PATH
});

const CONTROL_INDICES = {
  STATUS: 0,
  DATA_SIZE: 1,
  IS_ERROR: 2
};

async function run() {
  try {
    console.log('Worker CWD:', process.cwd());
    console.log('Worker mainScriptPath:', mainScriptPath);
    console.log('Worker GF_DOCUMENT_ID:', process.env.GF_DOCUMENT_ID);

    // Dynamically load the user's module
    const userModule = await import(mainScriptPath);
    
    // Expose all exports to globalThis for legacy patterns
    Object.keys(userModule).forEach(key => {
        globalThis[key] = userModule[key];
    });

    let result;

    if (isTemplate) {
      // Evaluate template
      // We pass the userModule context to allow access to functions like Include
      result = templateString.replace(/<\?!=?\s*([\s\S]+?)\s*\?>/g, (match, expression) => {
        try {
           // We use the userModule exports as the scope for template expressions
           const func = new Function(...Object.keys(userModule), `return ${expression}`);
           const exprResult = func(...Object.values(userModule));
           
           if (exprResult && typeof exprResult.getContent === 'function') {
               return exprResult.getContent();
           }
           return typeof exprResult !== 'undefined' ? exprResult : '';
        } catch (e) {
           console.error(`gas-fakes template evaluation error for scriptlet '${expression}':`, e.message);
           return match;
        }
      });
    } else {
      // Run function
      const func = userModule[funcName] || globalThis[funcName];
      if (typeof func !== 'function') {
        throw new Error(`google.script.run: function "${funcName}" is not defined.`);
      }

      // Re-hydrate doPost event object
      if (funcName === 'doPost' && args && args[0] && args[0].postData) {
         args[0].postData.getDataAsString = function() { return this.contents; };
      }

      const rawResult = await func(...(args || []));
      
      // Serialize output if it's a FakeHtmlOutput or FakeTextOutput
      if (rawResult && typeof rawResult.getContent === 'function') {
        result = {
          __isHtmlOutput: !!rawResult.__isHtmlOutput,
          __isTextOutput: !!rawResult.__isTextOutput,
          __framingType: rawResult.__framingType || null,
          content: rawResult.getContent(),
          title: typeof rawResult.getTitle === 'function' ? rawResult.getTitle() : '',
          width: typeof rawResult.getWidth === 'function' ? rawResult.getWidth() : null,
          height: typeof rawResult.getHeight === 'function' ? rawResult.getHeight() : null,
          mimeType: typeof rawResult.getMimeType === 'function' ? rawResult.getMimeType() : null
        };
      } else {
        result = typeof rawResult === 'undefined' ? undefined : JSON.parse(JSON.stringify(rawResult));
      }
    }

    writeResult(result);
  } catch (error) {
    console.error('[gas-fakes worker error]', error);
    writeError(error);
  } finally {
    Atomics.store(control, CONTROL_INDICES.STATUS, 0);
    Atomics.notify(control, 0);
  }
}

function writeResult(result) {
  const resultString = JSON.stringify(result === undefined ? null : result);
  const encodedResult = textEncoder.encode(resultString);

  if (encodedResult.length > dataView.buffer.byteLength) {
    throw new Error('Result exceeds shared buffer size');
  }

  dataView.set(encodedResult);
  Atomics.store(control, CONTROL_INDICES.DATA_SIZE, encodedResult.length);
  Atomics.store(control, CONTROL_INDICES.IS_ERROR, 0);
}

function writeError(error) {
  const message = error?.message || (typeof error === 'string' ? error : JSON.stringify(error) || 'Unknown error');
  const stack = error?.stack || new Error().stack;
  console.error('[gas-fakes worker error details]:', message, stack);
  const errorString = JSON.stringify({ message, stack });
  const encodedError = textEncoder.encode(errorString);
  
  dataView.set(encodedError);
  Atomics.store(control, CONTROL_INDICES.DATA_SIZE, encodedError.length);
  Atomics.store(control, CONTROL_INDICES.IS_ERROR, 1);
}

run();
