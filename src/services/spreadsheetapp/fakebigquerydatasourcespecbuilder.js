import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';

const { is } = Utils;

/**
 * @returns {FakeBigQueryDataSourceSpecBuilder}
 */
export const newFakeBigQueryDataSourceSpecBuilder = (...args) => {
  return Proxies.guard(new FakeBigQueryDataSourceSpecBuilder(...args));
};

/**
 * A builder for BigQuery data source specifications.
 */
export class FakeBigQueryDataSourceSpecBuilder {
  constructor(specBuilder) {
    this.__specBuilder = specBuilder; // This is the main DataSourceSpecBuilder
    this.__apiSpec = this.__specBuilder.__getApiObject();
    if (!this.__apiSpec.bigQuery) {
      this.__apiSpec.bigQuery = {};
    }
  }

  setProjectId(projectId) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'BigQueryDataSourceSpecBuilder.setProjectId');
    if (nargs !== 1 || !is.string(projectId)) matchThrow();
    this.__apiSpec.bigQuery.projectId = projectId;
    return this;
  }

  setRawQuery(rawQuery) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'BigQueryDataSourceSpecBuilder.setRawQuery');
    if (nargs !== 1 || !is.string(rawQuery)) matchThrow();
    this.__apiSpec.bigQuery.querySpec = { rawQuery };
    delete this.__apiSpec.bigQuery.tableSpec; // query and table are mutually exclusive
    return this;
  }

  setTable(tableId, datasetId, projectId) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'BigQueryDataSourceSpecBuilder.setTable');
    if (nargs < 2 || nargs > 3) matchThrow();
    if (!is.string(tableId) || !is.string(datasetId)) matchThrow();
    if (nargs === 3 && !is.string(projectId)) matchThrow();

    this.__apiSpec.bigQuery.tableSpec = { tableId, datasetId };
    if (projectId) {
      this.__apiSpec.bigQuery.tableSpec.tableProjectId = projectId;
    }
    delete this.__apiSpec.bigQuery.querySpec; // query and table are mutually exclusive
    return this;
  }

  build() {
    return this.__specBuilder.build();
  }

  toString() {
    return 'BigQueryDataSourceSpecBuilder';
  }
}