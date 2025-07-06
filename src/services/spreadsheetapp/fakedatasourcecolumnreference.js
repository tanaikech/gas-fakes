import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';

/**
 * @returns {FakeDataSourceColumnReference}
 */
export const newFakeDataSourceColumnReference = (...args) => {
  return Proxies.guard(new FakeDataSourceColumnReference(...args));
};

export class FakeDataSourceColumnReference {
  constructor(apiRef) {
    this.__apiRef = apiRef || {};
  }

  getColumnName() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DataSourceColumnReference.getColumnName');
    if (nargs) matchThrow();
    return this.__apiRef.name || null;
  }

  toString() {
    return 'DataSourceColumnReference';
  }
}