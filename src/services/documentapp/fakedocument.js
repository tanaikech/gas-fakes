import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import is from '@sindresorhus/is';
import { newFakeBody } from './fakebody.js';
import { docsCacher } from '../../support/docscacher.js';

export const newFakeDocument = (...args) => {
  return Proxies.guard(new FakeDocument(...args));
};

class FakeDocument {
  constructor(docResource) {
    this.__doc = docResource;
    this.__file = DriveApp.getFileById(docResource.documentId);
  }

  addEditor(emailAddress) {
    this.__file.addEditor(emailAddress);
    return this;
  }

  addViewer(emailAddress) {
    this.__file.addViewer(emailAddress);
    return this;
  }

  removeEditor(emailAddress) {
    this.__file.removeEditor(emailAddress);
    return this;
  }

  removeViewer(emailAddress) {
    this.__file.removeViewer(emailAddress);
    return this;
  }

  getId() {
    return this.__doc.documentId;
  }

  getName() {
    // The file name in Drive is the source of truth for the document's name/title.
    // We use the file's name to avoid eventual consistency issues between Drive and Docs APIs.
    return this.__file.getName();
  }

  setName(name) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Document.setName");
    if (nargs !== 1 || !is.string(name)) matchThrow();

    // This updates the file name in Drive, which is the source of truth for the title.
    this.__file.setName(name);

    // Because the document might be cached by the Docs advanced service,
    // we need to invalidate it so the next `get` call fetches the updated title.
    docsCacher.clear(this.getId());

    // Update the in-memory object's title to reflect the change immediately.
    // This is for consistency, although getName() now gets the name from the Drive file.
    this.__doc.title = name;
    return this;
  }

  getBody() {
    return newFakeBody(this.__doc.body);
  }

  getViewers() {
    return this.__file.getViewers();
  }

  getEditors() {
    return this.__file.getEditors();
  }

  getUrl() {
      return `https://docs.google.com/document/d/${this.getId()}/edit`;
  }

  toString() {
    return 'Document';
  }
}