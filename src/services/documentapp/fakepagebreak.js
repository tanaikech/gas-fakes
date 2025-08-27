import { Proxies } from '../../support/proxies.js';
import { FakeElement } from './fakeelement.js';
import { registerElement } from './elementRegistry.js';

/**
 * Represents a page break. A PageBreak is a ParagraphElement. In the Apps Script model,
 * a paragraph containing only a page break is treated as a PageBreak element that is a
 * direct child of the Body.
 */
class FakePageBreak extends FakeElement {
  constructor(shadowDocument, name) {
    super(shadowDocument, name);
  }

  // A PageBreak contains no visible text.
  getText() {
    return '';
  }

  toString() {
    return 'PageBreak';
  }

  
}

export const newFakePageBreak = (...args) => Proxies.guard(new FakePageBreak(...args));

registerElement('PAGE_BREAK', newFakePageBreak);