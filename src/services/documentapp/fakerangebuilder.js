import { Proxies } from '../../support/proxies.js';
import { newFakeRange } from './fakerange.js';
import { newFakeRangeElement } from './fakerangeelement.js';

/**
 * Creates a new FakeRangeBuilder instance.
 * @returns {FakeRangeBuilder} A new FakeRangeBuilder instance.
 */
export const newFakeRangeBuilder = (...args) => {
  return Proxies.guard(new FakeRangeBuilder(...args));
};

/**
 * A fake implementation of the RangeBuilder class for DocumentApp.
 * @see https://developers.google.com/apps-script/reference/document/range-builder
 */
class FakeRangeBuilder {
  constructor() {
    this.__elements = [];
  }

  /**
   * Adds an element to the range.
   * @param {import('./fakeelement').FakeElement} element - The element to add.
   * @returns {FakeRangeBuilder} The builder, for chaining.
   */
  addElement(element) {
    // A real implementation would need to validate the element.
    this.__elements.push(newFakeRangeElement(element, -1, -1));
    return this;
  }

  /**
   * Adds a range of elements to this range.
   * @param {import('./fakerange').FakeRange} range - The range to add.
   * @returns {FakeRangeBuilder} The builder, for chaining.
   */
  addRange(range) {
    const rangeElements = range.getRangeElements();
    this.__elements.push(...rangeElements);
    return this;
  }

  /**
   * Builds the range.
   * @returns {import('./fakerange').FakeRange} The built range.
   */
  build() {
    return newFakeRange(this.__elements);
  }

  /**
   * Gets the elements in the range.
   * @returns {Array<import('./fakerangeelement').FakeRangeElement>} The range elements.
   */
  getRangeElements() {
    return this.__elements;
  }

  toString() {
    return 'RangeBuilder';
  }
}