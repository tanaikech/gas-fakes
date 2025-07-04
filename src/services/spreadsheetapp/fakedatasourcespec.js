import { Proxies } from '../../support/proxies.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';

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
    return notYetImplemented('DataSourceSpec.copy');
  }

  getBigQuerySpec() {
    return notYetImplemented('DataSourceSpec.getBigQuerySpec');
  }

  getParameters() {
    return notYetImplemented('DataSourceSpec.getParameters');
  }

  getType() {
    return notYetImplemented('DataSourceSpec.getType');
  }

  toString() {
    return 'DataSourceSpec';
  }
}