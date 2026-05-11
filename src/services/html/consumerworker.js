import fs from 'fs';
import path from 'path';
import { parse } from 'acorn';
import vm from 'vm';
import { workerData } from 'worker_threads';

const { mainScriptPath, funcName, args, isTemplate, templateString } = workerData;
const control = new Int32Array(workerData.controlBuf);
const dataView = new Uint8Array(workerData.dataBuf);
const textEncoder = new TextEncoder();

await import('../../../main.js');

const CONTROL_INDICES = {
  STATUS: 0,
  DATA_SIZE: 1,
  IS_ERROR: 2
};

async function run() {
  try {
    const source = fs.readFileSync(mainScriptPath, 'utf8');
    const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module' });

    const importsToResolve = [];
    const exportIdentifiers = new Set();
    const replacements = [];

    // 1. Analyze AST to find Imports, Exports, and Declarations
    for (const node of ast.body) {
      if (node.type === 'ImportDeclaration') {
        const sourcePath = node.source.value;
        const specifiers = node.specifiers;
        importsToResolve.push({ sourcePath, specifiers });
        replacements.push({ start: node.start, end: node.end });
      } else if (node.type === 'ExportNamedDeclaration') {
        if (node.declaration) {
          // Remove the "export " keyword
          replacements.push({ start: node.start, end: node.declaration.start });
          
          if (node.declaration.type === 'FunctionDeclaration' || node.declaration.type === 'ClassDeclaration') {
            exportIdentifiers.add(node.declaration.id.name);
          } else if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach(d => {
              if (d.id.type === 'Identifier') exportIdentifiers.add(d.id.name);
            });
          }
        } else {
          // e.g. export { x, y }
          replacements.push({ start: node.start, end: node.end });
        }
      } else if (node.type === 'ExportDefaultDeclaration') {
          // Replace "export default " with "const __defaultExport = "
          replacements.push({ start: node.start, end: node.declaration.start, replaceWith: 'const __defaultExport = ' });
          exportIdentifiers.add('__defaultExport');
      } else if (node.type === 'VariableDeclaration') {
        node.declarations.forEach(d => {
          if (d.id.type === 'Identifier') exportIdentifiers.add(d.id.name);
        });
      } else if (node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') {
        exportIdentifiers.add(node.id.name);
      } else if (node.type === 'ExpressionStatement' && 
                 node.expression.type === 'AssignmentExpression' && 
                 node.expression.left.type === 'MemberExpression' &&
                 node.expression.left.object.type === 'Identifier' && 
                 node.expression.left.object.name === 'globalThis' &&
                 node.expression.left.property.type === 'Identifier') {
        exportIdentifiers.add(node.expression.left.property.name);
      }
    }

    // 2. Rewrite the source code
    let modifiedSource = source;
    // Sort replacements from end to start so indices remain valid
    replacements.sort((a, b) => b.start - a.start);
    for (const rep of replacements) {
      const length = rep.end - rep.start;
      const replacementText = rep.replaceWith !== undefined ? rep.replaceWith : ' '.repeat(length);
      modifiedSource = modifiedSource.substring(0, rep.start) + replacementText + modifiedSource.substring(rep.end);
    }

    // Append code to gather all extracted top-level identifiers into an object we can read
    const idents = Array.from(exportIdentifiers);
    modifiedSource += `\n; globalThis.__extractedGasContext = { ${idents.map(id => `"${id}": typeof ${id} !== 'undefined' ? ${id} : undefined`).join(', ')} };`;

    // 3. Prepare the sandbox
    const sandbox = { 
        console, 
        setTimeout, 
        clearTimeout,
        setInterval,
        clearInterval
    };
    
    // Copy GAS globals populated by main.js into the sandbox
    for (const key of Object.getOwnPropertyNames(globalThis)) {
      if (key !== 'global' && key !== 'GLOBAL' && key !== 'root' && key !== 'console' && key !== 'setTimeout' && key !== 'clearTimeout' && key !== 'setInterval' && key !== 'clearInterval' && key !== 'HtmlService' && key !== 'google') {
         const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
         if (descriptor) {
             try {
                 descriptor.configurable = true;
                 // If it has a value, make it writable too so VM code can reassign if needed
                 if ('value' in descriptor) {
                     descriptor.writable = true;
                 }
                 Object.defineProperty(sandbox, key, descriptor);
             } catch (e) {
                 throw new Error("Failed defining " + key + ": " + e.message);
             }
         } else {
             sandbox[key] = globalThis[key];
         }
      }
    }

    sandbox.globalThis = sandbox;
    sandbox.__isGasFakesServerContext = true;

    // Prevent Recursion: Intercept google.script.run inside the sandbox
    // When the consumer's code executes in the sandbox, their call to `testHtml()`
    // will trigger these mock objects instead of spawning more workers.
    const dummyProxy = new Proxy(function() {}, { 
      get: () => dummyProxy,
      apply: () => dummyProxy
    });
    
    Object.defineProperty(sandbox, 'google', {
      value: { script: { run: dummyProxy } },
      writable: true,
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(sandbox, 'HtmlService', {
      value: {
        createTemplate: (html) => ({ evaluate: () => ({ getContent: () => html, getTitle: () => '', __isHtmlOutput: true }) }),
        createHtmlOutput: (html) => {
           let content = html;
           let title = '';
           return { 
               getContent: () => content, 
               setTitle: (t) => { title = t; return this; }, 
               getTitle: () => title,
               __isHtmlOutput: true 
           };
        },
        createHtmlOutputFromFile: (filename) => {
            // Very basic stub, real file loading should happen in main script if needed
            return {
               getContent: () => '<!-- Stub loaded from ' + filename + ' -->', 
               setTitle: () => ({}), 
               getTitle: () => '',
               __isHtmlOutput: true 
            };
        },
        createTemplateFromFile: (filename) => {
            return { evaluate: () => ({ getContent: () => '<!-- Stub loaded from ' + filename + ' -->', getTitle: () => '', __isHtmlOutput: true }) };
        },
        __startWebApp: dummyProxy
      },
      writable: true,
      configurable: true,
      enumerable: true
    });

    // 4. Resolve Imports into the Sandbox
    const scriptDir = path.dirname(mainScriptPath);
    for (const imp of importsToResolve) {
      let importPath = imp.sourcePath;
      if (importPath.startsWith('.')) {
        importPath = path.resolve(scriptDir, importPath);
      }
      
      const importedModule = await import(importPath);

      for (const spec of imp.specifiers) {
        if (importPath.includes('webapp.js') && spec.imported?.name === 'startServer') {
            sandbox[spec.local.name] = dummyProxy;
            continue;
        }

        if (spec.type === 'ImportDefaultSpecifier') {
          sandbox[spec.local.name] = importedModule.default;
        } else if (spec.type === 'ImportNamespaceSpecifier') {
          sandbox[spec.local.name] = importedModule;
        } else if (spec.type === 'ImportSpecifier') {
          sandbox[spec.local.name] = importedModule[spec.imported.name];
        }
      }
    }

    // 5. Execute Code in Sandbox
    const context = vm.createContext(sandbox);
    try {
      vm.runInContext(modifiedSource, context);
    } catch (e) {
      throw new Error("Error in vm.runInContext: " + e.message + "\nStack: " + e.stack);
    }

    const availableContext = context.__extractedGasContext || {};
    let result;

    // 6. Perform Requested Task
    if (isTemplate) {
      result = templateString.replace(/<\?=\s*([^?]+)\s*\?>/g, (match, varName) => {
        const trimmedVarName = varName.trim();
        if (typeof availableContext[trimmedVarName] !== 'undefined') {
          return availableContext[trimmedVarName];
        }
        if (typeof context[trimmedVarName] !== 'undefined') {
          return context[trimmedVarName];
        }
        return match;
      });
    } else {
      let func = availableContext[funcName];
      if (typeof func !== 'function') {
        func = context[funcName];
      }
      if (typeof func !== 'function') {
        throw new Error(`google.script.run: function "${funcName}" is not defined on the server.`);
      }
      
      // Re-hydrate doPost event object with missing Apps Script methods
      if (funcName === 'doPost' && args && args[0] && args[0].postData) {
         args[0].postData.getDataAsString = function() { return this.contents; };
      }

      const rawResult = await func(...(args || []));
      
      // If the function returns a FakeHtmlOutput or FakeTextOutput object, serialize it
      if (rawResult && typeof rawResult.getContent === 'function') {
        result = {
          __isHtmlOutput: !!rawResult.__isHtmlOutput,
          __isTextOutput: !!rawResult.__isTextOutput,
          content: rawResult.getContent(),
          title: typeof rawResult.getTitle === 'function' ? rawResult.getTitle() : '',
          mimeType: typeof rawResult.getMimeType === 'function' ? rawResult.getMimeType() : null
        };
      } else {
        result = typeof rawResult === 'undefined' ? undefined : JSON.parse(JSON.stringify(rawResult));
      }
    }

    writeResult(result);
  } catch (error) {
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
  const errorString = JSON.stringify({ message: error.message, stack: error.stack });
  const encodedError = textEncoder.encode(errorString);
  
  dataView.set(encodedError);
  Atomics.store(control, CONTROL_INDICES.DATA_SIZE, encodedError.length);
  Atomics.store(control, CONTROL_INDICES.IS_ERROR, 1);
}

run();
