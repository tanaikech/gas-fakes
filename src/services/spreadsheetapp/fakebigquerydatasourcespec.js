import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';

/**
 * @returns {FakeBigQueryDataSourceSpec}
 */
export const newFakeBigQueryDataSourceSpec = (...args) => {
  return Proxies.guard(new FakeBigQueryDataSourceSpec(...args));
};

/**
 * Access the settings for a BigQuery data source spec.
 */
export class FakeBigQueryDataSourceSpec {
  constructor(apiSpec) {
    this.__apiSpec = apiSpec;
  }

  getProjectId() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'BigQueryDataSourceSpec.getProjectId');
    if (nargs) matchThrow();
    return this.__apiSpec.bigQuery?.projectId || null;
  }

  getRawQuery() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'BigQueryDataSourceSpec.getRawQuery');
    if (nargs) matchThrow();
    return this.__apiSpec.bigQuery?.querySpec?.rawQuery || null;
  }

  getDatasetId() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'BigQueryDataSourceSpec.getDatasetId');
    if (nargs) matchThrow();
    return this.__apiSpec.bigQuery?.tableSpec?.datasetId || null;
  }

  getTableId() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'BigQueryDataSourceSpec.getTableId');
    if (nargs) matchThrow();
    return this.__apiSpec.bigQuery?.tableSpec?.tableId || null;
  }

  getTableProjectId() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'BigQueryDataSourceSpec.getTableProjectId');
    if (nargs) matchThrow();
    return this.__apiSpec.bigQuery?.tableSpec?.tableProjectId || null;
  }

  toString() {
    return 'BigQueryDataSourceSpec';
  }
}