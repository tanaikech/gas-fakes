import { FakeAdvResource } from '../common/fakeadvresource.js';
import { Proxies } from '../../support/proxies.js';
import { gError, normalizeSerialization } from '../../support/helpers.js';
import { Syncit } from '../../support/syncit.js';

export const newFakeAdvGmailLabels = (...args) => Proxies.guard(new FakeAdvGmailLabels(...args));

class FakeAdvGmailLabels extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, 'gmail', Syncit.fxGmail);
    this.gmail = mainService;
    this.__fakeObjectType = 'Gmail.Users.Labels';
  }

  /**
   * Creates a new label.
   * @param {object} params - The parameters for the request.
   * @param {string} params.userId - The user's email address. The special value me can be used to indicate the authenticated user.
   * @param {object} resource - The label resource to create.
   * @returns {object} The created label resource.
   */
  create(params, resource) {
    const { data, response } = this.callSrv_({
      prop: 'users',
      subProp: 'labels',
      method: 'create',
      params: { ...params, requestBody: normalizeSerialization(resource) }
    });
    gError(response, 'gmail', 'users.labels.create');
    return data;
  }

  /**
   * Deletes the specified label.
   * @param {object} params - The parameters for the request.
   * @param {string} params.userId - The user's email address. The special value me can be used to indicate the authenticated user.
   * @param {string} params.id - The ID of the label to delete.
   */
  delete(params) {
    const { data, response } = this.callSrv_({
      prop: 'users',
      subProp: 'labels',
      method: 'delete',
      params
    });
    gError(response, 'gmail', 'users.labels.delete');
    return data;
  }

  /**
   * Gets the specified label.
   * @param {object} params - The parameters for the request.
   * @param {string} params.userId - The user's email address. The special value me can be used to indicate the authenticated user.
   * @param {string} params.id - The ID of the label to retrieve.
   * @returns {object} The label resource.
   */
  get(params) {
    const { data } = this.callSrv_({
      prop: 'users',
      subProp: 'labels',
      method: 'get',
      params
    });
    return data;
  }

  /**
   * Lists all labels in the user's mailbox.
   * @param {object} params - The parameters for the request.
   * @param {string} params.userId - The user's email address. The special value me can be used to indicate the authenticated user.
   * @returns {object} A list of labels.
   */
  list(params) {
    const { data, response } = this.callSrv_({
      prop: 'users',
      subProp: 'labels',
      method: 'list',
      params
    });
    gError(response, 'gmail', 'users.labels.list');
    return data;
  }
}