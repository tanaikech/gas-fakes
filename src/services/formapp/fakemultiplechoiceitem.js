import { Proxies } from '../../support/proxies.js';
import { FakeChoiceItem } from './fakechoiceitem.js';
import { registerFormItem } from './formitemregistry.js';
import { ItemType } from '../enums/formsenums.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { newFakeItemResponse } from './fakeitemresponse.js';

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

  /**
   * Creates a new ItemResponse for this multiple choice item.
   * @param {string} response the selected choice
   * @returns {import('./fakeitemresponse.js').FakeItemResponse} the item response
   */
  createResponse(response) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'MultipleChoiceItem.createResponse');
    if (nargs !== 1 || !is.string(response)) {
      matchThrow('Invalid arguments: expected a string.');
    }

    const questionId = this.__resource.questionItem?.question?.questionId;
    const answers = [{
      questionId,
      textAnswers: {
        answers: [{ value: response }]
      }
    }];

    return newFakeItemResponse(this, answers);
  }

  toString() {
    return 'MultipleChoiceItem';
  }
}

// Register the factory function for this item type.
registerFormItem(ItemType.MULTIPLE_CHOICE, newFakeMultipleChoiceItem);