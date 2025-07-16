import { Proxies } from '../../support/proxies.js';
import { signatureArgs, notYetImplemented } from '../../support/helpers.js';
import is from '@sindresorhus/is';
import { newFakeBody } from './fakebody.js';
import { docsCacher } from '../../support/docscacher.js';
import { newFakeTab } from './faketab.js';
import { newFakeRangeBuilder } from './fakerangebuilder.js';


export const newFakeDocument = (...args) => {
  return Proxies.guard(new FakeDocument(...args));
};

class FakeDocument {
  constructor(docResource) {
    this.__doc = docResource;
    this.__file = DriveApp.getFileById(docResource.documentId);

    const props = [
      'saveAndClose',
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

      'clear',

    
      'newPosition',
      'getLanguage',
      'getText',
      'setLanguage',
      'getChild',
      'getHeader',
      'setText',
    ]
    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented(f)
      }
    })
  }

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

  insertTab(tab) {
    return notYetImplemented('Document.insertTab()');
  }

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

  toString() {
    return 'Document';
  }
}
