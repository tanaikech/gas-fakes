import { Proxies } from '../../support/proxies.js';
import { newFakeParagraph } from './fakeparagraph.js';

export const newFakeTextRange = (...args) => {
  return Proxies.guard(new FakeTextRange(...args));
};

export class FakeTextRange {
  constructor(shape, startIndex = null, endIndex = null) {
    this.__shape = shape;
    // APIs use 0-based index? Apps Script TextRange uses indices?
    // If null, represents the entire text.
    this.__startIndex = startIndex;
    this.__endIndex = endIndex;
  }

  get __resource() {
    return this.__shape.__resource.shape.text || {};
  }

  getStartIndex() {
    // If indices are null, it starts at 0?
    return this.__startIndex !== null ? this.__startIndex : 0;
  }

  getEndIndex() {
    // If indices are null, it ends at full length?
    // Caution: If we haven't computed length...
    // But usually FakeTextRange is created with explicit indices by getParagraphs.
    // If created without indices (full range), we need to calculate length.
    if (this.__endIndex !== null) return this.__endIndex;
    return this.asString().length;
  }

  /**
   * Gets the rendered string of the text range.
   * @returns {string} The text.
   */
  asString() {
    const textElements = this.__resource.textElements || [];
    let fullText = textElements.map(te => te.textRun ? te.textRun.content : '').join('');

    // If indices are provided, slice the text.
    // We assume indices are 0-based relative to the start of the SHAPE text (if referencing shape).

    if (this.__startIndex !== null && this.__endIndex !== null) {
      // Ensure indices are within bounds? Or just slice.
      fullText = fullText.slice(this.__startIndex, this.__endIndex);
    } else if (this.__startIndex !== null) {
      fullText = fullText.slice(this.__startIndex);
    }

    return fullText;
  }

  asRenderedString() {
    return this.asString();
  }

  /**
   * Sets the text content.
   * @param {string} newText The new text.
   * @returns {FakeTextRange} This range.
   */
  setText(newText) {
    const objectId = this.__shape.getObjectId();
    const presentationId = this.__shape.__presentation.getId();

    const requests = [];

    const currentText = this.asString();

    if (currentText.length > 0) {
      requests.push({
        deleteText: {
          objectId: objectId,
          textRange: {
            type: 'FROM_START_INDEX',
            startIndex: 0
          }
        }
      });
    }

    if (newText) {
      // Apps Script shapes always end with a newline.
      // If we insert text that ends with a newline, we get double newline (one explicit, one implicit).
      // To match expected behavior where setText("A\n") results in "A" (plus implicit \n),
      // or at least doesn't create "A\n\n", we should strip the trailing newline.

      if (newText.endsWith('\n')) {
        newText = newText.slice(0, -1);
      }

      requests.push({
        insertText: {
          objectId: objectId,
          insertionIndex: 0,
          text: newText
        }
      });
    }

    if (requests.length > 0) {
      Slides.Presentations.batchUpdate(requests, presentationId);
    }

    return this;
  }

  clear() {
    return this.setText('');
  }

  /**
   * Gets the paragraphs in the text range.
   * @returns {FakeParagraph[]} The paragraphs.
   */
  getParagraphs() {
    const fullText = this.asString();
    if (fullText.length === 0) return [];

    const paragraphs = [];
    let startIndex = 0;

    let currentIndex = 0;
    let paragraphIndex = 0;

    while (currentIndex < fullText.length) {
      const nextNewline = fullText.indexOf('\n', currentIndex);
      let endIndex;

      if (nextNewline === -1) {
        endIndex = fullText.length;
      } else {
        endIndex = nextNewline + 1; // Include the newline
      }

      if (startIndex + currentIndex >= startIndex + endIndex) {
        // Empty segment
        if (endIndex === fullText.length) break; // Trailing empty
      }

      const range = newFakeTextRange(this.__shape, startIndex + currentIndex, startIndex + endIndex);
      paragraphs.push(newFakeParagraph(range, paragraphIndex++));

      currentIndex = endIndex;
    }

    return paragraphs;
  }

  isEmpty() {
    return this.asString().length === 0;
  }

  toString() {
    return 'TextRange';
  }
}
