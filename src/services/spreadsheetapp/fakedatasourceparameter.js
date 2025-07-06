import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';

/**
 * @returns {FakeDataSourceParameter}
 */
export const newFakeDataSourceParameter = (...args) => {
  return Proxies.guard(new FakeDataSourceParameter(...args));
};

/**
 * Represents a parameter in a data source.
 */
export class FakeDataSourceParameter {
  constructor(apiParameter) {
    this.__apiParameter = apiParameter;
  }

  getName() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceParameter.getName');
    if (nargs) matchThrow();
    return this.__apiParameter.name;
  }

  getSourceCell() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceParameter.getSourceCell');
    if (nargs) matchThrow();
    return this.__apiParameter.cell || null;
  }

  getType() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceParameter.getType');
    if (nargs) matchThrow();
    return this.__apiParameter.cell ? SpreadsheetApp.DataSourceParameterType.CELL : null;
  }

  toString() {
    return 'DataSourceParameter';
  }
}