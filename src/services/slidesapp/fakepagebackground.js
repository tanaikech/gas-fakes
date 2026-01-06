import { Proxies } from '../../support/proxies.js';

export const newFakePageBackground = (...args) => {
  return Proxies.guard(new FakePageBackground(...args));
};

export class FakePageBackground {
  constructor(page) {
    this.__page = page;
  }
  get __resource() {
    return this.__page.__resource.pageBackgroundFill || null;
  }
  toString() {
    return 'PageBackground';
  }
}
