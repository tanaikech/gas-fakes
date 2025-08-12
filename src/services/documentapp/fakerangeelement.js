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
  constructor({ element }) {
    this.element = element;
  }

  /**
   * Gets the contained element.
   * @returns {GoogleAppsScript.Document.Element} The element.
   * @see https://developers.google.com/apps-script/reference/document/range-element#getElement()
   */
  getElement() {
    return this.element;
  }
}

/**
 * Creates a new fake RangeElement.
 * @param {object} properties The properties for the RangeElement.
 * @returns {FakeRangeElement} The new fake RangeElement.
 */
export const newFakeRangeElement = (properties) => new FakeRangeElement(properties);