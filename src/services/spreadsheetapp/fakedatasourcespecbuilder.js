import { Proxies } from '../../support/proxies.js';
import { notYetImplemented } from '../../support/helpers.js';
import { newFakeDataSourceSpec } from './fakedatasourcespec.js';

/**
 * @returns {FakeDataSourceSpecBuilder}
 */
export const newFakeDataSourceSpecBuilder = (...args) => {
  return Proxies.guard(new FakeDataSourceSpecBuilder(...args));
};

/**
 * A builder for data source specifications.
 */
export class FakeDataSourceSpecBuilder {
  constructor() {
    this.__apiSpec = {};
  }

  __getApiObject() {
    return this.__apiSpec;
  }

  build() {
    return newFakeDataSourceSpec(this);
  }

  copy() {
    return notYetImplemented('DataSourceSpecBuilder.copy');
  }

  asBigQuery() {
    return notYetImplemented('DataSourceSpecBuilder.asBigQuery');
  }

  setBigQuery(tableProjectId, datasetId, tableId) {
    return notYetImplemented('DataSourceSpecBuilder.setBigQuery');
  }

  setBigQueryFromSpec(spec) {
    return notYetImplemented('DataSourceSpecBuilder.setBigQueryFromSpec');
  }

  setParameterFromCell(paramName, cell) {
    return notYetImplemented('DataSourceSpecBuilder.setParameterFromCell');
  }

  removeAllParameters() {
    return notYetImplemented('DataSourceSpecBuilder.removeAllParameters');
  }

  removeParameter(paramName) {
    return notYetImplemented('DataSourceSpecBuilder.removeParameter');
  }

  toString() {
    return 'DataSourceSpecBuilder';
  }
}