import { Proxies } from '../../support/proxies.js';
import { PageNavigationType, ItemType } from '../enums/formsenums.js';
import { newFakePageBreakItem } from './fakepagebreakitem.js';

export const newFakeChoice = (...args) => {
  return Proxies.guard(new FakeChoice(...args));
};

/**
 * @class FakeChoice
 * A fake for the Choice class in Apps Script.
 * @see https://developers.google.com/apps-script/reference/forms/choice
 */
export class FakeChoice {
  constructor(value, navType, pageId, form, parentItemType) {
    this.__value = value;
    this.__navType = navType;
    this.__pageId = pageId;
    this.__form = form;
    this.__parentItemType = parentItemType;
  }

  getValue() {
    return this.__value;
  }

  /**
   * Gets the page navigation type for this choice.
   * @returns {import('../enums/formsenums.js').PageNavigationType | null} The page navigation type, or null if no navigation is set.
   */
  getPageNavigationType() {
    if (this.__navType) {
      // The navType is stored as a string like 'goToPage' or 'CONTINUE'.
      // We need to return the corresponding enum value.
      const navEnum = PageNavigationType[this.__navType.toUpperCase()];
      return navEnum || null;
    }
    return null;
  }

  /**
   * Gets the page-break item that this choice navigates to.
   * @returns {import('./fakepagebreakitem.js').FakePageBreakItem | null} The page-break item, or null if the choice does not navigate to a page.
   */
  getGoToPage() {
    // Per live documentation, this method only applies to choices from a MultipleChoiceItem.
    if (this.__parentItemType !== ItemType.MULTIPLE_CHOICE) {
      throw new TypeError('getGoToPage is not a function');
    }

    if (this.__navType === 'GO_TO_PAGE' && this.__pageId && this.__form) {
      // We need the form context to find the item by its ID.
      const item = this.__form.getItemById(this.__pageId);
      return item ? item.asPageBreakItem() : null;
    }
    return null;
  }

  toString() {
    return 'Choice';
  }
}