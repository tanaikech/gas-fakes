
import { FakeHtmlOutput } from './htmloutput.js';
import { FakeHtmlTemplate } from './htmltemplate.js';
import { FakeGoogleScriptRun } from './googlescriptrun.js';

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

  createHtmlOutput(html = '') {
    return new FakeHtmlOutput(html);
  }

  createHtmlOutputFromFile(filename) {
    // Basic implementation: in a real environment this would read the file.
    // In gas-fakes, we might want to look for files in the current directory or a configured path.
    return new FakeHtmlOutput(`<!-- content of ${filename} -->`);
  }

  createTemplate(html = '') {
    return new FakeHtmlTemplate(html);
  }

  createTemplateFromFile(filename) {
    return new FakeHtmlTemplate(`<!-- template content of ${filename} -->`);
  }
}

export const newFakeHtmlService = () => new FakeHtmlService();
