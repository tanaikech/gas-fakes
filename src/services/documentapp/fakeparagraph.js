import { Proxies } from '../../support/proxies.js';
import { FakeElement } from './fakeelement.js';

/**
 * Creates a new FakeParagraph instance.
 * @param {string} text - The paragraph text.
 * @returns {FakeParagraph} A new FakeParagraph instance.
 */
export const newFakeParagraph = (...args) => {
  return Proxies.guard(new FakeParagraph(...args));
};

/**
 * A fake implementation of the Paragraph class for DocumentApp.
 * @see https://developers.google.com/apps-script/reference/document/paragraph
 */
class FakeParagraph extends FakeElement {
  constructor(text) {
    super();
    this.__text = text;
  }

  /**
   * Gets the text content of the paragraph.
   * @returns {string} The text.
   */
  getText() {
    return this.__text;
  }

  toString() {
    return 'Paragraph';
  }
}