import { Proxies } from '../../support/proxies.js';
import { FakeElement } from './fakeelement.js';
import { registerElement } from './elementRegistry.js';
// NONE OF THIS WORKS YET
// TODO - when this issue is resolved https://issuetracker.google.com/issues/437825936 revisit
/**
 * Represents a horizontal rule. A HorizontalRule is a ParagraphElement. In the Apps Script model,
 * a paragraph containing only a horizontal rule is treated as a HorizontalRule element that is a
 * direct child of the Body or other container.
 */
class FakeHorizontalRule extends FakeElement {
  constructor(shadowDocument, name) {
    super(shadowDocument, name);
  }

  // A HorizontalRule contains no visible text.
  getText() {
    return '';
  }

  toString() {
    return 'HorizontalRule';
  }
}

export const newFakeHorizontalRule = (...args) => Proxies.guard(new FakeHorizontalRule(...args));

registerElement('HORIZONTAL_RULE', newFakeHorizontalRule);