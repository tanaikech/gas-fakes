import { Proxies } from '../../support/proxies.js';
import { FakeElement } from './fakeelement.js';
import { registerElement } from './elementRegistry.js';

/**
 * A fake implementation of the Text class for DocumentApp.
 * @see https://developers.google.com/apps-script/reference/document/text
 */
class FakeText extends FakeElement {
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Gets the text contents of the element.
   * @returns {string} The text contents.
   */
  getText() {
    const item = this.__elementMapItem;
    // A Text element corresponds to a textRun in the API.
    return item.textRun?.content || '';
  }

  toString() {
    return 'Text';
  }
}

export const newFakeText = (...args) => Proxies.guard(new FakeText(...args));

registerElement('TEXT', newFakeText);