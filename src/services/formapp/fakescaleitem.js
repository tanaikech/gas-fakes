import { Proxies } from '../../support/proxies.js';
import { FakeFormItem } from './fakeformitem.js';
import { registerFormItem } from './formitemregistry.js';
import { ItemType } from '../enums/formsenums.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { newFakeItemResponse } from './fakeitemresponse.js';

export const newFakeScaleItem = (...args) => {
  return Proxies.guard(new FakeScaleItem(...args));
};

/**
 * @class FakeScaleItem
 * A fake for the ScaleItem class in Apps Script.
 * @see https://developers.google.com/apps-script/reference/forms/scale-item
 */
export class FakeScaleItem extends FakeFormItem {
  constructor(form, itemId) {
    super(form, itemId);
  }

  /**
   * Creates a new ItemResponse for this scale item.
   * @param {number} response the selected value
   * @returns {import('./fakeitemresponse.js').FakeItemResponse} the item response
   */
  createResponse(response) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ScaleItem.createResponse');
    if (nargs !== 1 || !is.number(response)) {
      matchThrow('Invalid arguments: expected a number.');
    }

    const questionId = this.__resource.questionItem?.question?.questionId;
    const answers = [{
      questionId,
      textAnswers: {
        answers: [{ value: response.toString() }]
      }
    }];

    return newFakeItemResponse(this, answers);
  }

  /**
   * Gets the lower bound of the scale.
   * @returns {Integer} the lower bound
   */
  getLowerBound() {
    return this.__resource.questionItem.question.scaleQuestion.low || 0;
  }

  /**
   * Gets the upper bound of the scale.
   * @returns {Integer} the upper bound
   */
  getUpperBound() {
    return this.__resource.questionItem.question.scaleQuestion.high;
  }

  /**
   * Gets the label for the scale's lower bound.
   * @returns {string} the label for the lower bound
   */
  getLeftLabel() {
    return this.__resource.questionItem.question.scaleQuestion.lowLabel || '';
  }

  /**
   * Gets the label for the scale's upper bound.
   * @returns {string} the label for the upper bound
   */
  getRightLabel() {
    return this.__resource.questionItem.question.scaleQuestion.highLabel || '';
  }

  /**
   * Sets the scale's bounds and, optionally, labels.
   * @param {Integer} lower the lower bound
   * @param {Integer} upper the upper bound
   * @returns {FakeScaleItem} this item, for chaining
   */
  setBounds(lower, upper) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ScaleItem.setBounds');
    if (nargs !== 2 || !is.number(lower) || !is.number(upper)) {
      matchThrow('Invalid arguments: expected two numbers.');
    }

    // Truncate decimals as per documentation.
    const lowerInt = Math.trunc(lower);
    const upperInt = Math.trunc(upper);

    // Validate bounds as per documentation.
    if (lowerInt !== 0 && lowerInt !== 1) {
      throw new Error('The lower bound must be 0 or 1.');
    }
    if (upperInt < 3 || upperInt > 10) {
      throw new Error('The upper bound must be between 3 and 10, inclusive.');
    }
    const updatedResource = JSON.parse(JSON.stringify(this.__resource));
    updatedResource.questionItem.question.scaleQuestion.low = lowerInt;
    updatedResource.questionItem.question.scaleQuestion.high = upperInt;

    const updateRequest = Forms.newRequest().setUpdateItem({
      item: updatedResource,
      location: { index: this.getIndex() },
      updateMask: 'questionItem.question.scaleQuestion',
    });

    return this.__update(updateRequest);
  }

  /**
   * Sets the labels for the scale's lower and upper bounds.
   * @param {string} lower the label for the lower bound
   * @param {string} upper the label for the upper bound
   * @returns {FakeScaleItem} this item, for chaining
   */
  setLabels(lower, upper) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ScaleItem.setLabels');
    if (nargs !== 2 || !is.string(lower) || !is.string(upper)) {
      matchThrow('Invalid arguments: expected two strings.');
    }

    const updatedResource = JSON.parse(JSON.stringify(this.__resource));
    updatedResource.questionItem.question.scaleQuestion.lowLabel = lower;
    updatedResource.questionItem.question.scaleQuestion.highLabel = upper;

    const updateRequest = Forms.newRequest().setUpdateItem({
      item: updatedResource,
      location: { index: this.getIndex() },
      updateMask: 'questionItem.question.scaleQuestion',
    });

    return this.__update(updateRequest);
  }

  toString() {
    return 'ScaleItem';
  }
}

registerFormItem(ItemType.SCALE, newFakeScaleItem);