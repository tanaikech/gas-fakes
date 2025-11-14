import { Proxies } from '../../support/proxies.js';
import { newFakeFormItem } from './fakeformitem.js';
import { newFakeChoice } from './fakechoice.js';

export const newFakeChoiceItem = (form, itemId) => {
  return Proxies.guard(new FakeChoiceItem(form, itemId));
};

/**
 * @class FakeChoiceItem
 * A base class for items that have a list of choices, like MultipleChoiceItem and CheckboxItem.
 * It is not a real Apps Script class but a helper for the fake environment.
 */
export class FakeChoiceItem extends newFakeFormItem().constructor {
  constructor(form, itemId) {
    super(form, itemId);
  }

  /**
   * Creates a new choice.
   * @param {string} value The text for the new choice.
   * @returns {import('./fakechoice.js').FakeChoice} The new choice.
   */
  createChoice(value) {
    return newFakeChoice(value);
  }

  /**
   * Gets the choices for this item.
   * @returns {import('./fakechoice.js').FakeChoice[]} An array of the choices.
   */
  getChoices() {
    const choiceQuestion = this.__resource.questionItem.question.choiceQuestion;
    return choiceQuestion.options.map(option => newFakeChoice(option.value));
  }

  /**
   * Sets the choices for this item.
   * @param {import('./fakechoice.js').FakeChoice[]} choices The new choices.
   * @returns {FakeChoiceItem} The item, for chaining.
   */
  setChoices(choices) {
    const choiceQuestion = this.__resource.questionItem.question.choiceQuestion;
    choiceQuestion.options = choices.map(choice => ({ value: choice.getValue() }));

    const updateRequest = Forms.newRequest().setUpdateItem({
      item: {
        itemId: this.getId(),
        questionItem: {
          question: {
            choiceQuestion: choiceQuestion,
          },
        },
      },
      location: {
        index: this.getIndex(),
      },
      updateMask: 'questionItem.question.choiceQuestion',
    });

    return this.__update(updateRequest);
  }

  toString() {
    return 'FakeChoiceItem';
  }
}