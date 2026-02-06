import { Proxies } from '../../support/proxies.js';
import { FakeFormItem } from './fakeformitem.js';
import { registerFormItem } from './formitemregistry.js';
import { ItemType } from '../enums/formsenums.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { newFakeItemResponse } from './fakeitemresponse.js';

export const newFakeTimeItem = (...args) => {
  return Proxies.guard(new FakeTimeItem(...args));
};

/**
 * @class FakeTimeItem
 * @see https://developers.google.com/apps-script/reference/forms/time-item
 */
export class FakeTimeItem extends FakeFormItem {
  constructor(...args) {
    super(...args);
  }

  /**
   * Creates a new ItemResponse for this time item.
   * @param {number} hour the hour
   * @param {number} minute the minute
   * @returns {import('./fakeitemresponse.js').FakeItemResponse} the item response
   */
  createResponse(hour, minute) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'TimeItem.createResponse');
    if (nargs !== 2 || !is.number(hour) || !is.number(minute)) {
      matchThrow('Invalid arguments: expected two numbers.');
    }

    const questionId = this.__resource.questionItem?.question?.questionId;
    const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    const answers = [{
      questionId,
      textAnswers: {
        answers: [{ value }]
      }
    }];

    return newFakeItemResponse(this, answers);
  }

  toString() {
    return 'TimeItem';
  }
}

registerFormItem(ItemType.TIME, newFakeTimeItem);
