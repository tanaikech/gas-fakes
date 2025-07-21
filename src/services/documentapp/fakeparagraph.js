import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { ElementType, ParagraphHeading } from '../enums/docsenums.js';
import { unimplementedProps, signatureArgs } from '../../support/helpers.js';

const propsWaitingRoom = [
  'addPositionedImage', 'appendHorizontalRule', 'appendInlineImage', 'appendPageBreak', 'appendText', 'clear',
  'editAsText', 'findElement', 'findText', 'getAlignment', 'getAttributes',  'getChild',
  'getChildIndex', 'getHeading', 'getIndentEnd', 'getIndentFirstLine',
  'getIndentStart', 'getLineSpacing', 'getLinkUrl', 'getNextSibling', 'getPositionedImage', 'getPositionedImages', 'getPreviousSibling', 'getSpacingAfter',
  'getSpacingBefore', 'getTextAlignment', 'insertHorizontalRule', 'insertInlineImage', 'insertPageBreak', 'insertText',
   'merge', 'removeChild',
  'removeFromParent', 'removePositionedImage', 'replaceText', 'setAlignment', 'setAttributes', 'setHeading',
   'setIndentEnd', 'setIndentFirstLine',
  'setIndentStart',  'setLeftToRight', 'setLineSpacing', 'setLinkUrl', 'setSpacingAfter',
  'setSpacingBefore',  'setText', 'setTextAlignment'
];

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
export class FakeParagraph extends FakeContainerElement {
  constructor(text, parent, se) {
    super(parent, se);
    this.__text = text || '';
    this.__heading = ParagraphHeading.NORMAL;
    unimplementedProps(this, propsWaitingRoom);
  }

  /**
   * Returns this element as a Paragraph.
   * @returns {FakeParagraph} The element as a Paragraph.
   */
  asParagraph() {
    return this;
  }

  /**
   * Creates and returns a new copy of this element.
   * @returns {FakeParagraph} A new, detached copy of this element.
   */
  copy() {
    // The new paragraph is a detached copy. In our simple fake,
    // this means just creating a new instance with the same text and no parent.
    return newFakeParagraph(this.getText(), null, JSON.parse(JSON.stringify(this.__se)));
  }

  /**
   * Gets the text content of the paragraph.
   * @returns {string} The text.
   */
  getText() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.getText');
    if (nargs !== 0) matchThrow();
    return this.__text;
  }

  /**
   * Gets the paragraph's heading type.
   * @returns {GoogleAppsScript.Document.ParagraphHeading} The heading type.
   */
  getHeading() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.getHeading');
    if (nargs !== 0) matchThrow();
    return this.__heading;
  }

  /**
   * Sets the paragraph's heading type.
   * @param {GoogleAppsScript.Document.ParagraphHeading} heading - The new heading type.
   * @returns {FakeParagraph} The paragraph, for chaining.
   */
  setHeading(heading) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.setHeading');
    if (nargs !== 1 || !Object.values(ParagraphHeading).includes(heading)) {
      matchThrow();
    }
    this.__heading = heading;
    return this;
  }

  toString() {
    return 'Paragraph';
  }
}