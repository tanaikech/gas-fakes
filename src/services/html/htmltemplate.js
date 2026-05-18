
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
      workerResult = ctx.evaluateTemplate(this._content);
    } catch (e) {
      console.error(e);
      throw e;
    }

    if (workerResult) {
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


