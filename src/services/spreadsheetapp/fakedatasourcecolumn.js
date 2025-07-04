import { Proxies } from '../../support/proxies.js';
import { signatureArgs, notYetImplemented } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { batchUpdate } from './sheetrangehelpers.js';

const { is } = Utils;

/**
 * @returns {FakeDataSourceColumn}
 */
export const newFakeDataSourceColumn = (...args) => {
  return Proxies.guard(new FakeDataSourceColumn(...args));
};

/**
 * Represents a column from a data source.
 */
export class FakeDataSourceColumn {
  constructor(apiColumn, dataSource) {
    this.__apiColumn = apiColumn;
    this.__dataSource = dataSource; // This is a FakeDataSource object or null
  }

  getDataSource() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceColumn.getDataSource');
    if (nargs) matchThrow();
    return this.__dataSource;
  }

  getFormula() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceColumn.getFormula');
    if (nargs) matchThrow();
    return this.__apiColumn.formula || null;
  }

  getName() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceColumn.getName');
    if (nargs) matchThrow();
    return this.__apiColumn.reference?.name || null;
  }

  getType() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceColumn.getType');
    if (nargs) matchThrow();
    // This is only applicable for BigQuery data source columns.
    // Returning null as we don't have the full spec here.
    return null;
  }

  hasArrayDependency() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceColumn.hasArrayDependency');
    if (nargs) matchThrow();
    // This seems to be a BigQuery-specific feature and not directly exposed in the basic Sheets API object.
    // Defaulting to false as a safe assumption for non-BigQuery sources.
    return false;
  }

  isCalculatedColumn() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceColumn.isCalculatedColumn');
    if (nargs) matchThrow();
    return !!this.__apiColumn.formula;
  }

  __updateDataSource(newDataSourceApi, fields) {
    if (!this.__dataSource) {
      throw new Error('This operation is not supported for columns from a range-based data source.');
    }
    const spreadsheet = this.__dataSource.getSpreadsheet();
    const request = {
      updateDataSource: {
        dataSource: newDataSourceApi,
        fields: fields,
      },
    };
    batchUpdate({ spreadsheetId: spreadsheet.getId(), requests: [request] });
    spreadsheet.__disruption();
  }

  remove() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceColumn.remove');
    if (nargs) matchThrow();

    if (!this.isCalculatedColumn()) {
      throw new Error('Only calculated columns can be removed.');
    }
    if (!this.__dataSource) {
      throw new Error('This operation is not supported for columns from a range-based data source.');
    }

    const dataSourceApi = this.__dataSource.__apiDataSource;
    const currentColumns = dataSourceApi.calculatedColumns || [];

    const newColumns = currentColumns.filter(c => c.formula !== this.__apiColumn.formula);

    if (newColumns.length === currentColumns.length) return;

    const newDataSourceApi = {
      ...dataSourceApi,
      calculatedColumns: newColumns.length ? newColumns : undefined,
    };

    this.__updateDataSource(newDataSourceApi, 'calculatedColumns');
  }

  setFormula(formula) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceColumn.setFormula');
    if (nargs !== 1 || !is.string(formula)) matchThrow();

    if (!this.isCalculatedColumn()) {
      throw new Error('Cannot set a formula on a non-calculated column.');
    }
    if (!this.__dataSource) {
      throw new Error('This operation is not supported for columns from a range-based data source.');
    }
    if (!formula.startsWith('=')) {
      throw new Error('Formula must start with an "=" sign.');
    }

    const dataSourceApi = this.__dataSource.__apiDataSource;
    const currentColumns = dataSourceApi.calculatedColumns || [];
    const columnIndex = currentColumns.findIndex(c => c.formula === this.__apiColumn.formula);

    if (columnIndex === -1) throw new Error('Column not found. It may have been removed.');

    const newColumns = [...currentColumns];
    newColumns[columnIndex] = { ...newColumns[columnIndex], formula: formula };

    const newDataSourceApi = { ...dataSourceApi, calculatedColumns: newColumns };

    this.__updateDataSource(newDataSourceApi, 'calculatedColumns');
    this.__apiColumn.formula = formula;
    return this;
  }

  setName(name) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceColumn.setName');
    if (nargs !== 1 || !is.string(name)) matchThrow();

    if (!this.isCalculatedColumn()) {
      notYetImplemented('setName for non-calculated columns');
      return this;
    }

    const dataSourceApi = this.__dataSource.__apiDataSource;
    const currentColumns = dataSourceApi.calculatedColumns || [];
    const columnIndex = currentColumns.findIndex(c => c.formula === this.__apiColumn.formula);

    if (columnIndex === -1) throw new Error('Column not found. It may have been removed.');

    const newColumns = [...currentColumns];
    newColumns[columnIndex] = { ...newColumns[columnIndex], reference: { name: name } };

    const newDataSourceApi = { ...dataSourceApi, calculatedColumns: newColumns };

    this.__updateDataSource(newDataSourceApi, 'calculatedColumns');
    this.__apiColumn.reference = { name: name };
    return this;
  }

  toString() {
    return 'DataSourceColumn';
  }
}