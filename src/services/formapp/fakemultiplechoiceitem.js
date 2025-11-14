import { Proxies } from '../../support/proxies.js';
import { FakeChoiceItem } from './fakechoiceitem.js';
import { registerFormItem } from './formitemregistry.js';
import { ItemType } from '../enums/formsenums.js';

export const newFakeMultipleChoiceItem = (form, itemId) => {
  return Proxies.guard(new FakeMultipleChoiceItem(form, itemId));
};

/**
 * @class FakeMultipleChoiceItem
 * A fake for the MultipleChoiceItem class in Apps Script.
 * @see https://developers.google.com/apps-script/reference/forms/multiple-choice-item
 */
export class FakeMultipleChoiceItem extends FakeChoiceItem {
  constructor(form, itemId) {
    super(form, itemId);
  }
  toString() {
    return 'MultipleChoiceItem';
  }
}

// Register the factory function for this item type.
registerFormItem(ItemType.MULTIPLE_CHOICE, newFakeMultipleChoiceItem);