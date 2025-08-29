/**
 * @file Provides a fake implementation of the FootnoteSection class.
 */
import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { registerElement } from './elementRegistry.js';
import { appendParagraph, insertParagraph, appendTable, insertTable, appendListItem, insertListItem } from './appenderhelpers.js';
import { getText } from './elementhelpers.js';

/**
 * Creates a new proxied FakeFootnoteSection instance.
 * @param {...any} args The arguments for the FakeFootnoteSection constructor.
 * @returns {FakeFootnoteSection} A new proxied FakeFootnoteSection instance.
 */
export const newFakeFootnoteSection = (...args) => {
  return Proxies.guard(new FakeFootnoteSection(...args));
};

/**
 * A fake implementation of the FootnoteSection class for DocumentApp.
 * @class FakeFootnoteSection
 * @extends {FakeContainerElement}
 * @implements {GoogleAppsScript.Document.FootnoteSection}
 * @see https://developers.google.com/apps-script/reference/document/footnote-section
 */
class FakeFootnoteSection extends FakeContainerElement {
  /**
   * @param {import('./shadowdocument.js').ShadowDocument} shadowDocument The shadow document manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

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

    if (endIndex <= 2) return this;

    const requests = [{
      deleteContentRange: { range: { startIndex: 1, endIndex: endIndex - 1, segmentId: this.__segmentId, tabId: shadow.__tabId } }
    }];

    Docs.Documents.batchUpdate({ requests }, shadow.getId());
    shadow.refresh();
    return this;
  }

  getText() {
    return getText(this);
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

  toString() {
    return 'FootnoteSection';
  }
}

registerElement('FOOTNOTE_SECTION', newFakeFootnoteSection);

