import { Proxies } from '../../support/proxies.js';
import { FakeFormItem } from './fakeformitem.js';
import { registerFormItem } from './formitemregistry.js';
import { ItemType } from '../enums/formsenums.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { newFakeItemResponse } from './fakeitemresponse.js';

export const newFakeDurationItem = (...args) => {
  return Proxies.guard(new FakeDurationItem(...args));
};

/**
 * @class FakeDurationItem
 * @see https://developers.google.com/apps-script/reference/forms/duration-item
 */
export class FakeDurationItem extends FakeFormItem {
  constructor(...args) {
    super(...args);
  }

  /**
   * Creates a new ItemResponse for this duration item.
   * @param {number} hours the hours
   * @param {number} minutes the minutes
   * @param {number} seconds the seconds
   * @returns {import('./fakeitemresponse.js').FakeItemResponse} the item response
   */
  createResponse(hours, minutes, seconds) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'DurationItem.createResponse');
    if (nargs !== 3 || !is.number(hours) || !is.number(minutes) || !is.number(seconds)) {
      matchThrow('Invalid arguments: expected three numbers.');
    }

    const questionId = this.__resource.questionItem?.question?.questionId;
    const value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const answers = [{
      questionId,
      textAnswers: {
        answers: [{ value }]
      }
    }];

    return newFakeItemResponse(this, answers);
  }

  toString() {
    return 'DurationItem';
  }
}

registerFormItem(ItemType.DURATION, newFakeDurationItem);
