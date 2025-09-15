import { Proxies } from '../../support/proxies.js';
import { newFakeDocument } from './fakedocument.js';

import { signatureArgs } from '../../support/helpers.js';
import is from '@sindresorhus/is';
import { newFakeUi } from './fakeui.js';
import { Auth } from '../../support/auth.js';
import * as Enums from '../enums/docsenums.js'
import { defaultDocumentStyleRequests } from './elementblasters.js';

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

    // Apply the style updates.
    Docs.Documents.batchUpdate({ requests: defaultDocumentStyleRequests() }, docId);
 
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
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
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
