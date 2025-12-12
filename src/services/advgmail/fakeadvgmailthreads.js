import { FakeAdvResource } from '../common/fakeadvresource.js';
import { Proxies } from '../../support/proxies.js';
import { gError } from '../../support/helpers.js';
import { Syncit } from '../../support/syncit.js';

export const newFakeAdvGmailThreads = (...args) => Proxies.guard(new FakeAdvGmailThreads(...args));

class FakeAdvGmailThreads extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, 'users', Syncit.fxGmail);
    this.gmail = mainService;
    this.__fakeObjectType = 'Gmail.Users.Threads';
  }

  /**
   * Lists the threads in the user's mailbox.
   * @param {string} userId - The user's email address. The special value me can be used to indicate the authenticated user.
   * @param {object} [params={}] - The parameters for the request.
   * @param {string} params.q - Only return results for threads matching the specified query. Supports the same query format as the Gmail search box.
   * @returns {object} A list of threads.
   */
  list(userId, params = {}) {
    // Implement filtering based on params.q if needed for more complex scenarios
    const { data, response } = this._call(
      'list',
      { ...params, userId, maxResults: 500 },
      null,
      'threads'
    );
    gError(response, 'gmail', 'users.threads.list');
    return data;
  }

  /**
   * Gets the specified thread.
   * @param {string} userId The user's email address. The special value me can be used to indicate the authenticated user.
   * @param {string} id The ID of the thread to retrieve.
   * @returns {object} The thread resource.
   */
  get(userId, id) {
    const { data, response } = this._call(
      'get',
      { userId, id },
      null,
      'threads'
    );
    gError(response, 'gmail', 'users.threads.get', true);
    return data;
  }

  /**
   * Modifies the labels applied to the thread.
   * @param {object} resource - The modifications to apply.
   * @param {string} userId - The user's email address.
   * @param {string} id - The ID of the thread to modify.
   * @returns {object} The modified thread resource.
   */
  modify(resource, userId, id) {
    const { data, response } = this._call(
      'modify',
      { userId, id, resource },
      null,
      'threads'
    );
    gError(response, 'gmail', 'users.threads.modify');
    return data;
  }

  /**
   * Moves the specified thread to the trash.
   * @param {string} userId - The user's email address.
   * @param {string} id - The ID of the thread to trash.
   * @returns {object} The trashed thread resource.
   */
  trash(userId, id) {
    const { data, response } = this._call(
      'trash',
      { userId, id },
      null,
      'threads'
    );
    gError(response, 'gmail', 'users.threads.trash');
    return data;
  }
}
