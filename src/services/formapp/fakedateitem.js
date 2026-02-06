import { Proxies } from '../../support/proxies.js';
import { FakeFormItem } from './fakeformitem.js';
import { registerFormItem } from './formitemregistry.js';
import { ItemType } from '../enums/formsenums.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { newFakeItemResponse } from './fakeitemresponse.js';

export const newFakeDateItem = (...args) => {
  return Proxies.guard(new FakeDateItem(...args));
};

/**
 * @class FakeDateItem
 * @see https://developers.google.com/apps-script/reference/forms/date-item
 */
export class FakeDateItem extends FakeFormItem {
  constructor(...args) {
    super(...args);
  }

  /**
   * Creates a new ItemResponse for this date item.
   * @param {Date} date the date
   * @returns {import('./fakeitemresponse.js').FakeItemResponse} the item response
   */
  createResponse(date) {
    const typeName = this.getType() === ItemType.DATETIME ? 'DateTimeItem' : 'DateItem';
    const { nargs, matchThrow } = signatureArgs(arguments, `${typeName}.createResponse`);
    if (nargs !== 1 || !is.date(date)) {
      matchThrow('Invalid arguments: expected a Date object.');
    }

    const questionId = this.__resource.questionItem?.question?.questionId;
    
    // Format date as YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ for API?
    // Actually, the Forms API expects text answers. 
    // For DATE, it's "YYYY-MM-DD". For DATETIME, it's "YYYY-MM-DD HH:mm".
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let value = `${year}-${month}-${day}`;
    
    if (this.getType() === ItemType.DATETIME) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      value += ` ${hours}:${minutes}`;
    }

    const answers = [{
      questionId,
      textAnswers: {
        answers: [{ value }]
      }
    }];

    return newFakeItemResponse(this, answers);
  }

  toString() {
    return this.getType() === ItemType.DATETIME ? 'DateTimeItem' : 'DateItem';
  }
}

registerFormItem(ItemType.DATE, newFakeDateItem);
registerFormItem(ItemType.DATETIME, newFakeDateItem);
