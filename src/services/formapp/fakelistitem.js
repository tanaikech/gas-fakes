import { Proxies } from '../../support/proxies.js';
import { FakeFormItem } from './fakeformitem.js';
import { newFakeChoice } from './fakechoice.js';
import { registerFormItem } from './formitemregistry.js';
import { ItemType } from '../enums/formsenums.js';

export const newFakeListItem = (...args) => {
  return Proxies.guard(new FakeListItem(...args));
};

/**
 * @class FakeListItem
 * @see https://developers.google.com/apps-script/reference/forms/list-item
 */
export class FakeListItem extends FakeFormItem {
  constructor(...args) {
    super(...args);
  }

  /**
   * Creates a new choice for this item.
   * @param {string} value The value for the new choice.
   * @param {import('./pagebreakitem.js').FakePageBreakItem | import('../formapp.js').PageNavigationType} navigation The navigation action.
   * @returns {import('./fakechoice.js').FakeChoice} The new choice.
   */
  createChoice(value, navigation) {
    // In the real API, this creates a Choice object that is not yet attached.
    // For the fake, we can create and return a representation of it.
    if (navigation) {
      let navType;
      let pageId;
      if (typeof navigation.getId === 'function') {
        // It's a PageBreakItem object
        navType = 'GO_TO_PAGE';
        pageId = navigation.getId();
      } else {
        // It's a PageNavigationType enum value
        navType = navigation.toString().toUpperCase();
      }
      return newFakeChoice(value, navType, pageId, this.__form, this.getType());
    }

    return newFakeChoice(value, null, null, this.__form, this.getType());
  }

  /**
   * Gets the choices for this item.
   * @returns {import('./fakechoice.js').FakeChoice[]} The choices.
   */
  getChoices() {
    const options = this.__resource.questionItem?.question?.choiceQuestion?.options || [];
    return options.map(option => {
      let navType = null;
      let pageId = null;

      // Translate from API format back to Apps Script format.
      if (option.goToSectionId) {
        navType = 'GO_TO_PAGE';
        pageId = option.goToSectionId;
      } else if (option.goToAction) {
        switch (option.goToAction) {
          case 'NEXT_SECTION': navType = 'CONTINUE'; break;
          case 'RESTART_FORM': navType = 'RESTART'; break;
          case 'SUBMIT_FORM': navType = 'SUBMIT'; break;
        }
      }
      return newFakeChoice(option.value, navType, pageId, this.__form, this.getType());
    });
  }
  /**
   * Sets the choices for the item.
   * @param {import('./fakechoice.js').FakeChoice[]} choices The choices to set.
   * @returns {FakeListItem} The item, for chaining.
   */
  setChoices(choices) {
    // The Forms API expects an array of {value: string}, not FakeChoice objects.
    // We need to map the array of FakeChoice objects to the correct format.
    const options = choices.map(choice => {
      const option = { value: choice.getValue() };
      // The FakeChoice object stores these as internal properties.
      // We need to translate from Apps Script enums to the Forms API enums.
      if (choice.__navType) {
        const navType = choice.__navType.toUpperCase();
        switch (navType) {
          case 'GO_TO_PAGE':
            // For navigating to a specific page, you ONLY set the goToSectionId.
            // The goToAction field should be omitted.
            option.goToSectionId = choice.__pageId;
            break;
          case 'CONTINUE':
            option.goToAction = 'NEXT_SECTION';
            break;
          default:
            option.goToAction = navType; // For RESTART_FORM, SUBMIT_FORM
            break;
        }
      }
      return option;
    });
    const updateRequest = {
      updateItem: {
        item: {
          // The item payload should contain the questionItem directly,
          // not nested within another 'question' object.
          questionItem: { question: { choiceQuestion: { type: 'DROP_DOWN', options } } }
        },
        location: { index: this.getIndex() },
        updateMask: 'questionItem.question.choiceQuestion',
      },
    };
    return this.__update(updateRequest);
  }

  /**
   * Gets the ID of the item.
   * @returns {Integer} The item's ID.
   */
  getId() {
    return this.__id;
  }

  /**
   * Returns the string "ListItem" to identify the class.
   * @returns {string} The string "ListItem".
   */
  toString() {
    return 'ListItem';
  }
}

// Register the factory function for this item type.
registerFormItem(ItemType.LIST, newFakeListItem);