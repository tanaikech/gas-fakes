import { Proxies } from '../../support/proxies.js';

/**
 * Creates a new FakeRangeElement instance.
 * @param {import('./fakeelement').FakeElement} element - The element.
 * @param {number} startOffset - The start offset.
 * @param {number} endOffsetInclusive - The end offset.
 * @returns {FakeRangeElement} A new FakeRangeElement instance.
 */
export const newFakeRangeElement = (...args) => {
  return Proxies.guard(new FakeRangeElement(...args));
};

/**
 * A fake implementation of the RangeElement class for DocumentApp.
 * @see https://developers.google.com/apps-script/reference/document/range-element
 */
class FakeRangeElement {
  constructor(element, startOffset, endOffsetInclusive) {
    this.__element = element;
    this.__startOffset = startOffset;
    this.__endOffsetInclusive = endOffsetInclusive;
  }

  /**
   * Gets the contained Element.
   * @returns {import('./fakeelement').FakeElement} The element.
   */
  getElement() {
    return this.__element;
  }

  /**
   * Gets the start offset of the contained element.
   * @returns {number} The start offset.
   */
  getStartOffset() {
    return this.__startOffset;
  }

  /**
   * Gets the end offset of the contained element.
   * @returns {number} The end offset.
   */
  getEndOffsetInclusive() {
    return this.__endOffsetInclusive;
  }

  /**
   * Determines whether the element is a partial selection.
   * @returns {boolean} True if the element is a partial selection.
   */
  isPartial() {
    // A simple check. A full implementation would need to know the element's length.
    return this.__startOffset !== -1 || this.__endOffsetInclusive !== -1;
  }

  toString() {
    return 'RangeElement';
  }
}