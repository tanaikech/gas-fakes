import { Proxies } from '../../support/proxies.js';
import { Utils } from '../../support/utils.js';

export const newFakeResponses = (...args) => {
  return Proxies.guard(new FakeResponses(...args));
};

/**
 * @class FakeResponses
 * @see https://developers.google.com/forms/api/reference/rest/v1/forms.responses
 */
export class FakeResponses {
  constructor(mainService) {
    this.forms = mainService;
    this.__fakeObjectType = 'Forms.Responses';
  }

  /**
   * Lists the responses of a form.
   * @param {string} formId The form's ID.
   * @returns {{responses: object[]}} A list of responses.
   */
  list(formId) {
    // this.forms is the FakeAdvFormsForm instance, which has the _call method
    // from FakeAdvResource to interact with the syncit data source.
    // We use subProp to specify the nested 'responses' object, following the library's pattern.
    const { data } = this.forms._call('list', { formId }, null, 'responses');
    return data || { responses: [] };
  }
}