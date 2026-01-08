import { Proxies } from '../../support/proxies.js';
import { newFakeShape } from './fakeshape.js';
import { newFakeConnectionSite } from './fakeconnectionsite.js';
import { newFakeLine } from './fakeline.js';

export const newFakePageElement = (...args) => {
  return Proxies.guard(new FakePageElement(...args));
};

export class FakePageElement {
  constructor(resource, page) {
    this.__id = resource.objectId;
    this.__page = page;
  }

  get __resource() {
    const pageResource = this.__page.__resource;
    const element = (pageResource.pageElements || []).find(e => e.objectId === this.__id);
    if (!element) {
      throw new Error(`PageElement with ID ${this.__id} not found on page`);
    }
    return element;
  }

  getObjectId() {
    return this.__id;
  }

  /**
   * Returns the page element as a shape.
   * @returns {FakeShape} The shape.
   */
  asShape() {
    if (this.__resource.shape) {
      return newFakeShape(this.__resource, this.__page);
    }
    throw new Error('PageElement is not a shape.');
  }

  /**
   * Returns the page element as a line.
   * @returns {FakeLine} The line.
   */
  asLine() {
    if (this.__resource.line) {
      return newFakeLine(this.__resource, this.__page);
    }
    throw new Error('PageElement is not a line.');
  }

  /**
   * Gets the type of the page element.
   * @returns {SlidesApp.PageElementType} The type.
   */
  getPageElementType() {
    if (this.__resource.shape) {
      return 'SHAPE';
    }
    if (this.__resource.line) {
      return 'LINE';
    }
    return 'UNSUPPORTED';
  }

  /**
   * Gets the connection sites on the page element.
   * @returns {FakeConnectionSite[]} The connection sites.
   */
  getConnectionSites() {
    // Standard shapes usually have 4 connection sites (top, right, bottom, left).
    // For now, let's return a fixed number as a mock.
    return [0, 1, 2, 3].map(index => newFakeConnectionSite(this, index));
  }
  toString() {
    return 'PageElement';
  }
}
