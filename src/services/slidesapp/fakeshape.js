import { Proxies } from '../../support/proxies.js';
import { newFakeTextRange } from './faketextrange.js';
import { newFakeAutofit } from './fakeautofit.js';
import { newFakeConnectionSite } from './fakeconnectionsite.js';
import { FakePageElement, PageElementRegistry } from './fakepageelement.js';

export const newFakeShape = (...args) => {
  const shape = Proxies.guard(new FakeShape(...args));
  return shape;
};

PageElementRegistry.newFakeShape = newFakeShape;

export class FakeShape extends FakePageElement {
  constructor(resource, page) {
    super(resource, page);
  }

  // Expose __presentation for TextRange to use
  get __presentation() {
    return this.__page.__presentation || this.__page.__slide?.__presentation;
  }

  /**
   * Gets the text range of the shape.
   * @returns {FakeTextRange} The text range.
   */
  getText() {
    return newFakeTextRange(this);
  }

  getAutofit() {
    return newFakeAutofit(this);
  }

  /**
   * Gets the connection sites on the shape.
   * @returns {FakeConnectionSite[]} The connection sites.
   */
  getConnectionSites() {
    // Standard shapes usually have 4 connection sites (top, right, bottom, left).
    // For now, let's return a fixed number as a mock.
    return [0, 1, 2, 3].map(index => newFakeConnectionSite(this, index));
  }

  toString() {
    return 'Shape';
  }
}
