import { Proxies } from '../../support/proxies.js';
import { FakeFormItem } from './fakeformitem.js';

export const newFakeTextItem = (...args) => {
  return Proxies.guard(new FakeTextItem(...args));
};

/**
 * @class FakeTextItem
 * @see https://developers.google.com/apps-script/reference/forms/text-item
 */
export class FakeTextItem extends FakeFormItem {
  constructor(...args) {
    super(...args);
  }

  toString() {
    return 'TextItem';
  }
}