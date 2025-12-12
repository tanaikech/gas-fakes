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
   * @param {object} resource - The label resource to create.
   * @param {string} userId - The user's email address. The special value me can be used to indicate the authenticated user.
   * @returns {object} The created label resource.
   */
  create(resource, userId) {
    const { data, response } = this._call(
      'create',
      { userId, requestBody: normalizeSerialization(resource) },
      null,
      'labels'
    );
    gError(response, 'gmail', 'users.labels.create');
    return data;
  }

  /**
   * Deletes the specified label.
   * @param {string} userId - The user's email address. The special value me can be used to indicate the authenticated user.
   * @param {string} id - The ID of the label to delete.
   */
  remove(userId, id) {
    const { data, response } = this._call(
      'delete',
      { userId, id },
      null,
      'labels'
    );
    gError(response, 'gmail', 'users.labels.delete', true);
    return data;
  }

  /**
   * Gets the specified label.
   * @param {string} userId - The user's email address. The special value me can be used to indicate the authenticated user.
   * @param {string} id - The ID of the label to retrieve.
   * @returns {object} The label resource.
   */
  get(userId, id) {
    const { data, response } = this._call(
      'get',
      { userId, id },
      null,
      'labels'
    );
    gError(response, 'gmail', 'users.labels.get', true);
    return data;
  }

  /**
   * Lists all labels in the user's mailbox.
   * @param {string} userId - The user's email address. The special value me can be used to indicate the authenticated user.
   * @param {object} params - The parameters for the request.
   * @returns {object} A list of labels.
   */
  list(userId, params = {}) {
    const { data, response } = this._call(
      'list',
      { ...params, userId },
      null,
      'labels'
    );
    gError(response, 'gmail', 'users.labels.list');
    return data;
  }

  /**
   * Updates the specified label. This method supports patch semantics.
   * @param {string} userId - The user's email address. The special value me can be used to indicate the authenticated user.
   * @param {object} resource - The label resource to update.
   * @param {object} [params={}] - The parameters for the request.
   * @param {string} params.id - The ID of the label to update.
   * @returns {object} The updated label resource.
   */
  patch(userId, resource, params = {}) {
    const { data, response } = this._call(
      'patch',
      { ...params, userId, requestBody: normalizeSerialization(resource) },
      null,
      'labels'
    );
    gError(response, 'gmail', 'users.labels.patch');
    return data;
  }

  /**
   * Updates the specified label.
   * @param {string} userId - The user's email address. The special value me can be used to indicate the authenticated user.
   * @param {object} resource - The label resource to update.
   * @param {object} [params={}] - The parameters for the request.
   * @param {string} params.id - The ID of the label to update.
   * @returns {object} The updated label resource.
   */
  update(userId, resource, params = {}) {
    const { data, response } = this._call(
      'update',
      { ...params, userId, requestBody: normalizeSerialization(resource) },
      null,
      'labels'
    );
    gError(response, 'gmail', 'users.labels.update');
    return data;
  }
}