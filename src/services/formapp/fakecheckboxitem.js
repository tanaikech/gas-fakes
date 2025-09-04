import { Proxies } from '../../support/proxies.js';
import { FakeFormItem } from './fakeformitem.js';
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
export class FakeCheckboxItem extends FakeFormItem {
  /**
   * @param {import('./fakeform.js').FakeForm} form The parent form.
   * @param {string} itemId The ID of the item.
   */
  constructor(form, itemId) {
    super(form, itemId);
  }

  /**
   * Creates a new choice for this item.
   * @param {string} value The value of the choice.
   * @param {boolean} [isCorrect] Whether the choice is correct.
   * @returns {import('./fakechoice.js').FakeChoice} The new choice.
   */
  createChoice(value, isCorrect) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'CheckboxItem.createChoice');
    if (nargs < 1 || nargs > 2 || !is.string(value) || (nargs === 2 && !is.boolean(isCorrect))) {
      matchThrow('Invalid arguments');
    }
    // For now, navigation is not supported.
    return newFakeChoice(value, isCorrect || false, null, null);
  }

  /**
   * Gets the choices for this item.
   * @returns {import('./fakechoice.js').FakeChoice[]} An array of Choice objects.
   */
  getChoices() {
    const choiceQuestion = this.__resource.questionItem?.question?.choiceQuestion;
    if (!choiceQuestion || !choiceQuestion.options) {
      return [];
    }
    return choiceQuestion.options.map(option => {
      return newFakeChoice(option.value, false, null, null);
    });
  }

  /**
   * Sets the choices for this item.
   * @param {import('./fakechoice.js').FakeChoice[]} choices An array of Choice objects.
   * @returns {FakeCheckboxItem} This item, for chaining.
   */
  setChoices(choices) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'CheckboxItem.setChoices');
    if (nargs !== 1 || !is.array(choices) || !choices.every(c => c.toString() === 'Choice')) {
      matchThrow('Invalid arguments: expected an array of Choice objects.');
    }

    const newOptions = choices.map(choice => Forms.newOption().setValue(choice.getValue()));
    const currentIndex = this._getCurrentIndex();

    const updateRequest = Forms.newRequest().setUpdateItem({
      item: {
        itemId: this.getId(),
        questionItem: {
          question: {
            choiceQuestion: {
              options: newOptions,
            },
          },
        },
      },
      location: {
        index: currentIndex,
      },
      updateMask: 'questionItem.question.choiceQuestion.options',
    });

    const batchRequest = Forms.newBatchUpdateFormRequest().setRequests([updateRequest]);
    Forms.Form.batchUpdate(batchRequest, this.__form.getId());

    return this;
  }

  /**
   * Sets whether this item is required.
   * @param {boolean} enabled Whether the item is required.
   * @returns {FakeCheckboxItem} This item, for chaining.
   */
  setRequired(enabled) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'CheckboxItem.setRequired');
    if (nargs !== 1 || !is.boolean(enabled)) {
      matchThrow('Invalid arguments: expected a boolean.');
    }

    const currentIndex = this._getCurrentIndex();

    const updateRequest = Forms.newRequest().setUpdateItem({
      item: {
        itemId: this.getId(),
        questionItem: {
          question: {
            required: enabled,
          },
        },
      },
      location: {
        index: currentIndex,
      },
      updateMask: 'questionItem.question.required',
    });

    const batchRequest = Forms.newBatchUpdateFormRequest().setRequests([updateRequest]);
    Forms.Form.batchUpdate(batchRequest, this.__form.getId());

    return this;
  }

  /**
   * Returns whether this item is required.
   * @returns {boolean} True if the item is required, false otherwise.
   */
  isRequired() {
    return this.__resource.questionItem?.question?.required || false;
  }

  toString() {
    return 'CheckboxItem';
  }
}

// Register the factory function for this item type.
registerFormItem(ItemType.CHECKBOX, newFakeCheckboxItem);
