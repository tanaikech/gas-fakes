import { FakeAdvResource } from '../common/fakeadvresource.js';
import { Proxies } from '../../support/proxies.js';
import { gError } from '../../support/helpers.js';
import { Syncit } from '../../support/syncit.js';

export const newFakeAdvGmailMessages = (...args) => Proxies.guard(new FakeAdvGmailMessages(...args));

class FakeAdvGmailMessages extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, 'users', Syncit.fxGmail);
    this.gmail = mainService;
    this.__fakeObjectType = 'Gmail.Users.Messages';
  }

  /**
   * Gets the specified message.
   * @param {string} userId - The user's email address. The special value me can be used to indicate the authenticated user.
   * @param {string} id - The ID of the message to retrieve.
   * @returns {object} The message resource.
   */
  get(userId, id) {
    const { data, response } = this._call(
      'get',
      { userId, id },
      null,
      'messages'
    );
    gError(response, 'gmail', 'users.messages.get', true);
    return data;
  }

  /**
   * Sends a message.
   * @param {object} resource - The message to send.
   * @param {string} userId - The user's email address.
   * @param {object} media - Media payload (optional).
   * @returns {object} The sent message resource.
   */
  send(resource, userId, media) {
    const { data, response } = this._call(
      'send',
      { userId, resource, media },
      null,
      'messages'
    );
    gError(response, 'gmail', 'users.messages.send');
    return data;
  }
}
