import { Proxies } from '../../support/proxies.js';
import { newFakeFormItem } from './fakeformitem.js';

export const newFakeItemResponse = (...args) => {
  return Proxies.guard(new FakeItemResponse(...args));
};

/**
 * @class FakeItemResponse
 * @see https://developers.google.com/apps-script/reference/forms/item-response
 */
export class FakeItemResponse {
  /**
   *
   * @param {import('./fakeformitem.js').FakeFormItem} item the item this is a response to
   * @param {object[]} answers an array of answer objects from the Forms API response
   */
  constructor(item, answers) {
    this.__item = item;
    this.__answers = answers; // This is now an array of answer objects
  }

  /**
   * Gets the Item object for the question that this response answers.
   */
  getItem() {
    return this.__item;
  }

  /**
   * Gets the ID of the item this response is for. Note: This is a custom method for gas-fakes.
   * @returns {string} the item's ID
   */
  getId() {
    return parseInt(this.__item.getId(), 16); // Convert to decimal
  }

  /**
   * Gets the answer to the question as a string.
   * @returns {string} the response
   */
  getResponse() {

    const itemType = this.__item.getType().toString();
    if (itemType === 'GRID' || itemType === 'CHECKBOX_GRID') {
      const rows = this.__item.getRows();
      // Initialize with empty string for GRID, empty array for CHECKBOX_GRID
      // This matches Apps Script behavior: String[] for Grid, String[][] for CheckboxGrid
      const rowAnswers = new Array(rows.length).fill(itemType === 'CHECKBOX_GRID' ? [] : '');
      
      const questionIdMap = new Map();
      if (this.__item.__resource.questionGroupItem?.questions) {
        this.__item.__resource.questionGroupItem.questions.forEach((q, index) => {
          questionIdMap.set(q.questionId, index);
        });
      }
      this.__answers.forEach(answer => {
        if (answer.questionId && questionIdMap.has(answer.questionId)) {
          const rowIndex = questionIdMap.get(answer.questionId);
          const values = answer.textAnswers?.answers?.map(a => a.value) || [];
          
          if (itemType === 'CHECKBOX_GRID') {
            rowAnswers[rowIndex] = values;
          } else {
            // For GRID, take the first value
            rowAnswers[rowIndex] = values[0] || '';
          }
        }
      });
      
      return rowAnswers;
    }

    // Flatten the 'textAnswers.answers' arrays from all answer objects.
    // This correctly combines all row answers for a grid item.
    const allTextAnswers = this.__answers.flatMap(
      (answer) => answer?.textAnswers?.answers || []
    );

    if (allTextAnswers.length === 0) {
      return '';
    }

    // For items like grids, there can be multiple answer values. The live script joins them with a comma.
    return allTextAnswers.map(a => a.value).join(',');
  }
}