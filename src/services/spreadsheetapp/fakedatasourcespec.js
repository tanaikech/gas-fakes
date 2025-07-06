import { Proxies } from '../../support/proxies.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';
import { newFakeDataSourceSpecBuilder } from './fakedatasourcespecbuilder.js';
import { newFakeDataSourceParameter } from './fakedatasourceparameter.js';
import { newFakeBigQueryDataSourceSpec } from './fakebigquerydatasourcespec.js';

/**
 * @returns {FakeDataSourceSpec}
 */
export const newFakeDataSourceSpec = (...args) => {
  return Proxies.guard(new FakeDataSourceSpec(...args));
};

/**
 * Represents a data source specification.
 */
export class FakeDataSourceSpec {
  constructor(apiSpec) {
    // Can be constructed from a builder or a raw API object
    if (apiSpec && apiSpec.toString() === 'DataSourceSpecBuilder') {
      this.__apiSpec = apiSpec.__getApiObject();
    } else {
      this.__apiSpec = apiSpec || {};
    }
  }

  __getApiObject() {
    return this.__apiSpec;
  }

  copy() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceSpec.copy');
    if (nargs) matchThrow();
    const builder = newFakeDataSourceSpecBuilder();
    builder.__apiSpec = JSON.parse(JSON.stringify(this.__apiSpec));
    return builder;
  }

  asLooker() {
    return notYetImplemented('DataSourceSpec.asLooker');
  }

  asBigQuery() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceSpec.asBigQuery');
    if (nargs) matchThrow();
    if (this.getType()?.toString() !== 'BIGQUERY') {
      throw new Error('This spec is not of type BIGQUERY.');
    }
    return newFakeBigQueryDataSourceSpec(this.__apiSpec);
  }

  getParameters() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceSpec.getParameters');
    if (nargs) matchThrow();
    if (!this.__apiSpec.parameters) {
      return [];
    }
    return this.__apiSpec.parameters.map(p => newFakeDataSourceParameter(p));
  }

  getType() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceSpec.getType');
    if (nargs) matchThrow();

    // The underlying API object has a property for each type.
    if (this.__apiSpec.bigQuery) {
      return SpreadsheetApp.DataSourceType.BIGQUERY;
    }
    if (this.__apiSpec.looker) {
      return SpreadsheetApp.DataSourceType.LOOKER;
    }
    return null;
  }

  toString() {
    return 'DataSourceSpec';
  }
}