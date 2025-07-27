import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';


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
  constructor(structure,name) {
    super(structure,name);
  }

  toString() {
    return 'Paragraph';
  }
}