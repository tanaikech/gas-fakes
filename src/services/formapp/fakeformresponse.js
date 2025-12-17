import { Proxies } from '../../support/proxies.js';
import { newFakeItemResponse } from './fakeitemresponse.js';
import { Utils } from '../../support/utils.js';

export const newFakeFormResponse = (...args) => {
  return Proxies.guard(new FakeFormResponse(...args));
};

/**
 * @class FakeFormResponse
 * @see https://developers.google.com/apps-script/reference/forms/form-response
 */
export class FakeFormResponse {
  /**
   *
   * @param {import('./fakeform.js').FakeForm} form the parent form
   * @param {object} resource the response resource from the Forms API
   */
  constructor(form, resource) {
    this.__form = form;
    this.__resource = resource;
  }

  /**
   * Gets the email address of the respondent.
   * @returns {string} the respondent's email
   */
  getRespondentEmail() {
    return this.__resource.respondentEmail || '';
  }

  /**
   * Gets the unique ID for this form response.
   * @returns {number} the unique hex ID converted to a decimal number
   */
  getId() {
    return Utils.fromHex(this.__resource.responseId);
  }

  /**
   * Gets the date and time the response was submitted.
   * @returns {Date} the submission timestamp
   */
  getTimestamp() {
    return new Date(this.__resource.lastSubmittedTime);
  }

  /**
   * Gets all item responses contained in the form response.
   * @returns {import('./fakeitemresponse.js').FakeItemResponse[]} an array of item responses
   */
  getItemResponses() {
    if (!this.__resource.answers) {
      return [];
    }

    // Create a map to group answers by their parent form item. This is crucial for grid items,
    // where each row is a separate answer in the API response but should be consolidated
    // into a single ItemResponse in Apps Script.
    const groupedAnswers = new Map();

    for (const [questionId, answer] of Object.entries(this.__resource.answers)) {
      const item = this.__form.getItemById(Utils.fromHex(questionId));

      if (item) {
        const itemId = item.getId(); // Use the unique item ID as the key.
        if (!groupedAnswers.has(itemId)) {
          // Store the item itself along with an array for its answers.
          groupedAnswers.set(itemId, { item, answers: [] });
        }
        // Add the raw answer object from the API response to the item's answer list.
        // This correctly groups all row answers for a grid under the same parent item.
        // We also attach the questionId to the answer object so we can identify the row later.
        groupedAnswers.get(itemId).answers.push({ ...answer, questionId });
      }
    }

    // Now, create one FakeItemResponse for each grouped item.
    const itemResponses = Array.from(groupedAnswers.values()).map(({ item, answers }) => {
      return newFakeItemResponse(item, answers);
    });

    // Finally, sort the responses based on the item's index in the form.
    return itemResponses.sort((a, b) => a.getItem().getIndex() - b.getItem().getIndex());
  }
}