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
export class FakeParagraph extends FakeElement {
  constructor(text) {
    super();
    this.__text = text;
  }

  /**
   * Creates and returns a new copy of this element.
   * @returns {FakeParagraph} A new, detached copy of this element.
   */
  copy() {
    // The new paragraph is a detached copy. In our simple fake,
    // this means just creating a new instance with the same text.
    return newFakeParagraph(this.__text);
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