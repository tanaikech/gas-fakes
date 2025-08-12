/**
 * @file Provides a fake implementation of the TableRow class.
 */
import { registerElement } from './elementRegistry.js';
import { FakeContainerElement } from './fakecontainerelement.js';

/**
 * A fake implementation of the TableRow class.
 * @class
 * @extends {FakeContainerElement}
 * @implements {GoogleAppsScript.Document.TableRow}
 * @see https://developers.google.com/apps-script/reference/document/table-row
 */
export class FakeTableRow extends FakeContainerElement {
  /**
   * @param {object} properties The properties of the table row.
   * @param {number} properties.rowIndex The index of this row.
   * @param {GoogleAppsScript.Document.Table} properties.table The parent table.
   * @private
   */
  constructor({ rowIndex, table }) {
    // TableRow doesn't have its own type in ElementType enum.
    super({ element: {}, doc: table.__doc, parent: table, type: null });
  }

  /**
   * Gets the number of cells in the row.
   * @returns {number} The number of cells.
   * @see https://developers.google.com/apps-script/reference/document/table-row#getNumCells()
   */
  getNumCells() {
    return 0; // Stub implementation
  }
}

/**
 * Creates a new fake TableRow.
 * @param {object} properties The properties for the TableRow.
 * @returns {FakeTableRow} The new fake TableRow.
 */
export const newFakeTableRow = (properties) => new FakeTableRow(properties);
registerElement('TABLE_ROW', newFakeTableRow);
