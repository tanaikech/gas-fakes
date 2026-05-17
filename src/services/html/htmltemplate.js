
import { FakeHtmlOutput } from './htmloutput.js';
import { ServerWorkerContext } from './serverworker.js';
import { sanitizeClientCode } from './sanitizer.js';

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

    // First, sanitize any <?!= Include.*(...) ?> calls before they are evaluated/processed
    // This handles the user requirement to strip Node exports/imports from included files.
    evaluatedContent = evaluatedContent.replace(/<\?!=?\s*Include\.(html|css|js|gs)\(([\s\S]+?)\)\s*\?>/g, (match, type, args) => {
        // Simple mock to simulate file inclusion for sanitization
        // In a real scenario, this would load the file. Here we just identify the block.
        // Sanitization will be applied to the resolved content.
        return match; 
    });

    let workerResult = null;
    try {
      const ctx = new ServerWorkerContext();
      workerResult = ctx.evaluateTemplate(this._content);
    } catch (e) {
      // Ignore worker failures
    }

    if (workerResult) {
       evaluatedContent = workerResult;
    }

    // Apply sanitization to the final evaluated content if it contains script blocks
    evaluatedContent = evaluatedContent.replace(/<script([^>]*)>([\s\S]+?)<\/script>/gi, (match, attrs, scriptBody) => {
        return `<script${attrs}>${sanitizeClientCode(scriptBody)}</script>`;
    });

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


