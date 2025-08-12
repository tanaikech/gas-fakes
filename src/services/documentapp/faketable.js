/**
 * @file Provides a fake implementation of the Table class.
 */

import { FakeContainerElement } from './fakecontainerelement.js';
import { newFakeTableRow } from './faketablerow.js';
import { registerElement } from './elementRegistry.js';

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
    return this.__element.table?.tableRows?.length || 0;
  }

  /**
   * Gets the table row at the specified index.
   * @param {number} rowIndex The index of the row.
   * @returns {GoogleAppsScript.Document.TableRow} The table row.
   * @see https://developers.google.com/apps-script/reference/document/table#getRow(Integer)
   */
  getRow(rowIndex) {
    return newFakeTableRow({ rowIndex, table: this });
  }
}

/**
 * Creates a new fake Table.
 * @param {object} properties The properties for the Table.
 * @returns {FakeTable} The new fake Table.
 */
export const newFakeTable = (properties) => new FakeTable(properties);
registerElement('TABLE', newFakeTable);