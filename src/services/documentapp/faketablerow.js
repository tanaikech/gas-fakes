/**
 * @file Provides a fake implementation of the TableRow class.
 */
import { registerElement } from './elementRegistry.js';
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
  constructor(structure, nameOrItem) {
    super(structure, nameOrItem);
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
}

/**
 * Creates a new fake TableRow.
 * @param {...any} args The arguments for the FakeTableRow constructor.
 * @returns {FakeTableRow} A new proxied FakeTableRow instance.
 */
export const newFakeTableRow = (...args) => Proxies.guard(new FakeTableRow(...args));
registerElement('TABLE_ROW', newFakeTableRow);
