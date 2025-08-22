/**
 * @file Provides a fake implementation of the Table class.
 */

import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { registerElement } from './elementRegistry.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;

/**
 * A fake implementation of the Table class.
 * @class
 * @extends {FakeContainerElement}
 * @implements {GoogleAppsScript.Document.Table}
 * @see https://developers.google.com/apps-script/reference/document/table
 */
export class FakeTable extends FakeContainerElement {
  /**
   */
  constructor(structure, nameOrItem) {
    // A real implementation would build a table resource for the API.
    // Note the oddity: appendTable() with no args creates a 1x1 table in the fake,
    // but a 0-row table in live GAS. The API itself requires rows > 0.
    super(structure, nameOrItem);
  }

  /**
   * Gets the number of rows in the table.
   * @returns {number} The number of rows.
   * @see https://developers.google.com/apps-script/reference/document/table#getNumRows()
   */
  getNumRows() {
    return this.getNumChildren();
  }

  /**
   * Gets the table row at the specified index.
   * @param {number} rowIndex The index of the row.
   * @returns {GoogleAppsScript.Document.TableRow} The table row.
   * @see https://developers.google.com/apps-script/reference/document/table#getRow(Integer)
   */
  getRow(rowIndex) {
    return this.getChild(rowIndex);
  }

  /**
   * Gets the table cell at the given row and cell index.
   * @param {number} rowIndex The row index of the cell.
   * @param {number} cellIndex The cell index within the row.
   * @returns {GoogleAppsScript.Document.TableCell} The table cell.
   * @see https://developers.google.com/apps-script/reference/document/table#getCell(Integer,Integer)
   */
  getCell(rowIndex, cellIndex) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Table.getCell');
    if (nargs !== 2 || !is.integer(rowIndex) || !is.integer(cellIndex)) {
      matchThrow();
    }
    return this.getRow(rowIndex).getCell(cellIndex);
  }
}

/**
 * Creates a new fake Table.
 * @param {...any} args The arguments for the FakeTable constructor.
 * @returns {FakeTable} A new proxied FakeTable instance.
 */
export const newFakeTable = (...args) => Proxies.guard(new FakeTable(...args));
registerElement('TABLE', newFakeTable);