import { Proxies } from '../../support/proxies.js';
import { notYetImplemented } from '../../support/helpers.js';
import { SortOrder } from '../enums/sheetsenums.js';

/**
 * @returns {FakeSortSpec}
 */
export const newFakeSortSpec = (...args) => {
  return Proxies.guard(new FakeSortSpec(...args));
};

/**
 * Represents the sorting specification for a column.
 */
export class FakeSortSpec {
  /**
   * @param {object} apiSortSpec The SortSpec object from Sheets API
   */
  constructor(apiSortSpec) {
    this.__apiSortSpec = apiSortSpec;
    // Not implemented yet
    const props = ['getForegroundColor', 'getBackgroundColor', 'getDataSourceColumn'];
    props.forEach(f => {
      this[f] = () => notYetImplemented(f);
    });
  }

  /**
   * isAscending() https://developers.google.com/apps-script/reference/spreadsheet/sort-spec#isascending
   * @returns {boolean}
   */
  isAscending() {
    // The default is ascending, but if there's no spec, it's not sorted.
    return this.__apiSortSpec ? this.__apiSortSpec.sortOrder !== 'DESCENDING' : false;
  }

  /**
   * @returns {number} The 1-based index of the column. Returns 0 if no sort spec.
   */
  getDimensionIndex() {
    // The real environment returns a 1-based index.
    // If there's no spec, return 0.
    return this.__apiSortSpec ? this.__apiSortSpec.dimensionIndex + 1 : 0;
  }

  /**
   * @returns {SortOrder|null} The sort order enum.
   */
  getSortOrder() {
    // The real environment returns an enum, but throws if there's no sort.
    if (!this.__apiSortSpec) {
      // This error message is based on user feedback for the live environment.
      throw new Error('Unexpected error while getting the method or property getSortOrder on object SpreadsheetApp.SortSpec.');
    }
    return SortOrder[this.__apiSortSpec.sortOrder];
  }

  toString() {
    return 'SortSpec';
  }
}