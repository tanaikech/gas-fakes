import { Proxies } from '../../support/proxies.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';
import { newFakeDataSourceColumnReference } from './fakedatasourcecolumnreference.js';
import { makeColorFromApi } from '../commonclasses/fakecolorbuilder.js';

export const newFakeSortSpec = (...args) => {
  return Proxies.guard(new FakeSortSpec(...args));
};

export class FakeSortSpec {
  constructor(apiSortSpec) {
    this.__apiSortSpec = apiSortSpec || {};
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
    // Apps Script is 1-based, API is 0-based
    return this.__apiSortSpec.dimensionIndex != null ? this.__apiSortSpec.dimensionIndex + 1 : null;
  }

  getSortOrder() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'SortSpec.getSortOrder');
    if (nargs) matchThrow();
    const order = this.__apiSortSpec.sortOrder;
    return order ? SpreadsheetApp.SortOrder[order] : null;
  }

  isAscending() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'SortSpec.isAscending');
    if (nargs) matchThrow();
    return this.__apiSortSpec.sortOrder === 'ASCENDING';
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