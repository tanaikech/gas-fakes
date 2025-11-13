import { Proxies } from '../../support/proxies.js';
import { FakeFormItem } from './fakeformitem.js';
import { registerFormItem } from './formitemregistry.js';
import { ItemType } from '../enums/formsenums.js';

export const newFakeSectionHeaderItem = (...args) => {
  return Proxies.guard(new FakeSectionHeaderItem(...args));
};

/**
 * @class FakeSectionHeaderItem
 * A fake for the SectionHeaderItem class in Apps Script.
 * @see https://developers.google.com/apps-script/reference/forms/section-header-item
 */
export class FakeSectionHeaderItem extends FakeFormItem {
  constructor(form, itemId) {
    super(form, itemId);
  }

  toString() {
    return 'SectionHeaderItem';
  }
}

registerFormItem(ItemType.SECTION_HEADER, newFakeSectionHeaderItem);