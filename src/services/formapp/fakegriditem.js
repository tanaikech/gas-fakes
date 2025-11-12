import { Proxies } from '../../support/proxies.js';
import { FakeFormItem } from './fakeformitem.js';
import { registerFormItem } from './formitemregistry.js';
import { ItemType } from '../enums/formsenums.js';

export const newFakeGridItem = (...args) => {
  return Proxies.guard(new FakeGridItem(...args));
};

/**
 * @class FakeGridItem
 * A fake for the GridItem class in Apps Script.
 * @see https://developers.google.com/apps-script/reference/forms/grid-item
 */
export class FakeGridItem extends FakeFormItem {
  constructor(form, itemId) {
    super(form, itemId);
  }

  toString() {
    return 'GridItem';
  }
}

registerFormItem(ItemType.GRID, newFakeGridItem);