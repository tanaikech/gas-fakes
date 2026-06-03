import { Proxies } from '../../support/proxies.js';

/**
 * create a new FakePageElementRange instance
 * @param  {...any} args 
 * @returns {FakePageElementRange}
 */
export const newFakePageElementRange = (...args) => {
  return Proxies.guard(new FakePageElementRange(...args));
};

export class FakePageElementRange {
  constructor(elements) {
    this.__elements = elements;
  }

  /**
   * Returns the list of PageElement instances.
   * @returns {FakePageElement[]} The page elements.
   */
  getPageElements() {
    return this.__elements;
  }

  toString() {
    return 'PageElementRange';
  }
}
