/**
 * @file Provides a fake implementation of the FootnoteSection class.
 */
import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { registerElement } from './elementRegistry.js';
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

  /**
   * Appends a new paragraph to the last footnote in the section.
   * @param {string|GoogleAppsScript.Document.Paragraph} paragraphOrText The paragraph or text to append.
   * @returns {GoogleAppsScript.Document.Paragraph} The appended paragraph.
   */
  appendParagraph(paragraphOrText) {
    const footnotes = this.getFootnotes();
    if (footnotes.length === 0) {
      throw new Error('Cannot append a paragraph to a document with no footnotes.');
    }
    return footnotes[footnotes.length - 1].appendParagraph(paragraphOrText);
  }

  /**
   * Appends a new table to the last footnote in the section.
   * @param {string[][]|GoogleAppsScript.Document.Table} tableOrCells The table or cells to append.
   * @returns {GoogleAppsScript.Document.Table} The appended table.
   */
  appendTable(tableOrCells) {
    const footnotes = this.getFootnotes();
    if (footnotes.length === 0) {
      throw new Error('Cannot append a table to a document with no footnotes.');
    }
    return footnotes[footnotes.length - 1].appendTable(tableOrCells);
  }

  /**
   * Appends a new list item to the last footnote in the section.
   * @param {string|GoogleAppsScript.Document.ListItem} listItemOrText The list item or text to append.
   * @returns {GoogleAppsScript.Document.ListItem} The appended list item.
   */
  appendListItem(listItemOrText) {
    const footnotes = this.getFootnotes();
    if (footnotes.length === 0) {
      throw new Error('Cannot append a list item to a document with no footnotes.');
    }
    return footnotes[footnotes.length - 1].appendListItem(listItemOrText);
  }

  /**
   * Clears the contents of all footnotes in the section. This does not remove the footnotes themselves.
   * @returns {FakeFootnoteSection} The section, for chaining.
   */
  clear() {
    this.getFootnotes().forEach(fn => fn.clear());
    return this;
  }

  /**
   * Gets all the footnotes in the section.
   * @returns {GoogleAppsScript.Document.Footnote[]} An array of all footnotes.
   */
  getFootnotes() {
    // The children of the FootnoteSection are the Footnote elements.
    // We must build the array manually as there is no public getChildren() method.
    const children = [];
    for (let i = 0; i < this.getNumChildren(); i++) {
      children.push(this.getChild(i));
    }
    return children;
  }

  /**
   * Gets the concatenated text of all footnotes in the section.
   * @returns {string} The text content.
   */
  getText() {
    return this.getFootnotes().map(fn => fn.getText()).join('\n');
  }

  /**
   * Sets the text content of the footnote section. This clears all existing footnotes' content
   * and sets the text of the first footnote. Throws an error if there are no footnotes.
   * @param {string} text The new text content.
   * @returns {FakeFootnoteSection} The section, for chaining.
   */
  setText(text) {
    this.clear();
    const footnotes = this.getFootnotes();
    if (text && footnotes.length > 0) {
      footnotes[0].setText(text);
    } else if (text && footnotes.length === 0) {
      throw new Error('Cannot set text for a document with no footnotes.');
    }
    return this;
  }

  toString() {
    return 'FootnoteSection';
  }
}

registerElement('FOOTNOTE_SECTION', newFakeFootnoteSection);
