import { Proxies } from '../../support/proxies.js';
import { FakeFormItem } from './fakeformitem.js';
import { registerFormItem } from './formitemregistry.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { ItemType } from '../enums/formsenums.js';
import { newFakeItemResponse } from './fakeitemresponse.js';

export const newFakeCheckboxGridItem = (...args) => {
  return Proxies.guard(new FakeCheckboxGridItem(...args));
};

/**
 * @class FakeCheckboxGridItem
 * A fake for the CheckboxGridItem class in Apps Script.
 * @see https://developers.google.com/apps-script/reference/forms/checkbox-grid-item
 */
export class FakeCheckboxGridItem extends FakeFormItem {
  constructor(form, itemId) {
    super(form, itemId);
  }

  /**
   * Creates a new ItemResponse for this checkbox grid item.
   * @param {string[][]} responses a two-dimensional array of responses, where each inner array represents the selected columns for a row
   * @returns {import('./fakeitemresponse.js').FakeItemResponse} the item response
   */
  createResponse(responses) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'CheckboxGridItem.createResponse');
    if (nargs !== 1 || !Utils.is.array(responses) || !responses.every(Utils.is.array)) {
      matchThrow('Invalid arguments: expected a two-dimensional string array.');
    }

    const questions = this.__resource.questionGroupItem?.questions || [];
    if (responses.length !== questions.length) {
      throw new Error(`The number of responses (${responses.length}) must match the number of rows (${questions.length}).`);
    }

    const answers = responses.map((rowResponses, index) => {
      const questionId = questions[index].questionId;
      return {
        questionId,
        textAnswers: {
          answers: rowResponses.map(value => ({ value }))
        }
      };
    });

    return newFakeItemResponse(this, answers);
  }

  /**
   * Gets the values for every column in the grid.
   * @returns {string[]} an array of column values
   */
  getColumns() {
    const choiceQuestion = this.__resource.questionGroupItem?.grid?.columns;
    if (!choiceQuestion || !choiceQuestion.options) {
      return [];
    }
    return choiceQuestion.options.map(option => option.value);
  }

  /**
   * Gets the values for every row in the grid.
   * @returns {string[]} an array of row values
   */
  getRows() {
    const questions = this.__resource.questionGroupItem?.questions;
    if (!questions) {
      return [];
    }
    return questions.map(question => question.rowQuestion?.title || null).filter(f => f);
  }

  /**
   * Sets the columns of the grid based on an array of values.
   * @param {string[]} columns an array of column values
   * @returns {FakeCheckboxGridItem} this item, for chaining
   */
  setColumns(columns) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'CheckboxGridItem.setColumns');
    if (nargs !== 1 || !Utils.is.array(columns) || !columns.every(Utils.is.string)) {
      matchThrow('Invalid arguments: expected a string array.');
    }
    if (columns.length === 0) {
      throw new Error('The array of columns cannot be empty.');
    }

    const updatedResource = JSON.parse(JSON.stringify(this.__resource));
    updatedResource.questionGroupItem.grid.columns.options = columns.map(c => ({ value: c }));

    const updateRequest = Forms.newRequest().setUpdateItem({
      item: updatedResource,
      location: { index: this.getIndex() },
      updateMask: 'questionGroupItem.grid.columns.options',
    });

    return this.__update(updateRequest);
  }

  /**
   * Sets the rows of the grid based on an array of values.
   * @param {string[]} rows an array of row values
   * @returns {FakeCheckboxGridItem} this item, for chaining
   */
  setRows(rows) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'CheckboxGridItem.setRows');
    if (nargs !== 1 || !Utils.is.array(rows) || !rows.every(Utils.is.string)) {
      matchThrow('Invalid arguments: expected a string array.');
    }
    if (rows.length === 0) {
      throw new Error('The array of rows cannot be empty.');
    }

    const updatedResource = JSON.parse(JSON.stringify(this.__resource));
    updatedResource.questionGroupItem.questions = rows.map(r => ({
      rowQuestion: { title: r },
    }));

    const updateRequest = Forms.newRequest().setUpdateItem({
      item: updatedResource,
      location: { index: this.getIndex() },
      updateMask: 'questionGroupItem.questions',
    });

    return this.__update(updateRequest);
  }

  toString() {
    return 'CheckboxGridItem';
  }
}

registerFormItem(ItemType.CHECKBOX_GRID, newFakeCheckboxGridItem);
