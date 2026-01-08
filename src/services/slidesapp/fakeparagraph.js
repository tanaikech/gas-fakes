import { Proxies } from '../../support/proxies.js';
import { newFakeTextRange } from './faketextrange.js';

export const newFakeParagraph = (...args) => {
  return Proxies.guard(new FakeParagraph(...args));
};

export class FakeParagraph {
  constructor(textRange, index) {
    this.__textRange = textRange;
    this.__index = index;
    // We might need start/end indices relative to the shape's full text
    // The textRange passed here might be the specific range FOR this paragraph?
    // Or the parent range?
    // Usually getParagraphs returns a list of Paragraph objects.
    // Each Paragraph wraps a TextRange?
    // Docs say Paragraph.getRange() returns a TextRange.
    // So Paragraph IS NOT a TextRange, but has one.
  }

  /**
   * Gets the index of the paragraph.
   * @returns {number} The index.
   */
  getIndex() {
    // Based on Live Apps Script behavior, getIndex() returns the index of the paragraph's terminating character (newline).
    // Use the end index of the text range minus 1.
    const range = this.getRange();
    // Assuming range.getEndIndex() returns the exclusive end index.
    return range.getEndIndex() - 1;
  }

  /**
   * Gets the text range covering this paragraph.
   * @returns {FakeTextRange} The text range.
   */
  getRange() {
    return this.__textRange;
  }



  toString() {
    return 'Paragraph';
  }
}
