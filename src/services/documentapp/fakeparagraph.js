/**
 * @file Provides a fake implementation of the Paragraph class.
 */
import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { getElementFactory, registerElement } from './elementRegistry.js';
import { getText } from './elementhelpers.js';
import { appendText, appendPageBreak, appendImage, insertImage, addPositionedImage } from './appenderhelpers.js';
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

  addPositionedImage(image) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.addPositionedImage');
    if (nargs !== 1) matchThrow();
    return addPositionedImage(this, image);
  }

  getPositionedImages() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.getPositionedImages');
    if (nargs !== 0) matchThrow();

    if (this.__isDetached) {
      // The live API would likely throw an error here.
      throw new Error('Cannot get positioned images from a detached paragraph.');
    }

    const paraItem = this.__elementMapItem;
    const paraElements = paraItem.paragraph?.elements || [];
    const imageFactory = getElementFactory('POSITIONED_IMAGE');

    return paraElements
      .filter(el => el.positionedObjectElement)
      .map(el => {
        if (!el.__name) {
          throw new Error('Internal error: Positioned image element in paragraph is missing its mapped name.');
        }
        return imageFactory(this.shadowDocument, el.__name);
      });
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
