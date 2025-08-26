/**
 * @file Provides a base class for HeaderSection and FooterSection.
 */
import { FakeContainerElement } from './fakecontainerelement.js';
import { notYetImplemented } from '../../support/helpers.js';
import { getText } from './elementhelpers.js';
import {
  appendParagraph,
  insertParagraph,
  appendTable,
  insertTable,
  appendListItem,
  insertListItem,
} from './appenderhelpers.js';

/**
 * A base class for HeaderSection and FooterSection.
 * @class FakeSectionElement
 * @extends {FakeContainerElement}
 */
export class FakeSectionElement extends FakeContainerElement {
  /**
   * @param {object} structure The document structure manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(structure, nameOrItem) {
    super(structure, nameOrItem);
  }

  /**
   * Appends a horizontal rule.
   * @returns {GoogleAppsScript.Document.HorizontalRule} The appended horizontal rule.
   */
  appendHorizontalRule() {
    return notYetImplemented(`${this.toString()}.appendHorizontalRule`);
  }

  /**
   * Appends an image.
   * @param {GoogleAppsScript.Base.BlobSource} image The image data.
   * @returns {GoogleAppsScript.Document.InlineImage} The appended image.
   */
  appendImage(image) {
    return notYetImplemented(`${this.toString()}.appendImage`);
  }

  /**
   * Appends a list item.
   * @param {string|GoogleAppsScript.Document.ListItem} listItemOrText The list item or text to append.
   * @returns {GoogleAppsScript.Document.ListItem} The appended list item.
   */
  appendListItem(listItemOrText) {
    return appendListItem(this, listItemOrText);
  }

  /**
   * Appends a paragraph.
   * @param {string|GoogleAppsScript.Document.Paragraph} paragraphOrText The paragraph to append.
   * @returns {GoogleAppsScript.Document.Paragraph} The appended paragraph.
   */
  appendParagraph(paragraphOrText) {
    return appendParagraph(this, paragraphOrText);
  }

  /**
   * Appends a table.
   * @param {string[][]|GoogleAppsScript.Document.Table} tableOrCells The table or cells to append.
   * @returns {GoogleAppsScript.Document.Table} The appended table.
   */
  appendTable(tableOrCells) {
    return appendTable(this, tableOrCells);
  }

  /**
   * Clears the contents.
   * @returns {FakeSectionElement} The section.
   */
  clear() {
    return notYetImplemented(`${this.toString()}.clear`);
  }

  /**
   * Returns the contents as a Text element.
   * @returns {GoogleAppsScript.Document.Text} The contents as a Text element.
   */
  editAsText() {
    return notYetImplemented(`${this.toString()}.editAsText`);
  }

  /**
   * Gets the text content.
   * @returns {string} The text content.
   */
  getText() {
    return getText(this);
  }

  /**
   * Inserts a horizontal rule at a specific index.
   * @param {number} childIndex The index to insert at.
   * @returns {GoogleAppsScript.Document.HorizontalRule} The inserted horizontal rule.
   */
  insertHorizontalRule(childIndex) {
    return notYetImplemented(`${this.toString()}.insertHorizontalRule`);
  }

  /**
   * Inserts an image at a specific index.
   * @param {number} childIndex The index to insert at.
   * @param {GoogleAppsScript.Base.BlobSource} image The image data.
   * @returns {GoogleAppsScript.Document.InlineImage} The inserted image.
   */
  insertImage(childIndex, image) {
    return notYetImplemented(`${this.toString()}.insertImage`);
  }

  /**
   * Inserts a list item at a specific index.
   * @param {number} childIndex The index to insert at.
   * @param {string|GoogleAppsScript.Document.ListItem} listItemOrText The list item or text to insert.
   * @returns {GoogleAppsScript.Document.ListItem} The inserted list item.
   */
  insertListItem(childIndex, listItemOrText) {
    if (childIndex === this.getNumChildren()) {
      return this.appendListItem(listItemOrText);
    }
    return insertListItem(this, childIndex, listItemOrText);
  }

  /**
   * Inserts a paragraph at a specific index.
   * @param {number} childIndex The index to insert at.
   * @param {GoogleAppsScript.Document.Paragraph} paragraph The paragraph to insert.
   * @returns {GoogleAppsScript.Document.Paragraph} The inserted paragraph.
   */
  insertParagraph(childIndex, paragraph) {
    if (childIndex === this.getNumChildren()) {
      return this.appendParagraph(paragraph);
    }
    return insertParagraph(this, childIndex, paragraph);
  }

  /**
   * Inserts a table at a specific index.
   * @param {number} childIndex The index to insert at.
   * @param {GoogleAppsScript.Document.Table} table The table to insert.
   * @returns {GoogleAppsScript.Document.Table} The inserted table.
   */
  insertTable(childIndex, table) {
    if (childIndex === this.getNumChildren()) {
      return this.appendTable(table);
    }
    return insertTable(this, childIndex, table);
  }
}
