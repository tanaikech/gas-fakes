import { Proxies } from '../../support/proxies.js';
import { newFakeShape } from './fakeshape.js';

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
   * Gets the type of the page element.
   * @returns {SlidesApp.PageElementType} The type.
   */
  getPageElementType() {
    if (this.__resource.shape) {
      return 'SHAPE'; // Simplified string, real enum needed?
      // SlidesApp.PageElementType.SHAPE
      // If we need strict enum, we need to import or mock it.
      // For now returning string might check if 'SHAPE' matches generic enum usage.
    }
    return 'UNSUPPORTED';
  }
  toString() {
    return 'PageElement';
  }
}
