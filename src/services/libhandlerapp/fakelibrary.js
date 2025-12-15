import { Proxies } from '../../support/proxies.js';
import { parse } from 'acorn';

export const newFakeLibrary = (...args) => {
  return Proxies.guard(new FakeLibrary(...args));
};

// to keep the same pattern as other apps script services, we'll use the worker to async/sync
// the starting point is the current manifest (or another manifest if specified)
class FakeLibrary {
  constructor(libraryOb) {
    this.__libraryOb = libraryOb;
    if (!this.__libraryOb) {
      throw new Error('library not provided');
    }
    this.__content = null;
    this.__libContent = null;
    this.__manifest = null;
  }
  get libraryOb() {
    return this.__libraryOb;
  }
  get version() {
    return this.__libraryOb.version;
  }
  get userSymbol() {
    return this.__libraryOb.userSymbol;
  }
  get libraryId() {
    if (!this.__libraryOb.libraryId) {
      throw new Error(`libraryId not found in library ${JSON.stringify(this.__libraryOb)}`);
    }
    return this.__libraryOb.libraryId;
  }
  get libContent() {
    if (!this.__libContent) {
      this.__allowSandboxAccess();
      const data = Drive.Files.export(
        this.libraryId,
        'application/vnd.google-apps.script+json',
      );
      if (!data) {
        throw new Error(`Library ${this.libraryId} not found`);
      }
      this.__libContent = JSON.parse(Utilities.newBlob(data).getDataAsString())
    }
    return this.__libContent
  }
  __allowSandboxAccess() {
    if (ScriptApp.__behavior?.sandboxMode) {
      ScriptApp.__behavior.addWhitelistedFile(this.libraryId);
    }
  }

  get combinedJs() {
    return this.libContent.files.filter((f) => f.type === 'server_js').map((f) => `////-- ${f.name} --\n${f.source}`).join(`\n\n`)
  }

  get content() {
    if (!this.__content) {
      const libContent = this.libContent;
      this.__content = {
        ...this.__libraryOb,
        ...libContent,
        serverJs: this.serverJs,
        manifest: this.manifest,
        libraries: this.libraries,
        combinedJs: this.combinedJs
      }
    }
    return this.__content
  }
  get wrapper() {
    const ast = parse(this.combinedJs, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      allowReserved: true
    });
    const getBody = (ast, type) => {
      return (ast.type === 'Program' ? ast.body.filter(f => f.type === type) : [])
    }
    const makeExports = (ast, type, accessor) => getBody(ast, type).map((f) => accessor(f))
    const functions = makeExports(ast, 'FunctionDeclaration', (f) => f.id.name)
    const variables = makeExports(ast, 'VariableDeclaration', (f) => f.declarations[0].id.name)
    const classes = makeExports(ast, 'ClassDeclaration', (f) => f.id.name)
    const exports = [...functions, ...variables, ...classes];
    return `${this.combinedJs};\nreturn { ${exports.join(', ')} };`;
  }

  inject() {
    if (!this.wrapper) {
      throw new Error('wrapper not loaded');
    }
    globalThis[this.userSymbol] = (new Function(this.wrapper))()
    return this
  }

  get manifest() {
    if (!this.__manifest) {
      const t = this.libContent?.files?.find((f) => f.type === 'json' && f.name === 'appsscript')
      if (!t) {
        throw new Error(`manifest not found in library ${this.libraryId}`)
      }
      this.__manifest = JSON.parse(t.source)
    }
    return this.__manifest
  }
  get serverJs() {
    return this.libContent?.files?.filter((f) => f.type === 'server_js')
  }
  get libraries() {
    return this.manifest?.dependencies?.libraries || null;
  }
  toString() {
    return 'Library';
  }
}
