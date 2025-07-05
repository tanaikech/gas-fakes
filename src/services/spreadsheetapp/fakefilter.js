import { Proxies } from '../../support/proxies.js';
import { newFakeSheetRange } from './fakesheetrange.js';
import { batchUpdate, isRange, makeSheetsGridRange } from './sheetrangehelpers.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { newFakeSortSpec } from './fakesortspec.js';
import { newFakeFilterCriteriaBuilder } from './fakefiltercriteriabuilder.js';

const { is } = Utils;
/**
 * @returns {FakeFilter}
 */
export const newFakeFilter = (...args) => {
  return Proxies.guard(new FakeFilter(...args));
};

export class FakeFilter {
  /**
   * @param {object} apiFilter The BasicFilter object from Sheets API
   * @param {FakeSheet} sheet The parent sheet
   */
  constructor(apiFilter, sheet) {
    this.__apiFilter = apiFilter;
    this.__sheet = sheet;
  }

  __refresh() {
    // After a disruption, the sheet's metadata is updated.
    // We need to get the new filter object from the sheet to update this instance.
    const updatedFilter = this.__sheet.getFilter();
    if (updatedFilter) {
      // The __apiFilter is the raw object from the Sheets API
      this.__apiFilter = updatedFilter.__apiFilter;
    }
    return this;
  }

  /**
   * getRange() https://developers.google.com/apps-script/reference/spreadsheet/filter#getrange
   * @returns {FakeSheetRange}
   */
  getRange() {
    return newFakeSheetRange(this.__apiFilter.range, this.__sheet);
  }

  /**
   * remove() https://developers.google.com/apps-script/reference/spreadsheet/filter#remove
   */
  remove() {
    const request = {
      clearBasicFilter: {
        sheetId: this.__sheet.getSheetId()
      }
    };

    batchUpdate({ spreadsheet: this.__sheet.getParent(), requests: [request] });
  }

  /**
   * sort() https://developers.google.com/apps-script/reference/spreadsheet/filter#sort(Integer,Boolean)
   * @param {number} columnPosition The 1-based index of the column to sort by.
   * @param {boolean} ascending `true` to sort in ascending order; `false` to sort in descending order.
   * @returns {FakeFilter} The filter, for chaining.
   */
  sort(columnPosition, ascending) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Filter.sort");
    if (nargs !== 2 || !is.integer(columnPosition) || !is.boolean(ascending)) matchThrow();

    const filterRange = this.getRange();
    const startCol = filterRange.getColumn();
    const endCol = filterRange.getLastColumn();

    if (columnPosition < startCol || columnPosition > endCol) {
      throw new Error(`The column ${columnPosition} is not within the filter range.`);
    }

    const oldFilter = this.__apiFilter;
    const newFilter = {
      range: oldFilter.range,
      // preserve existing criteria
      ...(oldFilter.criteria && { criteria: oldFilter.criteria }),
      // set the new sort specs
      sortSpecs: [{
        dimensionIndex: columnPosition - 1,
        sortOrder: ascending ? 'ASCENDING' : 'DESCENDING',
      }],
    };

    const request = {
      setBasicFilter: {
        filter: newFilter,
      },
    };

    batchUpdate({ spreadsheet: this.__sheet.getParent(), requests: [request] });
    
    return this.__refresh();
  }

  /**
   * getColumnSortSpec()
   * @param {number} columnPosition The 1-based index of the column.
   * @returns {FakeSortSpec|null} The sort specification, or null if the column has no sort spec.
   */
  getColumnSortSpec(columnPosition) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Filter.getColumnSortSpec");
    if (nargs !== 1 || !is.integer(columnPosition)) matchThrow();

    const sortSpecs = this.__apiFilter.sortSpecs || [];
    const spec = sortSpecs.find(s => s.dimensionIndex === columnPosition - 1);

    return newFakeSortSpec(spec || null);
  }

  getColumnFilterCriteria(columnPosition) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Filter.getColumnFilterCriteria");
    if (nargs !== 1 || !is.integer(columnPosition)) matchThrow();

    const apiCriteria = this.__apiFilter.criteria?.[columnPosition - 1];
    if (!apiCriteria) return null;

    const builder = newFakeFilterCriteriaBuilder().__setFromApiObject(apiCriteria);
    return builder.build();
  }

  /**
   * removeColumnFilterCriteria() https://developers.google.com/apps-script/reference/spreadsheet/filter#removecolumnfiltercriteriacolumnposition
   * @param {number} columnPosition The 1-based index of the column.
   * @returns {FakeFilter} The filter, for chaining.
   */
  removeColumnFilterCriteria(columnPosition) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Filter.removeColumnFilterCriteria");
    if (nargs !== 1 || !is.integer(columnPosition)) matchThrow();
    return this.setColumnFilterCriteria(columnPosition, null);
  }

  setColumnFilterCriteria(columnPosition, filterCriteria) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Filter.setColumnFilterCriteria");
    if (nargs !== 2 || !is.integer(columnPosition)) matchThrow();
    if (filterCriteria !== null && filterCriteria.toString() !== 'FilterCriteria') matchThrow();

    const oldFilter = this.__apiFilter;
    const newFilter = {
      range: oldFilter.range,
      // always preserve existing sort specs
      ...(oldFilter.sortSpecs && { sortSpecs: oldFilter.sortSpecs })
    };

    const newCriteria = { ...(oldFilter.criteria || {}) };

    if (filterCriteria === null) {
      delete newCriteria[String(columnPosition - 1)];
    } else {
      newCriteria[String(columnPosition - 1)] = filterCriteria.__apiCriteria;
    }

    if (Object.keys(newCriteria).length > 0) {
      newFilter.criteria = newCriteria;
    }

    const request = { setBasicFilter: { filter: newFilter } };
    batchUpdate({ spreadsheet: this.__sheet.getParent(), requests: [request] });
    return this.__refresh();
  }

  toString() {
    return 'Filter';
  }
}