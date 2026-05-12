
import { FakeHtmlOutput } from './htmloutput.js';
import { ServerWorkerContext } from './serverworker.js';

export class FakeHtmlTemplate {
  constructor(content = '') {
    this._content = content;
    
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        return target[prop];
      },
      set: (target, prop, value, receiver) => {
        return Reflect.set(target, prop, value, receiver);
      }
    });
  }

  evaluate() {
    let evaluatedContent = this._content;

    let workerResult = null;
    try {
      const ctx = new ServerWorkerContext();
      // This will synchronously block the main thread, spawn a worker,
      // load the consumer's module, resolve variables, and return.
      workerResult = ctx.evaluateTemplate(this._content);
    } catch (e) {
      // Ignore worker failures (e.g., during some unit test setups where process.argv[1] is invalid)
    }

    if (workerResult) {
       // If the worker successfully evaluated the template against the consumer context, use it.
       // However, we still need to allow template properties (e.g. template.foo = 'bar') 
       // to override global context, so we do a final pass.
       evaluatedContent = workerResult;
    }

    // Final pass for explicitly set template properties
    evaluatedContent = evaluatedContent.replace(/<\?=\s*([^?]+)\s*\?>/g, (match, varName) => {
      const trimmedVarName = varName.trim();
      if (typeof this[trimmedVarName] !== 'undefined') {
        return this[trimmedVarName];
      }
      return match; 
    });

    return new FakeHtmlOutput(evaluatedContent);
  }

  getRawContent() {
    return this._content;
  }

  getCode() {
    return `// Compiled template\n(function() { let output = ""; ${this._content.split('\n').map(line => `output += ${JSON.stringify(line)} + "\\n";`).join('\n')} return output; })()`;
  }

  getCodeWithComments() {
    return `// Compiled template with comments\n(function() { let output = ""; ${this._content.split('\n').map(line => `// ${line}\noutput += ${JSON.stringify(line)} + "\\n";`).join('\n')} return output; })()`;
  }
}


