/**
 * @file Provides a fake implementation of the Range class.
 */

import { newFakeRangeElement } from './fakerangeelement.js';

/**
 * A fake implementation of the Range class.
 * @class
 * @implements {GoogleAppsScript.Document.Range}
 * @see https://developers.google.com/apps-script/reference/document/range
 */
export class FakeRange {
  constructor({ elements }) {
    this.rangeElements = elements.map(element => newFakeRangeElement({ element }));
  }

  /**
   * Gets the elements that are contained in the range.
   * @returns {GoogleAppsScript.Document.RangeElement[]} The range elements.
   * @see https://developers.google.com/apps-script/reference/document/range#getRangeElements()
   */
  getRangeElements() {
    return this.rangeElements;
  }
}

/**
 * Creates a new fake Range.
 * @param {object} properties The properties for the Range.
 * @returns {FakeRange} The new fake Range.
 */
export const newFakeRange = (properties) => new FakeRange(properties);