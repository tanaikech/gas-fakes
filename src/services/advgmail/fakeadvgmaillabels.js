import { FakeAdvResource } from '../common/fakeadvresource.js';
import { Proxies } from '../../support/proxies.js';
import { gError, normalizeSerialization } from '../../support/helpers.js';
import { Syncit } from '../../support/syncit.js';

export const newFakeAdvGmailLabels = (...args) => Proxies.guard(new FakeAdvGmailLabels(...args));

class FakeAdvGmailLabels extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, 'users', Syncit.fxGmail);
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
    const { data, response } = this._call(
      'create',
      { ...params, requestBody: normalizeSerialization(resource) },
      null,
      'labels'
    );
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
    const { data, response } = this._call(
      'delete',
      params,
      null,
      'labels'
    );
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
    const { data, response } = this._call(
      'get',
      params,
      null,
      'labels'
    );
    gError(response, 'gmail', 'users.labels.get', true);
    return data;
  }

  /**
   * Lists all labels in the user's mailbox.
   * @param {object} params - The parameters for the request.
   * @param {string} params.userId - The user's email address. The special value me can be used to indicate the authenticated user.
   * @returns {object} A list of labels.
   */
  list(params) {
    const { data, response } = this._call(
      'list',
      params,
      null,
      'labels'
    );
    gError(response, 'gmail', 'users.labels.list');
    return data;
  }

  /**
   * Updates the specified label. This method supports patch semantics.
   * @param {object} params - The parameters for the request.
   * @param {string} params.userId - The user's email address. The special value me can be used to indicate the authenticated user.
   * @param {string} params.id - The ID of the label to update.
   * @param {object} resource - The label resource to update.
   * @returns {object} The updated label resource.
   */
  patch(params, resource) {
    const { data, response } = this._call(
      'patch',
      { ...params, requestBody: normalizeSerialization(resource) },
      null,
      'labels'
    );
    gError(response, 'gmail', 'users.labels.patch');
    return data;
  }

  /**
   * Updates the specified label.
   * @param {object} params - The parameters for the request.
   * @param {string} params.userId - The user's email address. The special value me can be used to indicate the authenticated user.
   * @param {string} params.id - The ID of the label to update.
   * @param {object} resource - The label resource to update.
   * @returns {object} The updated label resource.
   */
  update(params, resource) {
    const { data, response } = this._call(
      'update',
      { ...params, requestBody: normalizeSerialization(resource) },
      null,
      'labels'
    );
    gError(response, 'gmail', 'users.labels.update');
    return data;
  }
}