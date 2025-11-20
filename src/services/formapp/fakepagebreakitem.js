import { Proxies } from '../../support/proxies.js';
import { FakeFormItem } from './fakeformitem.js';
import { registerFormItem } from './formitemregistry.js';
import { ItemType, PageNavigationType } from '../enums/formsenums.js';

export const newFakePageBreakItem = (...args) => {
  return Proxies.guard(new FakePageBreakItem(...args));
};

/**
 * @class FakePageBreakItem
 * @see https://developers.google.com/apps-script/reference/forms/page-break-item
 */
export class FakePageBreakItem extends FakeFormItem {
  constructor(...args) {
    super(...args);
  }

  /**
   * Sets the page to navigate to when the user advances past this page.
   * @param {FakePageBreakItem | import('../formapp.js').PageNavigationType} navigation The navigation action.
   * @returns {FakePageBreakItem} The item, for chaining.
   */
  setGoToPage(navigation) {
    // There is no public Forms API endpoint to set the navigation for a PageBreakItem.
    // This method is therefore not implementable in the fake environment.
    throw new Error('setGoToPage is not supported for PageBreakItems via the public Google Forms API.');
  }

  /**
   * Gets the page-break item that this page break navigates to.
   * @returns {FakePageBreakItem | null} The page-break item, or null if the page does not navigate to a specific page.
   */
  getGoToPage() {
    // The API does not support setting a specific page destination for a page break.
    return null;
  }

  getPageNavigationType() {
    // Since navigation cannot be set via the API, the navigation type will always be the default.
    return PageNavigationType.CONTINUE;
  }

  /**
   * Returns the string "PageBreakItem" to identify the class.
   * @returns {string} The string "PageBreakItem".
   */
  toString() {
    return 'PageBreakItem';
  }
}

// Register the factory function for this item type.
registerFormItem(ItemType.PAGE_BREAK, newFakePageBreakItem);
