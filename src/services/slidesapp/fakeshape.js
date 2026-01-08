import { Proxies } from '../../support/proxies.js';
import { newFakeTextRange } from './faketextrange.js';
import { newFakeAutofit } from './fakeautofit.js';
import { newFakeConnectionSite } from './fakeconnectionsite.js';

export const newFakeShape = (...args) => {
  return Proxies.guard(new FakeShape(...args));
};

export class FakeShape {
  constructor(resource, page) {
    this.__id = resource.objectId;
    this.__page = page;
  }

  get __resource() {
    const pageResource = this.__page.__resource;
    // Depending on what 'page' is (Slide, Layout, Master)
    // The previous FakePageElement implementation looked in 'pageElements'.
    const element = (pageResource.pageElements || []).find(e => e.objectId === this.__id);
    if (!element) {
      throw new Error(`Shape with ID ${this.__id} not found on page`);
    }
    return element;
  }

  // Expose __presentation for TextRange to use
  get __presentation() {
    return this.__page.__presentation || this.__page.__slide?.__presentation;
    // If __page is Slide, it has __presentation.
    // If __page is Layout, it has __presentation.
  }

  getObjectId() {
    return this.__id;
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
