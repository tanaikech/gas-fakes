import { Proxies } from '../../support/proxies.js';

/**
 * A placeholder for fake Element classes.
 */
export class FakeElement {
  toString() {
    return 'Element';
  }
}

export const newFakeElement = (...args) => {
  return Proxies.guard(new FakeElement(...args));
};