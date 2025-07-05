import { Proxies } from '../../support/proxies.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';
import { newFakeDataSourceColumn } from './fakedatasourcecolumn.js';
import { batchUpdate } from './sheetrangehelpers.js';
import { Utils } from '../../support/utils.js';
import { newFakeDataSourceSpec } from './fakedatasourcespec.js';

const { is } = Utils;

export const newFakeDataSource = (...args) => {
  return Proxies.guard(new FakeDataSource(...args));
};

/**
 * Represents a data source.
 */
export class FakeDataSource {
  constructor(apiDataSource, spreadsheet) {
    this.__apiDataSource = apiDataSource;
    this.__spreadsheet = spreadsheet;
  }

  __updateDataSource(newDataSourceApi, fields) {
    const request = {
      updateDataSource: {
        dataSource: newDataSourceApi,
        fields: fields,
      },
    };
    batchUpdate({ spreadsheet: this.__spreadsheet, requests: [request] });
    // update local state
    this.__apiDataSource = newDataSourceApi;
  }

  createCalculatedColumn(name, formula) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSource.createCalculatedColumn');
    if (nargs !== 2 || !is.string(name) || !is.string(formula)) matchThrow();
    if (!formula.startsWith('=')) {
      throw new Error('Formula must start with an "=" sign.');
    }

    const newColumn = {
      reference: { name },
      formula,
    };

    const currentColumns = this.__apiDataSource.calculatedColumns || [];
    const newColumns = [...currentColumns, newColumn];

    const newDataSourceApi = {
      ...this.__apiDataSource,
      calculatedColumns: newColumns,
    };

    this.__updateDataSource(newDataSourceApi, 'calculatedColumns');
    return newFakeDataSourceColumn(newColumn, this);
  }

  getCalculatedColumnByName(columnName) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSource.getCalculatedColumnByName');
    if (nargs !== 1 || !is.string(columnName)) matchThrow();

    return this.getCalculatedColumns().find(c => c.getName() === columnName) || null;
  }

  getCalculatedColumns() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSource.getCalculatedColumns');
    if (nargs) matchThrow();

    const calculated = this.__apiDataSource.calculatedColumns || [];
    return calculated.map(c => newFakeDataSourceColumn(c, this));
  }

  getColumns() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSource.getColumns');
    if (nargs) matchThrow();

    const dataSourceSheet = this.getDataSourceSheets()[0];
    if (!dataSourceSheet) {
      return this.getCalculatedColumns();
    }

    const sheetProps = dataSourceSheet.__sheet.properties.dataSourceSheetProperties;
    const baseColumns = sheetProps?.columns || [];
    const calculatedColumns = this.__apiDataSource.calculatedColumns || [];

    const allColumns = [...baseColumns, ...calculatedColumns];
    return allColumns.map(c => newFakeDataSourceColumn(c, this));
  }

  getDataSourceSheets() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSource.getDataSourceSheets');
    if (nargs) matchThrow();

    const dataSourceId = this.__apiDataSource.dataSourceId;
    return this.__spreadsheet.getSheets().filter(sheet => {
      const props = sheet.__sheet.properties;
      return props.sheetType === 'DATA_SOURCE' && props.dataSourceSheetProperties?.dataSourceId === dataSourceId;
    });
  }

  getSpec() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSource.getSpec');
    if (nargs) matchThrow();
    return newFakeDataSourceSpec(this.__apiDataSource.spec);
  }

  getSpreadsheet() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSource.getSpreadsheet');
    if (nargs) matchThrow();
    return this.__spreadsheet;
  }

  remove() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSource.remove');
    if (nargs) matchThrow();

    const request = {
      deleteDataSource: {
        dataSourceId: this.__apiDataSource.dataSourceId,
      },
    };
    batchUpdate({ spreadsheet: this.__spreadsheet, requests: [request] });
  }

  updateSpec(spec, refreshAllLinkedObjects) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSource.updateSpec');
    if (nargs < 1 || nargs > 2) matchThrow();
    if (!spec || spec.toString() !== 'DataSourceSpec') matchThrow();
    if (nargs === 2 && !is.boolean(refreshAllLinkedObjects)) matchThrow();

    const newDataSourceApi = {
      dataSourceId: this.__apiDataSource.dataSourceId,
      spec: spec.__getApiObject(),
    };

    const requests = [{
      updateDataSource: {
        dataSource: newDataSourceApi,
        fields: 'spec',
      },
    }];

    if (refreshAllLinkedObjects) {
      requests.push({
        refreshDataSource: {
          dataSourceId: this.__apiDataSource.dataSourceId,
          isAll: true,
        },
      });
    }

    batchUpdate({ spreadsheet: this.__spreadsheet, requests });
    this.__apiDataSource.spec = newDataSourceApi.spec;
    return this;
  }

  toString() {
    return 'DataSource';
  }
}