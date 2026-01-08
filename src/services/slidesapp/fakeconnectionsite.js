import { Proxies } from '../../support/proxies.js';

export const newFakeConnectionSite = (...args) => {
  return Proxies.guard(new FakeConnectionSite(...args));
};

export class FakeConnectionSite {
  constructor(pageElement, index) {
    this.__pageElement = pageElement;
    this.__index = index;
  }

  getIndex() {
    return this.__index;
  }

  getPageElement() {
    return this.__pageElement;
  }

  toString() {
    return 'ConnectionSite';
  }
}
