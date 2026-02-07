import { Proxies } from '../../support/proxies.js';
import { FakeChoiceItem } from './fakechoiceitem.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { registerFormItem } from './formitemregistry.js';
import { newFakeChoice } from './fakechoice.js';
import { ItemType } from '../enums/formsenums.js';
import { newFakeItemResponse } from './fakeitemresponse.js';

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

  /**
   * Creates a new ItemResponse for this checkbox item.
   * @param {string[]} responses the selected choices
   * @returns {import('./fakeitemresponse.js').FakeItemResponse} the item response
   */
  createResponse(responses) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'CheckboxItem.createResponse');
    if (nargs !== 1 || !Utils.is.array(responses) || !responses.every(Utils.is.string)) {
      matchThrow('Invalid arguments: expected a string array.');
    }

    const questionId = this.__resource.questionItem?.question?.questionId;
    const answers = [{
      questionId,
      textAnswers: {
        answers: responses.map(value => ({ value }))
      }
    }];

    return newFakeItemResponse(this, answers);
  }

  toString() {
    return 'CheckboxItem';
  }
}

// Register the factory function for this item type.
registerFormItem(ItemType.CHECKBOX, newFakeCheckboxItem);
