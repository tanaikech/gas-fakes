import { Proxies } from '../../../support/proxies.js';
import { ShadowContainer } from './container.js';

export const newShadowParagraph = (...args) => {
  return Proxies.guard(new ShadowParagraph(...args));
};

class ShadowParagraph extends ShadowContainer {
  constructor(shadowDocument, se) {
    // The container for a paragraph is the paragraph object from the SE
    // which contains the 'elements' array.
    super(shadowDocument, se.paragraph);
    this.__se = se;
  }

  get content() {
    return this.__container.elements || [];
  }

  get containerType() {
    return 'PARAGRAPH';
  }
}