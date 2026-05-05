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
    
    const self = this;
    this.Attachments = {
      get(userId, messageId, id) {
        const { data, response } = self._call(
          'attachments.get',
          { userId, messageId, id },
          null,
          'messages'
        );
        gError(response, 'gmail', 'users.messages.attachments.get', true);
        return data;
      }
    };
  }

  /**
   * Gets the specified message.
   * @param {string} userId - The user's email address. The special value me can be used to indicate the authenticated user.
   * @param {string} id - The ID of the message to retrieve.
   * @returns {object} The message resource.
   */
  get(userId, id, optionalArgs) {
    const { data, response } = this._call(
      'get',
      { userId, id, ...optionalArgs },
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
      { userId, requestBody: resource, media },
      null,
      'messages'
    );
    gError(response, 'gmail', 'users.messages.send');
    return data;
  }

  /**
   * Modifies the labels on the specified message.
   * @param {object} resource - The modifications to apply.
   * @param {string} userId - The user's email address.
   * @param {string} id - The ID of the message to modify.
   * @returns {object} The modified message resource.
   */
  modify(resource, userId, id) {
    const { data, response } = this._call(
      'modify',
      { userId, id, requestBody: resource },
      null,
      'messages'
    );
    gError(response, 'gmail', 'users.messages.modify');
    return data;
  }

  /**
   * Modifies the labels on the specified messages.
   * @param {object} resource - The batch modifications to apply.
   * @param {string} userId - The user's email address.
   */
  batchModify(resource, userId) {
    const { data, response } = this._call(
      'batchModify',
      { userId, requestBody: resource },
      null,
      'messages'
    );
    gError(response, 'gmail', 'users.messages.batchModify');
    return data;
  }

  /**
   * Moves the specified message to the trash.
   * @param {string} userId - The user's email address.
   * @param {string} id - The ID of the message to trash.
   * @returns {object} The trashed message resource.
   */
  trash(userId, id) {
    const { data, response } = this._call(
      'trash',
      { userId, id },
      null,
      'messages'
    );
    gError(response, 'gmail', 'users.messages.trash');
    return data;
  }

  /**
   * Removes the specified message from the trash.
   * @param {string} userId - The user's email address.
   * @param {string} id - The ID of the message to untrash.
   * @returns {object} The untrashed message resource.
   */
  untrash(userId, id) {
    const { data, response } = this._call(
      'untrash',
      { userId, id },
      null,
      'messages'
    );
    gError(response, 'gmail', 'users.messages.untrash');
    return data;
  }
}
