/**
 * @file Provides a fake implementation of the Footnote and FootnoteReference classes.
 */
import { Proxies } from '../../support/proxies.js';
import { FakeElement } from './fakeelement.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { registerElement } from './elementRegistry.js';
import { shadowPrefix } from './nrhelpers.js';
import { appendParagraph, insertParagraph, appendTable, insertTable, appendListItem, insertListItem } from './appenderhelpers.js';
import { getText } from './elementhelpers.js';

/**
 * Creates a new proxied FakeFootnote instance.
 * @param {...any} args The arguments for the FakeFootnote constructor.
 * @returns {FakeFootnote} A new proxied FakeFootnote instance.
 */
export const newFakeFootnote = (...args) => {
  return Proxies.guard(new FakeFootnote(...args));
};

/**
 * A fake implementation of the Footnote class for DocumentApp.
 * This class acts as a handle to the footnote content, which is accessed
 * as a Body object via getFootnoteContents().
 * @class FakeFootnote
 * @extends {FakeContainerElement}
 * @implements {GoogleAppsScript.Document.Footnote}
 * @see https://developers.google.com/apps-script/reference/document/footnote
 */
class FakeFootnote extends FakeContainerElement {
  /**
   * @param {import('./shadowdocument.js').ShadowDocument} shadowDocument The shadow document manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Gets the contents of the footnote. In Apps Script, this returns the Footnote object itself.
   * @returns {GoogleAppsScript.Document.Footnote} The footnote contents.
   * @see https://developers.google.com/apps-script/reference/document/footnote#getFootnoteContents()
   */
  getFootnoteContents() {
    // The Footnote itself acts as the container for its content.
    return this;
  }

  /**
   * Gets the ID of the footnote.
   * @returns {string} The footnote ID (e.g., 'kix.abcdef').
   */
  getId() {
    const item = this.__elementMapItem;
    const prefix = shadowPrefix + 'FOOTNOTE_';
    return item.__name.startsWith(prefix) ? item.__name.substring(prefix.length) : item.__name;
  }

  /**
   * Gets the text content of the footnote. This is a convenience method that
   * delegates to the footnote's contents.
   * @returns {string} The text content.
   * @see https://developers.google.com/apps-script/reference/document/footnote#getText()
   */
  getText() {
    return getText(this).trim();
  }

  /**
   * Returns the string "Footnote".
   * @returns {string}
   */
  toString() {
    return 'Footnote';
  }

  // Container methods

  appendParagraph(paragraphOrText) {
    return appendParagraph(this, paragraphOrText);
  }

  appendTable(tableOrCells) {
    return appendTable(this, tableOrCells);
  }

  appendListItem(listItemOrText) {
    return appendListItem(this, listItemOrText);
  }

  clear() {
    const shadow = this.shadowDocument;
    const item = this.__elementMapItem;
    const content = item.content || [];

    if (content.length === 0) return this;

    const lastElement = content[content.length - 1];
    const endIndex = lastElement.endIndex;

    // A new footnote has one empty paragraph with range [1,2).
    // We must not delete this final newline character.
    if (endIndex <= 2) return this;

    const requests = [{
      deleteContentRange: { range: { startIndex: 1, endIndex: endIndex - 1, segmentId: this.__segmentId, tabId: shadow.__tabId } }
    }];

    Docs.Documents.batchUpdate({ requests }, shadow.getId());
    shadow.refresh();
    return this;
  }

  insertParagraph(childIndex, paragraph) {
    return insertParagraph(this, childIndex, paragraph);
  }

  insertTable(childIndex, table) {
    return insertTable(this, childIndex, table);
  }

  insertListItem(childIndex, listItem) {
    return insertListItem(this, childIndex, listItem);
  }

  setText(text) {
    this.clear();
    if (text) {
      const requests = [{
        insertText: { location: { index: 1, segmentId: this.__segmentId }, text }
      }];
      Docs.Documents.batchUpdate({ requests }, this.shadowDocument.getId());
      this.shadowDocument.refresh();
    }
    return this;
  }
}

registerElement('FOOTNOTE', newFakeFootnote);

/**
 * A fake implementation of the FootnoteReference class for DocumentApp.
 * @class FakeFootnoteReference
 * @extends {FakeElement}
 * @implements {GoogleAppsScript.Document.FootnoteReference}
 * @see https://developers.google.com/apps-script/reference/document/footnote-reference
 */
class FakeFootnoteReference extends FakeElement {
  /**
   * @param {import('./shadowdocument.js').ShadowDocument} shadowDocument The shadow document manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Gets the footnote that this reference points to.
   * @returns {GoogleAppsScript.Document.Footnote} The footnote.
   */
  getFootnote() {
    const item = this.__elementMapItem;
    const footnoteId = item.footnoteReference?.footnoteId;
    if (!footnoteId) {
      throw new Error('FootnoteReference has no footnoteId.');
    }
    return this.__shadowDocument.getFootnoteById(footnoteId);
  }

  /**
   * Returns the string "FootnoteReference".
   * @returns {string}
   */
  toString() {
    return 'FootnoteReference';
  }
}
/**
 * Creates a new proxied FakeFootnoteReference instance.
 * @param {...any} args The arguments for the FakeFootnoteReference constructor.
 * @returns {FakeFootnoteReference} A new proxied FakeFootnoteReference instance.
 */
export const newFakeFootnoteReference = (...args) => {
  return Proxies.guard(new FakeFootnoteReference(...args));
};

registerElement('FOOTNOTE_REFERENCE', newFakeFootnoteReference);
