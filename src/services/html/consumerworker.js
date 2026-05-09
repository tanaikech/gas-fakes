import fs from 'fs';
import path from 'path';
import { parse } from 'acorn';
import vm from 'vm';
import { workerData } from 'worker_threads';

const { mainScriptPath, funcName, args, isTemplate, templateString } = workerData;
const control = new Int32Array(workerData.controlBuf);
const dataView = new Uint8Array(workerData.dataBuf);
const textEncoder = new TextEncoder();

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
        ...globalThis, 
        console, 
        setTimeout, 
        clearTimeout,
        setInterval,
        clearInterval
    };
    sandbox.globalThis = sandbox;

    // Prevent Recursion: Intercept google.script.run inside the sandbox
    // When the consumer's code executes in the sandbox, their call to `testHtml()`
    // will trigger these mock objects instead of spawning more workers.
    const dummyProxy = new Proxy({}, { get: () => () => dummyProxy });
    sandbox.google = { script: { run: dummyProxy } };
    sandbox.HtmlService = {
      createTemplate: () => ({ evaluate: () => ({ getContent: () => '' }) }),
      createHtmlOutput: () => ({ getContent: () => '', setTitle: () => ({}) })
    };

    // 4. Resolve Imports into the Sandbox
    const scriptDir = path.dirname(mainScriptPath);
    for (const imp of importsToResolve) {
      let importPath = imp.sourcePath;
      if (importPath.startsWith('.')) {
        importPath = path.resolve(scriptDir, importPath);
      }
      
      const importedModule = await import(importPath);

      for (const spec of imp.specifiers) {
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
    vm.runInContext(modifiedSource, context);

    const availableContext = context.__extractedGasContext || {};
    let result;

    // 6. Perform Requested Task
    if (isTemplate) {
      result = templateString.replace(/<\?=\s*([^?]+)\s*\?>/g, (match, varName) => {
        const trimmedVarName = varName.trim();
        if (typeof availableContext[trimmedVarName] !== 'undefined') {
          return availableContext[trimmedVarName];
        }
        return match;
      });
    } else {
      const func = availableContext[funcName];
      if (typeof func !== 'function') {
        throw new Error(`google.script.run: function "${funcName}" is not defined on the server.`);
      }
      
      const rawResult = await func(...(args || []));
      result = typeof rawResult === 'undefined' ? undefined : JSON.parse(JSON.stringify(rawResult));
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
