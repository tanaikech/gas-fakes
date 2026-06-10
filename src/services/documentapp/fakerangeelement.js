/**
 * @file Provides a fake implementation of the RangeElement class.
 */

/**
 * A fake implementation of the RangeElement class.
 * @class
 * @implements {GoogleAppsScript.Document.RangeElement}
 * @see https://developers.google.com/apps-script/reference/document/range-element
 */
export class FakeRangeElement {
  constructor({ element, startOffset = -1, endOffsetInclusive = -1 }) {
    this.element = element;
    this.startOffset = startOffset;
    this.endOffsetInclusive = endOffsetInclusive;
  }

  /**
   * Gets the contained element.
   * @returns {GoogleAppsScript.Document.Element} The element.
   * @see https://developers.google.com/apps-script/reference/document/range-element#getElement()
   */
  getElement() {
    return this.element;
  }

  /**
   * Gets the position of the start of a partial range within the range element.
   * @returns {number} the index of the first character in the range, or -1
   */
  getStartOffset() {
    return this.startOffset;
  }

  /**
   * Gets the position of the end of a partial range within the range element.
   * @returns {number} the index of the last character in the range, or -1
   */
  getEndOffsetInclusive() {
    return this.endOffsetInclusive;
  }

  /**
   * Determines whether this range element covers the entire element or a partial selection.
   * @returns {boolean} true if the element is partially included
   */
  isPartial() {
    return this.startOffset !== -1 || this.endOffsetInclusive !== -1;
  }
}

/**
 * Creates a new fake RangeElement.
 * @param {object} properties The properties for the RangeElement.
 * @returns {FakeRangeElement} The new fake RangeElement.
 */
export const newFakeRangeElement = (properties) => new FakeRangeElement(properties);