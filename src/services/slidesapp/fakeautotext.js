import { Proxies } from '../../support/proxies.js';

export const newFakeAutoText = (...args) => {
  return Proxies.guard(new FakeAutoText(...args));
};

export class FakeAutoText {
  constructor(range, type, index) {
    this.__range = range;
    this.__type = type;
    this.__index = index;
  }

  getIndex() {
    return this.__index;
  }

  getRange() {
    return this.__range;
  }

  getAutoTextType() {
    return this.__type;
  }

  toString() {
    return 'AutoText';
  }
}
