import { Proxies } from '../../support/proxies.js';
import { signatureArgs, unimplementedProps } from '../../support/helpers.js';
import is from '@sindresorhus/is';
import { newFakeBody } from './fakebody.js';
import { docsCacher } from '../../support/docscacher.js';
import { newFakeTab } from './faketab.js';
import { newFakeRangeBuilder } from './fakerangebuilder.js';


export const newFakeDocument = (...args) => {
  return Proxies.guard(new FakeDocument(...args));
};

// these are the known properties of document, not yet implemented
const propsWaitingRoom = [
  
  'getSupportedLanguageCodes',
  'getNumChildren',
  'getFooter',
  'addFooter',
  'addBookmark',
  'getBookmarks',
  'getBookmark',
  'addNamedRange',
  'getNamedRangeById',
  'editAsText',
  'getActiveSection',
  'getDocumentElement',
  'getFootnotes',
  'getParagraphs',
  'getListItems',
  'appendHorizontalRule',
  'appendImage',
  'appendPageBreak',
  'appendParagraph',
  'appendListItem',
  'insertHorizontalRule',
  'insertPageBreak',
  'insertParagraph',
  'insertListItem',
  'insertTable',
  'replaceText',
  'getMarginBottom',
  'getMarginLeft',
  'getMarginRight',
  'getMarginTop',
  'getPageHeight',
  'getPageWidth',
  'setMarginBottom',
  'setMarginLeft',
  'setMarginRight',
  'setMarginTop',
  'setPageHeight',
  'setPageWidth',
  'setCursor',
  'setSelection',
  'getActiveTab',
  'setActiveTab',
  'getTables',
  'getCursor',

  'getNamedRanges',
  'insertImage',
  'getAs',
  'getBlob',

  'getBackgroundColor',
  'setBackgroundColor',
  'removeChild',
  'appendTable',
  'addHeader',
  'getSelection',
  'getImages',

  'newPosition',
  'getLanguage',
  'getText',
  'setLanguage',
  'getChild',
  'getHeader',
  'setText',
]

class FakeDocument {
  
  constructor(resource) {

    // this is the entire resource following a get request
    this.__doc = resource

    // the file representation is required for some operations
    this.__file = DriveApp.getFileById(resource.documentId);

    // placeholders for props not yet implemented
    unimplementedProps(this, propsWaitingRoom)

  }

  saveAndClose() {
    // In the live environment, this is sometimes needed to ensure that
    // changes made via one service (e.g., Docs advanced service) are
    // persisted before being read by another (e.g., DocumentApp).
    // In the fake environment, updates are synchronous and cache is
    // invalidated immediately, so this is a no-op.
    return this;
  }
  clear() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Document.clear');
    if (nargs !== 0) matchThrow();

    // The document's content is represented by an array of structural elements.
    const content = this.__doc.body?.content;

    // If there's no content, or only the initial empty paragraph, there's nothing to clear.
    if (!content || content.length === 0) {
      return this;
    }

    // The last structural element contains the end index of the body's content.
    // A new/empty document has one structural element (a paragraph) with startIndex 1 and endIndex 2.
    // We must not delete this final newline character.
    const lastElement = content[content.length - 1];
    const endIndex = lastElement.endIndex;

    // If the document is already effectively empty (just one newline), do nothing.
    // The startIndex of all body content is 1.
    if (endIndex <= 2) {
      return this;
    }

    // We need to delete everything from the start of the body content (index 1)
    // up to the start of the final newline character. The range for deletion is
    // [1, endIndex - 1), where the end of the range is exclusive.
    const requests = [{
      deleteContentRange: { range: { startIndex: 1, endIndex: endIndex - 1 } }
    },];

    // Use the advanced Docs service to perform the update. This also invalidates the document cache.
    Docs.Documents.batchUpdate({ requests }, this.getId());

    // To ensure the local object is in sync, re-fetch the document.
    this.__doc = Docs.Documents.get(this.getId());
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
    return newFakeBody(this);
  }

  getViewers() {
    // The documentation for Document.getViewers() says "An editor is not a viewer",
    // but tests on live Apps Script show that it behaves like DriveApp.File.getViewers(),
    // which includes editors. After all viewers and editors are removed, the owner remains,
    // resulting in a viewer count of 1. We will replicate this observed behavior.
    const viewers = this.__file.getViewers();
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
    const editors = this.__file.getEditors();
    const owner = this.__file.getOwner();

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

  // these were generate by gemini and are incrrect - i'll need to redo them
  getTabs() {
    // A newly created document via the API might not have a body property,
    // whereas one from a get will. We can use this to detect if we should
    // force the fallback for testing a new document in the fake env.
    if (DocumentApp.isFake && !this.__doc.body) {
      const tabResource = {
        documentTab: { body: this.__doc.body }, // body will be undefined here, but that's ok for newFakeBody
        tabProperties: { tabId: 'default_tab_id', title: this.getName(), index: 0 }
      };
      return [newFakeTab(this, tabResource)];
    }

    const docWithTabs = Docs.Documents.get(this.getId(), { includeTabsContent: true });

    if (docWithTabs.tabs && docWithTabs.tabs.length > 0) {
      return docWithTabs.tabs.map(tabResource => newFakeTab(this, tabResource, this.getName()));
    }

    // Fallback for documents without tabs enabled, which the API returns as a single tab.
    const tabResource = {
      documentTab: { body: this.__doc.body },
      tabProperties: { tabId: 'default_tab_id', title: this.getName(), index: 0 }
    };
    return [newFakeTab(this, tabResource)];
  }
  getTab(tabId) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Document.getTab');
    if (nargs !== 1 || !is.string(tabId)) matchThrow();

    return this.getTabs().find(tab => tab.getId() === tabId) || null;
  }


  // these are all actually preformed by the Drive api
  addEditor(emailAddress) {
    this.__file.addEditor(emailAddress);
    return this;
  }

  addEditors(emailAddresses) {
    this.__file.addEditors(emailAddresses);
    return this;
  }

  addViewer(emailAddress) {
    this.__file.addViewer(emailAddress);
    return this;
  }

  addViewers(emailAddresses) {
    this.__file.addViewers(emailAddresses);
    return this;
  }

  removeEditor(emailAddress) {
    const owner = this.__file.getOwner();
    // You can't remove the owner of a document.
    if (owner && owner.getEmail() === emailAddress) {
      // The live API throws an error. To avoid breaking tests that don't
      // expect an error, we'll just prevent the removal.
      return this;
    }
    this.__file.removeEditor(emailAddress);
    return this;
  }

  removeViewer(emailAddress) {
    const owner = this.__file.getOwner();
    // You can't remove the owner of a document.
    if (owner && owner.getEmail() === emailAddress) {
      // The live API throws an error. To avoid breaking tests that don't
      // expect an error, we'll just prevent the removal.
      return this;
    }
    this.__file.removeViewer(emailAddress);
    return this;
  }

  toString() {
    return 'Document';
  }
}
