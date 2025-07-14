import { Proxies } from '../../support/proxies.js';

/**
 * Creates a new FakeRange instance.
 * @param {Array<import('./fakerangeelement').FakeRangeElement>} rangeElements - The range elements.
 * @returns {FakeRange} A new FakeRange instance.
 */
export const newFakeRange = (...args) => {
  return Proxies.guard(new FakeRange(...args));
};

/**
 * A fake implementation of the Range class for DocumentApp.
 * @see https://developers.google.com/apps-script/reference/document/range
 */
class FakeRange {
  constructor(rangeElements) {
    this.__rangeElements = rangeElements || [];
  }

  /**
   * Gets the RangeElement objects that make up this range.
   * @returns {Array<import('./fakerangeelement').FakeRangeElement>} The range elements.
   */
  getRangeElements() {
    return this.__rangeElements;
  }

  toString() {
    return 'Range';
  }
}