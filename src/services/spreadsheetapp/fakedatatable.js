import { Proxies } from '../../support/proxies.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';
import { newFakeDataSource } from './fakedatasource.js';
import { newFakeSortSpec } from './fakesortspec.js';
import { batchUpdate } from './sheetrangehelpers.js';

export const newFakeDataTable = (...args) => {
  return Proxies.guard(new FakeDataTable(...args));
};

export class FakeDataTable {
  constructor(apiTable, anchorRange) {
    this.__apiTable = apiTable;
    this.__anchorRange = anchorRange;
  }

  getRange() {
    const { nargs, matchThrow } = signatureArgs(arguments, "DataTable.getRange");
    if (nargs) matchThrow();
    // The range of a data table is its data region, starting from the anchor cell.
    return this.__anchorRange.getDataRegion();
  }

  getDataSource() {
    const { nargs, matchThrow } = signatureArgs(arguments, "DataTable.getDataSource");
    if (nargs) matchThrow();
    const spreadsheet = this.__anchorRange.getSheet().getParent();
    const dataSourceId = this.__apiTable.dataSourceId;
    return spreadsheet.__getDataSourceById(dataSourceId);
  }

  getFilter() {
    return notYetImplemented('DataTable.getFilter');
  }

  getSortSpecs() {
    const { nargs, matchThrow } = signatureArgs(arguments, "DataTable.getSortSpecs");
    if (nargs) matchThrow();
    return (this.__apiTable.sortSpecs || []).map(spec => newFakeSortSpec(spec));
  }

  remove() {
    const { nargs, matchThrow } = signatureArgs(arguments, "DataTable.remove");
    if (nargs) matchThrow();
    const anchorCell = this.__anchorRange.offset(0, 0, 1, 1);
    const request = {
      updateCells: {
        rows: [{ values: [{ dataSourceTable: null }] }],
        fields: 'dataSourceTable',
        start: {
          sheetId: anchorCell.getSheet().getSheetId(),
          rowIndex: anchorCell.getRow() - 1,
          columnIndex: anchorCell.getColumn() - 1,
        }
      }
    };
    batchUpdate({ spreadsheet: this.__anchorRange.getSheet().getParent(), requests: [request] });
  }

  asDataSourceTable() {
    const { nargs, matchThrow } = signatureArgs(arguments, "DataTable.asDataSourceTable");
    if (nargs) matchThrow();
    return this;
  }

  toString() {
    return 'DataTable';
  }
}