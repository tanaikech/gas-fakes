import { Proxies } from '../../support/proxies.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';
import { newFakeDataSourceColumnReference } from './fakedatasourcecolumnreference.js';
import { makeColorFromApi } from '../common/fakecolorbuilder.js';

export const newFakeSortSpec = (...args) => {
  return Proxies.guard(new FakeSortSpec(...args));
};

export class FakeSortSpec {
  constructor(apiSortSpec, columnPosition) {
    this.__apiSortSpec = apiSortSpec || {};
    this.__columnPosition = columnPosition;
  }

  getDataSourceColumnReference() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'SortSpec.getDataSourceColumnReference');
    if (nargs) matchThrow();
    const ref = this.__apiSortSpec.dataSourceColumnReference;
    return ref ? newFakeDataSourceColumnReference(ref) : null;
  }

  getDimensionIndex() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'SortSpec.getDimensionIndex');
    if (nargs) matchThrow();
    // If created from a filter, the column position is passed directly.
    if (this.__columnPosition) {
      return this.__columnPosition;
    }
    // Otherwise, derive from the API spec (e.g., from a data table).
    // Apps Script is 1-based, API is 0-based.
    return this.__apiSortSpec.dimensionIndex != null ? this.__apiSortSpec.dimensionIndex + 1 : null;
  }

  getSortOrder() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'SortSpec.getSortOrder');
    if (nargs) matchThrow();
    const order = this.__apiSortSpec.sortOrder;
    if (!order) {
      throw new Error("Unexpected error while getting the method or property getSortOrder on object SpreadsheetApp.SortSpec.");
    }
    return SpreadsheetApp.SortOrder[order];
  }

  isAscending() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'SortSpec.isAscending');
    if (nargs) matchThrow();
    // If not sorted, default to true as per Apps Script behavior.
    return this.__apiSortSpec.sortOrder !== 'DESCENDING';
  }

  getBackgroundColorStyle() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'SortSpec.getBackgroundColorStyle');
    if (nargs) matchThrow();
    const style = this.__apiSortSpec.backgroundColorStyle;
    return style ? makeColorFromApi(style) : null;
  }

  getForegroundColorStyle() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'SortSpec.getForegroundColorStyle');
    if (nargs) matchThrow();
    const style = this.__apiSortSpec.foregroundColorStyle;
    return style ? makeColorFromApi(style) : null;
  }

  toString() {
    return 'SortSpec';
  }
}
