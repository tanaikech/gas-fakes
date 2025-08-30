/**
 * @file Provides a fake implementation of the Paragraph class.
 */
import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { registerElement } from './elementRegistry.js';
import { getText, updateParagraphStyle } from './elementhelpers.js';
import { appendText, appendPageBreak, appendImage, insertImage, appendPositionedImage, insertPositionedImage } from './appenderhelpers.js';
import { signatureArgs } from '../../support/helpers.js';

/**
 * Creates a new proxied FakeParagraph instance.
 * @param {...any} args The arguments for the FakeParagraph constructor.
 * @returns {FakeParagraph} A new proxied FakeParagraph instance.
 */
export const newFakeParagraph = (...args) => {
  return Proxies.guard(new FakeParagraph(...args));
};

/**
 * A fake implementation of the Paragraph class for DocumentApp.
 * @class FakeParagraph
 * @extends {FakeContainerElement}
 * @see https://developers.google.com/apps-script/reference/document/paragraph
 */
export class FakeParagraph extends FakeContainerElement {
  /**
   * @param {import('./shadowdocument.js').ShadowDocument} shadowDocument The shadow document manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Gets the text content of the paragraph, flattening all child text elements.
   * @returns {string} The text content.
   * @see https://developers.google.com/apps-script/reference/document/paragraph#getText()
   */
  getText() {
    return getText(this);
  }

  appendText(textOrTextElement) { // eslint-disable-line no-unused-vars
    appendText(this, textOrTextElement);
    return this;
  }

  appendPageBreak(pageBreak) {
    return appendPageBreak(this, pageBreak);
  }

  appendInlineImage(image) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.appendInlineImage');
    if (nargs !== 1) matchThrow();
    return appendImage(this, image);
  }

  insertInlineImage(childIndex, image) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.insertInlineImage');
    if (nargs !== 2) matchThrow();
    return insertImage(this, childIndex, image);
  }

  appendPositionedImage(image) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.appendPositionedImage');
    if (nargs !== 1) matchThrow();
    return appendPositionedImage(this, image);
  }

  insertPositionedImage(childIndex, image) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.insertPositionedImage');
    if (nargs !== 2) matchThrow();
    return insertPositionedImage(this, childIndex, image);
  }

  /**
   * Returns the string "Paragraph".
   * @returns {string}
   */
  toString() {
    return 'Paragraph';
  }
}

registerElement('PARAGRAPH', newFakeParagraph);
