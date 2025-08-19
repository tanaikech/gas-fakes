/**
 * @file Provides a fake implementation of the Paragraph class.
 */
import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { registerElement } from './elementRegistry.js';
import { getText } from './elementhelpers.js';
import { appendText, appendPageBreak } from './appenderhelpers.js';


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
   * @param {object} structure The document structure manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(structure, nameOrItem) {
    super(structure, nameOrItem);
  }

  /**
   * Gets the text content of the paragraph, flattening all child text elements.
   * @returns {string} The text content.
   * @see https://developers.google.com/apps-script/reference/document/paragraph#getText()
   */
  getText() {
    return getText(this);
  }

  appendText(textOrTextElement) {
    return appendText(this, textOrTextElement)
  }

  appendPageBreak(pageBreak) {
    return appendPageBreak(this, pageBreak || null);
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