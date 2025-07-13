import { Proxies } from '../../support/proxies.js';
import { newFakeDocument } from './fakedocument.js';
import { signatureArgs } from '../../support/helpers.js';
import is from '@sindresorhus/is';
import { Auth } from '../../support/auth.js';

export const newFakeDocumentApp = (...args) => {
  return Proxies.guard(new FakeDocumentApp(...args));
};

class FakeDocumentApp {
  constructor() {
    // any enums would go here
  }

  create(name) {
    const { nargs, matchThrow } = signatureArgs(arguments, "DocumentApp.create");
    if (nargs !== 1 || !is.string(name)) matchThrow();

    const resource = {
      title: name,
    };
    const doc = Docs.Documents.create(resource);
    return newFakeDocument(doc);
  }

  openById(id) {
    const { nargs, matchThrow } = signatureArgs(arguments, "DocumentApp.openById");
    if (nargs !== 1 || !is.string(id)) matchThrow();
    const doc = Docs.Documents.get(id);
    return newFakeDocument(doc);
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

  toString() {
    return 'DocumentApp';
  }
}