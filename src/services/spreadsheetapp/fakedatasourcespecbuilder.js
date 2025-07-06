import { Proxies } from '../../support/proxies.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';
import { newFakeDataSourceSpec } from './fakedatasourcespec.js';
import { newFakeDataSourceParameter } from './fakedatasourceparameter.js';
import { Utils } from '../../support/utils.js';
import { newFakeBigQueryDataSourceSpecBuilder } from './fakebigquerydatasourcespecbuilder.js';

/**
 * @returns {FakeDataSourceSpecBuilder}
 */
export const newFakeDataSourceSpecBuilder = (...args) => {
  return Proxies.guard(new FakeDataSourceSpecBuilder(...args));
};

const { is } = Utils;

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
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceSpecBuilder.copy');
    if (nargs) matchThrow();
    const builder = newFakeDataSourceSpecBuilder();
    builder.__apiSpec = JSON.parse(JSON.stringify(this.__apiSpec));
    return builder;
  }

  asLooker() {
    return notYetImplemented('DataSourceSpecBuilder.asLooker');
  }

  asBigQuery() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceSpecBuilder.asBigQuery');
    if (nargs) matchThrow();
    return newFakeBigQueryDataSourceSpecBuilder(this);
  }

  setParameterFromCell(paramName, cell) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceSpecBuilder.setParameterFromCell');
    // The cell parameter is a string like 'Sheet1!A1'
    if (nargs !== 2 || !is.string(paramName) || !is.string(cell)) matchThrow();

    if (!this.__apiSpec.parameters) {
      this.__apiSpec.parameters = [];
    }
    const existingParamIndex = this.__apiSpec.parameters.findIndex(p => p.name === paramName);
    const newParam = { name: paramName, cell: cell };

    if (existingParamIndex > -1) {
      this.__apiSpec.parameters[existingParamIndex] = newParam;
    } else {
      this.__apiSpec.parameters.push(newParam);
    }
    return this;
  }

  removeAllParameters() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceSpecBuilder.removeAllParameters');
    if (nargs) matchThrow();
    this.__apiSpec.parameters = [];
    return this;
  }

  removeParameter(paramName) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceSpecBuilder.removeParameter');
    if (nargs !== 1 || !is.string(paramName)) matchThrow();
    if (this.__apiSpec.parameters) {
      this.__apiSpec.parameters = this.__apiSpec.parameters.filter(p => p.name !== paramName);
    }
    return this;
  }

  getParameters() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceSpecBuilder.getParameters');
    if (nargs) matchThrow();
    if (!this.__apiSpec.parameters) {
      return [];
    }
    return this.__apiSpec.parameters.map(p => newFakeDataSourceParameter(p));
  }

  getType() {
    return this.build().getType();
  }

  toString() {
    return 'DataSourceSpecBuilder';
  }
}