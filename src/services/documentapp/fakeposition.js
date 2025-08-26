/**
 * @file Provides a fake implementation of the Position class.
 */
import { Proxies } from '../../support/proxies.js';
import { signatureArgs, notYetImplemented } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;

export const newFakePosition = (...args) => {
  return Proxies.guard(new FakePosition(...args));
};

/**
 * A fake implementation of the Position class for DocumentApp.
 * @class FakePosition
 * @implements {GoogleAppsScript.Document.Position}
 * @see https://developers.google.com/apps-script/reference/document/position
 */
class FakePosition {
  /**
   * @param {GoogleAppsScript.Document.Element} element The element to position relative to.
   * @param {number} offset The character offset from the start of the element.
   * @private
   */
  constructor(element, offset) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Position');
    if (nargs !== 2 || !is.object(element) || !is.integer(offset)) matchThrow();

    this.__element = element;
    this.__offset = offset;
  }

  /**
   * Gets the element that the position is relative to.
   * @returns {GoogleAppsScript.Document.Element} The element.
   */
  getElement() {
    return this.__element;
  }

  /**
   * Gets the character offset from the start of the element.
   * @returns {number} The offset.
   */
  getOffset() {
    return this.__offset;
  }

  getSurroundingText() {
    return notYetImplemented('Position.getSurroundingText');
  }

  getSurroundingTextOffset() {
    return notYetImplemented('Position.getSurroundingTextOffset');
  }

  insertBookmark() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Position.insertBookmark');
    if (nargs !== 0) matchThrow();

    const element = this.getElement();
    if (element.__isDetached) {
      throw new Error('Cannot insert a bookmark relative to a detached element.');
    }
    const doc = element.getDocument();
    if (!doc) {
      throw new Error('Could not retrieve the document from the element.');
    }
    return doc.addBookmark(this);
  }

  insertInlineImage(image) {
    return notYetImplemented('Position.insertInlineImage');
  }

  insertText(text) {
    return notYetImplemented('Position.insertText');
  }

  toString() {
    return 'Position';
  }
}

