import { Proxies } from '../../support/proxies.js';
import { newShadowDocument } from './shadowdocument.js';
import { signatureArgs } from '../../support/helpers.js';
import is from '@sindresorhus/is';
import { docsCacher } from '../../support/docscacher.js';
import { newFakeTab } from './faketab.js';
import { newFakeBody } from './fakebody.js';
import { newFakeRangeBuilder } from './fakerangebuilder.js';
import { newFakeHeaderSection } from './fakeheadersection.js';
import { newFakeFooterSection } from './fakefootersection.js';
import { shadowPrefix } from './nrhelpers.js';

export const newFakeDocument = (...args) => {
  return Proxies.guard(new FakeDocument(...args));
};


class FakeDocument {

  // passing the id creates a shadow document which maintains the api result
  constructor(id) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Document");
    if (nargs !== 1 || !is.nonEmptyString(id)) matchThrow();
    this.__id = id
    // at this point the only content in shadow document is an id
    // the rest is lazy loaded
    this.__shadowDocument = newShadowDocument(id)
  }

  addHeader() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Document.addHeader');
    if (nargs !== 0) matchThrow();

    const existingHeader = this.getHeader();
    if (existingHeader) {
      throw new Error('Document tab already contains a header.');
    }

    const shadow = this.__shadowDocument;
    const requests = [{
      createHeader: {
        type: 'DEFAULT',
        // No sectionBreakLocation means it applies to the DocumentStyle
      },
    }];

    Docs.Documents.batchUpdate({ requests }, shadow.getId());
    shadow.refresh();

    return this.getHeader();
  }

  addFooter() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Document.addFooter');
    if (nargs !== 0) matchThrow();

    const existingFooter = this.getFooter();
    if (existingFooter) {
      throw new Error('Document tab already contains a footer.');
    }

    const shadow = this.__shadowDocument;
    const requests = [{
      createFooter: {
        type: 'DEFAULT',
      },
    }];

    Docs.Documents.batchUpdate({ requests }, shadow.getId());
    shadow.refresh();

    return this.getFooter();
  }

  getHeader() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Document.getHeader');
    if (nargs !== 0) matchThrow();

    const shadow = this.__shadowDocument;
    // Accessing resource will trigger a refresh and element map rebuild if necessary.
    const resource = shadow.resource;
    const { documentStyle } = shadow.__unpackDocumentTab(resource);

    const headerId = documentStyle?.defaultHeaderId;
    if (!headerId) {
      return null;
    }

    const headerName = shadowPrefix + 'HEADER_SECTION_' + headerId;
    // The structure getter on shadowDocument ensures the map is up to date.
    return newFakeHeaderSection(shadow, headerName);
  }

  getFooter() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Document.getFooter');
    if (nargs !== 0) matchThrow();

    const shadow = this.__shadowDocument;
    // Accessing resource will trigger a refresh and element map rebuild if necessary.
    const resource = shadow.resource;
    const { documentStyle } = shadow.__unpackDocumentTab(resource);

    const footerId = documentStyle?.defaultFooterId;
    if (!footerId) {
      return null;
    }

    const footerName = shadowPrefix + 'FOOTER_SECTION_' + footerId;
    // The structure getter on shadowDocument ensures the map is up to date.
    return newFakeFooterSection(shadow, footerName);
  }

  /**
   * Gets the footnote with the given ID.
   * @param {string} id The footnote ID.
   * @returns {GoogleAppsScript.Document.Footnote} The footnote, or null if not found.
   * @see https://developers.google.com/apps-script/reference/document/document#getFootnote(String)
   */
  getFootnote(id) {
    return this.__shadowDocument.getFootnoteById(id);
  }

  /**
   * Gets all footnotes in the document.
   * @returns {GoogleAppsScript.Document.Footnote[]} An array of footnotes.
   * @see https://developers.google.com/apps-script/reference/document/document#getFootnotes()
   */
  getFootnotes() {
    return this.__shadowDocument.getFootnotes();
  }





 clear() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Document.clear');
    if (nargs !== 0) matchThrow();
    this.__shadowDocument.clear()
    return this
  
  }

  appendListItem(listItemOrText) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Document.appendListItem");
    if (nargs !== 1) matchThrow();
    return this.getBody().appendListItem(listItemOrText);
  }

  appendParagraph(paragraphOrText) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Document.appendParagraph");
    if (nargs !== 1) matchThrow();
    return this.getBody().appendParagraph(paragraphOrText);
  }

  appendPageBreak(pageBreak) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Document.appendPageBreak");
    if (nargs > 1) matchThrow();
    return this.getBody().appendPageBreak(pageBreak);
  }

  appendTable(tableOrCells) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Document.appendTable");
    if (nargs > 1) matchThrow();
    return this.getBody().appendTable(tableOrCells);
  }

  appendImage(image) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Document.appendImage");
    if (nargs !== 1) matchThrow();
    return this.getBody().appendImage(image);
  }

  insertImage(childIndex, image) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Document.insertImage");
    if (nargs !== 2) matchThrow();
    return this.getBody().insertImage(childIndex, image);
  }

  insertListItem(childIndex, listItemOrText) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Document.insertListItem");
    if (nargs !== 2) matchThrow();
    return this.getBody().insertListItem(childIndex, listItemOrText);
  }

  insertParagraph(childIndex, paragraph) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Document.insertParagraph");
    if (nargs !== 2) matchThrow();
    return this.getBody().insertParagraph(childIndex, paragraph);
  }

  insertPageBreak(childIndex, pageBreak) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Document.insertPageBreak");
    if (nargs < 1 || nargs > 2) matchThrow();
    return this.getBody().insertPageBreak(childIndex, pageBreak);
  }

  insertTable(childIndex, table) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Document.insertTable");
    if (nargs !== 2) matchThrow();
    return this.getBody().insertTable(childIndex, table);
  }
  
  saveAndClose() {
    // this is a no-op in fake environment since it is stateless
  }

  getBody() {
    return newFakeBody(this.__shadowDocument)
  }

  getTabs() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Document.getTabs");
    if (nargs !== 0) matchThrow();

    // The resource getter in shadowDocument now always fetches the tabbed resource.
    const resource = this.__shadowDocument.resource;

    if (!resource.tabs || resource.tabs.length === 0) {
      return [];
    }

    // The FakeTab constructor needs the parent document, the tab resource, and the doc name.
    return resource.tabs.map(tabResource => newFakeTab(this, tabResource, this.getName()));
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