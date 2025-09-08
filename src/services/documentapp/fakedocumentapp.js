import { Proxies } from '../../support/proxies.js';
import { newFakeDocument } from './fakedocument.js';

import { signatureArgs } from '../../support/helpers.js';
import is from '@sindresorhus/is';
import { newFakeUi } from './fakeui.js';
import { Auth } from '../../support/auth.js';
import * as Enums from '../enums/docsenums.js'
export const newFakeDocumentApp = (...args) => {
  return Proxies.guard(new FakeDocumentApp(...args));
};


class FakeDocumentApp {
  constructor() {
   const enumProps = [
      "Attribute",
      "ElementType",
      "FontFamily",
      "GlyphType",
      "HorizontalAlignment",
      "ParagraphHeading",
      "PositionedLayout",
      "TabType",
      "TextAlignment",
      "VerticalAlignment"
    ]

    // import all known enums as props of documentapp
    enumProps.forEach(f => {
      this[f] = Enums[f]
    })
  }

  create(name) {
    const { nargs, matchThrow } = signatureArgs(arguments, "DocumentApp.create");
    if (nargs !== 1 || !is.string(name)) matchThrow();
 
    // 1. Create the document via the API. The API only uses the title.
    const resource = {
      title: name,
    };
    const doc = Docs.Documents.create(resource);
    const docId = doc.documentId;
    ScriptApp.__behavior.addFile(docId);
 
    // 2. The API creates a document with its own defaults. We need to adjust it
    // to match the defaults of a document created by the live Apps Script environment.
    // The body content from the API (a section break and a paragraph) is already
    // correct, so we only need to enforce the documentStyle.
    const requests = [{
      updateDocumentStyle: {
        documentStyle: {
          pageNumberStart: 1,
          marginHeader: { magnitude: 36, unit: 'PT' },
          marginFooter: { magnitude: 36, unit: 'PT' },
          marginTop: { magnitude: 72, unit: 'PT' },
          marginBottom: { magnitude: 72, unit: 'PT' },
          marginRight: { magnitude: 72, unit: 'PT' },
          marginLeft: { magnitude: 72, unit: 'PT' },
        },
        // We only specify fields that are part of the standard Apps Script default.
        // Page size is left to the API's default, which may be locale-dependent.
        fields: 'pageNumberStart,marginHeader,marginFooter,marginTop,marginBottom,marginRight,marginLeft'
      }
    }];
 
    // Apply the style updates.
    Docs.Documents.batchUpdate({ requests }, docId);
 
    // 3. Return the new FakeDocument instance.
    return newFakeDocument(docId);
  }

  openById(id) {
    const { nargs, matchThrow } = signatureArgs(arguments, "DocumentApp.openById");
    if (nargs !== 1 || !is.string(id)) matchThrow();

    if (!ScriptApp.__behavior.isAccessible(id, 'DocumentApp')) {
      throw new Error(`Access to document "${id}" is denied by sandbox rules.`);
    }

    return newFakeDocument(id);
  }

  openByUrl(url) {
    const { nargs, matchThrow } = signatureArgs(arguments, "DocumentApp.openByUrl");
    if (nargs !== 1 || !is.string(url)) matchThrow();
    const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    if (!match || !match[1]) {
      throw new Error(`Invalid document URL: ${url}`);
    }
    return this.openById(match[1]);
  }

  getActiveDocument() {
    const documentId = Auth.getDocumentId();
    if (!documentId) return null;
    return this.openById(documentId);
  }
  getUi () {
    return newFakeUi();
  }
  toString() {
    return 'DocumentApp';
  }

}