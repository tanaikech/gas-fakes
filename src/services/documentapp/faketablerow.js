/**
 * @file Provides a fake implementation of the TableRow class.
 */
import { registerElement } from './elementRegistry.js';
import { newFakeElement } from './fakeelement.js';
import { signatureArgs } from '../../support/helpers.js';
import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';

/**
 * A fake implementation of the TableRow class.
 * @class
 * @extends {FakeContainerElement}
 * @implements {GoogleAppsScript.Document.TableRow}
 * @see https://developers.google.com/apps-script/reference/document/table-row
 */
export class FakeTableRow extends FakeContainerElement {
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
 * Gets the table cell at the given index.
 * @param {number} cellIndex The index of the cell to retrieve.
 * @returns {GoogleAppsScript.Document.TableCell} The table cell.
 * @see https://developers.google.com/apps-script/reference/document/table-row#getCell(Integer)
 */
  getCell(cellIndex) {
    return this.getChild(cellIndex);
  }

  /**
   * Gets the number of cells in the row.
   * @returns {number} The number of cells.
   * @see https://developers.google.com/apps-script/reference/document/table-row#getNumCells()
   */
  getNumCells() {
    return this.getNumChildren();
  }

  /**
   * Gets the text content of the table row.
   * @returns {string} The text content.
   */
  getText() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'TableRow.getText');
    if (nargs !== 0) matchThrow();
    // Live Apps Script joins cell text with a newline character.
    return this.__children      
      .map(childTwig => newFakeElement(this.shadowDocument, childTwig.name).__cast().getText())
      .join('\n');
  }
}

/**
 * Creates a new fake TableRow.
 * @param {...any} args The arguments for the FakeTableRow constructor.
 * @returns {FakeTableRow} A new proxied FakeTableRow instance.
 */
export const newFakeTableRow = (...args) => Proxies.guard(new FakeTableRow(...args));
registerElement('TABLE_ROW', newFakeTableRow);
