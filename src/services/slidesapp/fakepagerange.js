import { Proxies } from '../../support/proxies.js';

/**
 * create a new FakePageRange instance
 * @param  {...any} args 
 * @returns {FakePageRange}
 */
export const newFakePageRange = (...args) => {
  return Proxies.guard(new FakePageRange(...args));
};

export class FakePageRange {
  constructor(pages) {
    this.__pages = pages;
  }

  /**
   * Returns the list of Page instances.
   * @returns {FakePage[]} The pages.
   */
  getPages() {
    return this.__pages;
  }

  toString() {
    return 'PageRange';
  }
}
