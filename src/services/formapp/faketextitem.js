import { Proxies } from '../../support/proxies.js';
import { FakeFormItem } from './fakeformitem.js';
import { registerFormItem } from './formitemregistry.js';
import { ItemType } from '../enums/formsenums.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { newFakeItemResponse } from './fakeitemresponse.js';

export const newFakeTextItem = (...args) => {
  return Proxies.guard(new FakeTextItem(...args));
};

/**
 * @class FakeTextItem
 * @see https://developers.google.com/apps-script/reference/forms/text-item
 */
export class FakeTextItem extends FakeFormItem {
  constructor(...args) {
    super(...args);
  }

  /**
   * Creates a new ItemResponse for this text item.
   * @param {string} response the response text
   * @returns {import('./fakeitemresponse.js').FakeItemResponse} the item response
   */
  createResponse(response) {
    // Both TextItem and ParagraphTextItem have the same createResponse signature.
    const typeName = this.getType() === ItemType.PARAGRAPH_TEXT ? 'ParagraphTextItem' : 'TextItem';
    const { nargs, matchThrow } = signatureArgs(arguments, `${typeName}.createResponse`);
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
    return this.getType() === ItemType.PARAGRAPH_TEXT ? 'ParagraphTextItem' : 'TextItem';
  }
}

registerFormItem(ItemType.TEXT, newFakeTextItem);
registerFormItem(ItemType.PARAGRAPH_TEXT, newFakeTextItem);