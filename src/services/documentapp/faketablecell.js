/**
 * @file Provides a fake implementation of the TableCell class.
 */

import { Proxies } from '../../support/proxies.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { getText } from './elementhelpers.js';
import { registerElement } from './elementRegistry.js';
import {
  appendParagraph,
  insertParagraph,
  appendTable,
  insertTable,
  appendListItem,
  insertListItem,
  appendImage,
  insertImage
} from './appenderhelpers.js';

/**
 * A fake implementation of the TableCell class.
 * @class
 * @extends {FakeContainerElement}
 * @implements {GoogleAppsScript.Document.TableCell}
 * @see https://developers.google.com/apps-script/reference/document/table-cell
 */
export class FakeTableCell extends FakeContainerElement {
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Gets the text content of the cell.
   * @returns {string} The text content.
   * @see https://developers.google.com/apps-script/reference/document/table-cell#getText()
   */
  getText() {
    return getText(this);
  }

  /**
   * Retrieves the TableRow containing the current TableCell.
   * @returns {FakeTableRow|null} the table row containing the current cell
   * @see https://developers.google.com/apps-script/reference/document/table-cell#getParentRow()
   */
  getParentRow() {
    return this.getParent();
  }

  /**
   * Retrieves the Table containing the current TableCell.
   * @returns {FakeTable|null} the table containing the current cell
   * @see https://developers.google.com/apps-script/reference/document/table-cell#getParentTable()
   */
  getParentTable() {
    const row = this.getParentRow();
    return row ? row.getParentTable() : null;
  }

  /**
   * Retrieves the column span, which is the number of columns of table cells this cell spans.
   * @returns {number} the column span
   * @see https://developers.google.com/apps-script/reference/document/table-cell#getColSpan()
   */
  getColSpan() {
    const style = this.__elementMapItem.tableCellStyle;
    return style?.columnSpan || 1;
  }

  /**
   * Retrieves the row span, which is the number of rows of table cells this cell spans.
   * @returns {number} the row span
   * @see https://developers.google.com/apps-script/reference/document/table-cell#getRowSpan()
   */
  getRowSpan() {
    const style = this.__elementMapItem.tableCellStyle;
    return style?.rowSpan || 1;
  }

  // --- Appender & Inserter Methods ---

  appendHorizontalRule() {
    return notYetImplemented(`${this.toString()}.appendHorizontalRule`);
  }

  appendImage(image) {
    return appendImage(this, image);
  }

  appendListItem(listItemOrText) {
    return appendListItem(this, listItemOrText);
  }

  appendParagraph(paragraphOrText) {
    return appendParagraph(this, paragraphOrText);
  }

  appendTable(tableOrCells) {
    return appendTable(this, tableOrCells);
  }

  insertHorizontalRule(childIndex) {
    return notYetImplemented(`${this.toString()}.insertHorizontalRule`);
  }

  insertImage(childIndex, image) {
    return insertImage(this, childIndex, image);
  }

  insertListItem(childIndex, listItemOrText) {
    const { nargs } = signatureArgs(arguments, 'TableCell.insertListItem');
    if (nargs === 1) return this.appendListItem(listItemOrText);
    return insertListItem(this, childIndex, listItemOrText);
  }

  insertParagraph(childIndex, paragraphOrText) {
    const { nargs } = signatureArgs(arguments, 'TableCell.insertParagraph');
    if (nargs === 1) return this.appendParagraph(paragraphOrText);
    return insertParagraph(this, childIndex, paragraphOrText);
  }

  insertTable(childIndex, tableOrCells) {
    const { nargs } = signatureArgs(arguments, 'TableCell.insertTable');
    if (nargs === 1) return this.appendTable(tableOrCells);
    return insertTable(this, childIndex, tableOrCells);
  }
}

/**
 * Creates a new fake TableCell.
 * @param {...any} args The arguments for the FakeTableCell constructor.
 * @returns {FakeTableCell} A new proxied FakeTableCell instance.
 */
export const newFakeTableCell = (...args) => Proxies.guard(new FakeTableCell(...args));
registerElement('TABLE_CELL', newFakeTableCell);