
import { FakeHtmlOutput } from './htmloutput.js';
import { FakeHtmlTemplate } from './htmltemplate.js';
import { FakeGoogleScriptRun } from './googlescriptrun.js';
import fs from 'fs';
import path from 'path';

import { startServer } from './webapp.js';

// Initialize google.script globals
if (typeof globalThis.google === 'undefined') {
  globalThis.google = {
    script: {
      run: new FakeGoogleScriptRun(),
      host: {
        close: () => {},
        setHeight: () => {},
        setWidth: () => {},
        origin: ''
      },
      history: {
        push: () => {},
        replace: () => {},
        setChangeHandler: () => {}
      }
    }
  };
}

export class FakeHtmlService {
  constructor() {
    this.SandboxMode = {
      EMULATED: 'EMULATED',
      IFRAME: 'IFRAME',
      NATIVE: 'NATIVE'
    };
    this.XFrameOptionsMode = {
      ALLOWALL: 'ALLOWALL',
      DEFAULT: 'DEFAULT'
    };
  }

  _readLocalFile(filename) {
    // In live Apps Script, `HtmlService.createHtmlOutputFromFile('Index')`
    // implicitly looks for an `Index.html` file in the project.
    let targetFile = filename;
    if (!targetFile.endsWith('.html')) {
        targetFile += '.html';
    }

    // Resolve relative to the consumer's main script
    const mainScriptPath = process.argv[1];
    if (!mainScriptPath) {
        throw new Error("Could not determine project root. Ensure process.argv[1] is set.");
    }
    
    const projectDir = path.dirname(mainScriptPath);
    const fullPath = path.resolve(projectDir, targetFile);

    if (!fs.existsSync(fullPath)) {
        throw new Error(`No HTML file named ${filename} was found.`);
    }

    return fs.readFileSync(fullPath, 'utf8');
  }

  createHtmlOutput(html = '') {
    return new FakeHtmlOutput(html);
  }

  createHtmlOutputFromFile(filename) {
    const content = this._readLocalFile(filename);
    return new FakeHtmlOutput(content);
  }

  createTemplate(html = '') {
    return new FakeHtmlTemplate(html);
  }

  createTemplateFromFile(filename) {
    const content = this._readLocalFile(filename);
    return new FakeHtmlTemplate(content);
  }

  __startWebApp(port = 3000) {
    return startServer(port);
  }
}

export const newFakeHtmlService = () => new FakeHtmlService();
