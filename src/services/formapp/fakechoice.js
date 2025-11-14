import { Proxies } from '../../support/proxies.js';

export const newFakeChoice = (...args) => {
  return Proxies.guard(new FakeChoice(...args));
};

/**
 * @class FakeChoice
 * A fake for the Choice class in Apps Script.
 * @see https://developers.google.com/apps-script/reference/forms/choice
 */
export class FakeChoice {
  constructor(value) {
    this.__value = value;
  }

  getValue() {
    return this.__value;
  }

  toString() {
    return 'Choice';
  }
}