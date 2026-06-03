import { Proxies } from '../../support/proxies.js';
import { FakePageElement, PageElementRegistry } from './fakepageelement.js';
import { newFakeTableRow } from './faketablerow.js';
import { newFakeTableColumn } from './faketablecolumn.js';

export const newFakeTable = (...args) => {
  return Proxies.guard(new FakeTable(...args));
};

PageElementRegistry.newFakeTable = newFakeTable;

export class FakeTable extends FakePageElement {
  constructor(resource, page) {
    super(resource, page);
  }

  get __presentation() {
    return this.__page.__presentation || this.__page.__slide?.__presentation;
  }

  /**
   * Appends a new column to the right of the last column of the table.
   * @returns {FakeTableColumn} The new appended column.
   */
  appendColumn() {
    return this.insertColumn(this.getNumColumns());
  }

  /**
   * Appends a new row below the last row of the table.
   * @returns {FakeTableRow} The new appended row.
   */
  appendRow() {
    return this.insertRow(this.getNumRows());
  }

  /**
   * Gets a column by its index.
   * @param {number} index The column index.
   * @returns {FakeTableColumn} The column.
   */
  getColumn(index) {
    if (index < 0 || index >= this.getNumColumns()) {
      throw new Error(`Column index ${index} out of bounds`);
    }
    return newFakeTableColumn(this, index);
  }

  /**
   * Gets a cell by its row and column index.
   * @param {number} rowIndex The row index.
   * @param {number} colIndex The column index.
   * @returns {FakeTableCell} The cell.
   */
  getCell(rowIndex, colIndex) {
    return this.getRow(rowIndex).getCell(colIndex);
  }

  /**
   * Gets a row by its index.
   * @param {number} index The row index.
   * @returns {FakeTableRow} The row.
   */
  getRow(index) {
    if (index < 0 || index >= this.getNumRows()) {
      throw new Error(`Row index ${index} out of bounds`);
    }
    return newFakeTableRow(this, index);
  }

  /**
   * Gets the number of rows in the table.
   * @returns {number} The number of rows.
   */
  getNumRows() {
    return (this.__resource.table?.tableRows || []).length;
  }

  /**
   * Gets the number of columns in the table.
   * @returns {number} The number of columns.
   */
  getNumColumns() {
    const rows = this.__resource.table?.tableRows || [];
    return rows.length > 0 ? (rows[0].tableCells || []).length : 0;
  }

  /**
   * Inserts a new column at the specified index of the table.
   * @param {number} index The index.
   * @returns {FakeTableColumn} The new column.
   */
  insertColumn(index) {
    throw new Error('Table.insertColumn() not yet implemented');
  }

  /**
   * Inserts a new row at the specified index of the table.
   * @param {number} index The index.
   * @returns {FakeTableRow} The new row.
   */
  insertRow(index) {
    throw new Error('Table.insertRow() not yet implemented');
  }

  toString() {
    return 'Table';
  }
}
