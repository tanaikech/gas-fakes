/**
 * @file Provides a fake implementation of the RangeBuilder class.
 */

import { newFakeRange } from './fakerange.js';

/**
 * A fake implementation of the RangeBuilder class.
 * @class
 * @implements {GoogleAppsScript.Document.RangeBuilder}
 * @see https://developers.google.com/apps-script/reference/document/range-builder
 */
export class FakeRangeBuilder {
  constructor() {
    this.elements = [];
  }

  /**
   * Adds an element to the range.
   * @param {GoogleAppsScript.Document.Element} element The element to add.
   * @returns {GoogleAppsScript.Document.RangeBuilder} The builder, for chaining.
   * @see https://developers.google.com/apps-script/reference/document/range-builder#addElement(Element)
   */
  addElement(element) {
    this.elements.push(element);
    return this;
  }

  /**
   * Adds a range of elements to this range.
   * @param {GoogleAppsScript.Document.Range} range The range to add.
   * @returns {GoogleAppsScript.Document.RangeBuilder} The builder, for chaining.
   * @see https://developers.google.com/apps-script/reference/document/range-builder#addRange(Range)
   */
  addRange(range) {
    this.elements.push(...range.getRangeElements().map(re => re.getElement()));
    return this;
  }

  /**
   * Builds the range.
   * @returns {GoogleAppsScript.Document.Range} The built range.
   * @see https://developers.google.com/apps-script/reference/document/range-builder#build()
   */
  build() {
    return newFakeRange({ elements: this.elements });
  }
}

/**
 * Creates a new fake RangeBuilder.
 * @returns {FakeRangeBuilder} The new fake RangeBuilder.
 */
export const newFakeRangeBuilder = () => new FakeRangeBuilder();