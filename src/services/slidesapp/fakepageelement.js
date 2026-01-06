import { Proxies } from '../../support/proxies.js';

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
  toString() {
    return 'PageElement';
  }
}
