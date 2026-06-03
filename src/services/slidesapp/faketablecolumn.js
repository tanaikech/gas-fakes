import { Proxies } from '../../support/proxies.js';
import { newFakeTableCell } from './faketablecell.js';

/**
 * create a new FakeTableColumn instance
 * @param  {...any} args 
 * @returns {FakeTableColumn}
 */
export const newFakeTableColumn = (...args) => {
  return Proxies.guard(new FakeTableColumn(...args));
};

export class FakeTableColumn {
  constructor(table, colIndex) {
    this.__table = table;
    this.__colIndex = colIndex;
  }

  /**
   * Gets a cell by its index.
   * @param {number} index The row index.
   * @returns {FakeTableCell} The cell.
   */
  getCell(index) {
    return newFakeTableCell(this.__table, index, this.__colIndex);
  }

  /**
   * Gets the 0-based index of the column.
   * @returns {number} The index.
   */
  getIndex() {
    return this.__colIndex;
  }

  /**
   * Gets the number of cells in this column.
   * @returns {number} The number of cells.
   */
  getNumCells() {
    return this.__table.getNumRows();
  }

  /**
   * Gets the table containing the current column.
   * @returns {FakeTable} The parent table.
   */
  getParentTable() {
    return this.__table;
  }

  /**
   * Gets the width of the column in points.
   * @returns {number} The width.
   */
  getWidth() {
    const tableResource = this.__table.__resource.table;
    const colProperties = tableResource?.tableColumns?.[this.__colIndex];
    return this.__table.__normalize(colProperties?.columnWidth);
  }

  /**
   * Removes the table column.
   */
  remove() {
    throw new Error('TableColumn.remove() not yet implemented');
  }

  toString() {
    return 'TableColumn';
  }
}
