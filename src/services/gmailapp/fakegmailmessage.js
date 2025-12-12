import { Proxies } from '../../support/proxies.js';

export const newFakeGmailMessage = (...args) => Proxies.guard(new FakeGmailMessage(...args));

/**
 * A message in a user's Gmail account.
 * @see https://developers.google.com/apps-script/reference/gmail/gmail-message
 */
class FakeGmailMessage {
  constructor(messageResource) {
    this.__messageResource = messageResource;
    this.__fakeObjectType = 'GmailMessage';
  }

  /**
   * Gets the ID of this message.
   * @returns {string} The message ID.
   */
  getId() {
    return this.__messageResource.id;
  }

  /**
   * Gets the ID of the thread that contains this message.
   * @returns {string} The thread ID.
   */
  getThreadId() {
    return this.__messageResource.threadId;
  }
  
  toString() {
    return this.__fakeObjectType;
  }
}