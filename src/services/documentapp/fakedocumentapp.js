import { Proxies } from '../../support/proxies.js';
import { newFakeDocument } from './fakedocument.js';
import { newFakeDocumentBase } from './fakedocumentbase.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';
import is from '@sindresorhus/is';
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

    const resource = {
      title: name,
    };
    const doc = Docs.Documents.create(resource);
    return newFakeDocument(newFakeDocumentBase(doc.documentId));
  }

  openById(id) {
    const { nargs, matchThrow } = signatureArgs(arguments, "DocumentApp.openById");
    if (nargs !== 1 || !is.string(id)) matchThrow();
    return newFakeDocument(newFakeDocumentBase(id));
  }

  openByUrl(url) {
    const { nargs, matchThrow } = signatureArgs(arguments, "DocumentApp.openByUrl");
    if (nargs !== 1 || !is.string(url)) matchThrow();
    const id = url.match(/\/d\/(.+?)\//)[1];
    if (!id) throw new Error("Invalid document URL");
    return this.openById(id);
  }

  getActiveDocument() {
    const documentId = Auth.getDocumentId();
    if (!documentId) return null;
    return this.openById(documentId);
  }
  getUi () {
    return notYetImplemented ('DocumentApp.getUi')
  }
  toString() {
    return 'DocumentApp';
  }

}