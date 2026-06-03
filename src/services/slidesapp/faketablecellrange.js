import { Proxies } from '../../support/proxies.js';

/**
 * create a new FakeTableCellRange instance
 * @param  {...any} args 
 * @returns {FakeTableCellRange}
 */
export const newFakeTableCellRange = (...args) => {
  return Proxies.guard(new FakeTableCellRange(...args));
};

export class FakeTableCellRange {
  constructor(cells) {
    this.__cells = cells;
  }

  /**
   * Returns the list of TableCell instances.
   * @returns {FakeTableCell[]} The cells.
   */
  getTableCells() {
    return this.__cells;
  }

  toString() {
    return 'TableCellRange';
  }
}
