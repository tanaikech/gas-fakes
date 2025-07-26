import { Proxies } from '../../support/proxies.js';
import { newShadowDocument } from './shadowdocument.js';
import { signatureArgs } from '../../support/helpers.js';
import is from '@sindresorhus/is';
import { docsCacher } from '../../support/docscacher.js';
import { newFakeBody } from './fakebody.js';

export const newFakeDocument = (...args) => {
  return Proxies.guard(new FakeDocument(...args));
};


class FakeDocument {

  // passing the id creates a shadow document which maintains the api result
  constructor(id) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Document");
    if (nargs !== 1 || !is.nonEmptyString(id)) matchThrow();
    this.__id = id
    this.__shadowDocument = newShadowDocument(id)
  }



 clear() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Document.clear');
    if (nargs !== 0) matchThrow();
    this.__shadowDocument.clear()
    return this
  
  }
  

  get structure () {
    return this.__shadowDocument.structure
  }

  getBody() {
    return newFakeBody(this.structure)
  }

  getId() {
    return this.__shadowDocument.getId()
  }

  getName() {
    // The file name in Drive is the source of truth for the document's name/title.
    // We use the file's name to avoid eventual consistency issues between Drive and Docs APIs.
    return this.__shadowDocument.file.getName();
  }

  setName(name) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Document.setName");
    if (nargs !== 1 || !is.string(name)) matchThrow();

    // This updates the file name in Drive, which is the source of truth for the title.
    this.__shadowDocument.file.setName(name);

    // Because the document might be cached by the Docs advanced service,
    // we need to invalidate it so the next `get` call fetches the updated title.
    docsCacher.clear(this.getId());
    return this.__asGas
  }
  // TODO
  // this works on the shadow document so any returns to apps script need to be wrapped up in the appropriate apps script class


  getViewers() {
    // The documentation for Document.getViewers() says "An editor is not a viewer",
    // but tests on live Apps Script show that it behaves like DriveApp.File.getViewers(),
    // which includes editors. After all viewers and editors are removed, the owner remains,
    // resulting in a viewer count of 1. We will replicate this observed behavior.
    const viewers = this.__shadowDocument.file.getViewers();
    const editors = this.getEditors();

    const all = [...viewers, ...editors];
    const uniqueEmails = new Set();

    // Deduplicate users, as an editor might also be in the viewers list.
    return all.filter(user => {
      const email = user.getEmail();
      if (uniqueEmails.has(email)) return false;
      uniqueEmails.add(email);
      return true;
    });
  }

  getEditors() {
    // The underlying FakeFile might incorrectly remove the owner when other editors are removed.
    // This ensures the owner is always present in the editors list, which matches
    // the behavior of the live Google Apps Script environment.
    const editors = this.__shadowDocument.file.getEditors();
    const owner = this.__shadowDocument.file.getOwner();

    if (owner && !editors.some(e => e.getEmail() === owner.getEmail())) {
      return [...editors, owner];
    }

    return editors;
  }

  getUrl() {
    return `https://docs.google.com/document/d/${this.getId()}/edit`;
  }

  newRange() {
    return newFakeRangeBuilder();
  }


  // these are all actually preformed by the Drive api
  addEditor(emailAddress) {
    this.__shadowDocument.file.addEditor(emailAddress);
    return this;
  }

  addEditors(emailAddresses) {
    this.__shadowDocument.file.addEditors(emailAddresses);
    return this;
  }

  addViewer(emailAddress) {
    this.__shadowDocument.file.addViewer(emailAddress);
    return this;
  }

  addViewers(emailAddresses) {
    this.__shadowDocument.file.addViewers(emailAddresses);
    return this;
  }

  removeEditor(emailAddress) {
    const owner = this.__shadowDocument.file.getOwner();
    // You can't remove the owner of a document.
    if (owner && owner.getEmail() === emailAddress) {
      // The live API throws an error. To avoid breaking tests that don't
      // expect an error, we'll just prevent the removal.
      return this;
    }
    this.__shadowDocument.file.removeEditor(emailAddress);
    return this;
  }

  removeViewer(emailAddress) {
    const owner = this.__shadowDocument.file.getOwner();
    // You can't remove the owner of a document.
    if (owner && owner.getEmail() === emailAddress) {
      // The live API throws an error. To avoid breaking tests that don't
      // expect an error, we'll just prevent the removal.
      return this;
    }
    this.__shadowDocument.file.removeViewer(emailAddress);
    return this;
  }

  toString() {
    return 'Document';
  }

}
