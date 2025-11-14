import { Proxies } from '../../support/proxies.js';
import { FakeChoiceItem } from './fakechoiceitem.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { registerFormItem } from './formitemregistry.js';
import { newFakeChoice } from './fakechoice.js';
import { ItemType } from '../enums/formsenums.js';

export const newFakeCheckboxItem = (...args) => {
  return Proxies.guard(new FakeCheckboxItem(...args));
};

/**
 * @class FakeCheckboxItem
 * A fake for the CheckboxItem class in Apps Script.
 * @see https://developers.google.com/apps-script/reference/forms/checkbox-item
 */
export class FakeCheckboxItem extends FakeChoiceItem {
  /**
   * @param {import('./fakeform.js').FakeForm} form The parent form.
   * @param {string} itemId The ID of the item.
   */
  constructor(form, itemId) {
    super(form, itemId);
  }

  toString() {
    return 'CheckboxItem';
  }
}

// Register the factory function for this item type.
registerFormItem(ItemType.CHECKBOX, newFakeCheckboxItem);
