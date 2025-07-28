import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { registerElement } from './elementRegistry.js';
import { getText } from './shadowhelpers.js';

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
  constructor(structure, name) {
    super(structure, name);
  }
  /*
  The getText() method essentially 
  flattens the textual content of the element 
  and its direct text-containing children into a single string.
  */
  getText() {
    return getText(this)
  }

  toString() {
    return 'Paragraph';
  }
}

registerElement('PARAGRAPH', newFakeParagraph);