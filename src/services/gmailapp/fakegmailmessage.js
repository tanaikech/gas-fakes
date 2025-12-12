import { Proxies } from '../../support/proxies.js';
import { newFakeGmailThread } from './fakegmailthread.js';

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
   * Gets the thread that contains this message.
   * @returns {GmailThread} The thread.
   */
  getThread() {
    // The threadId is available in the message resource
    const threadResource = Gmail.Users.Threads.get('me', this.__messageResource.threadId);
    return newFakeGmailThread(threadResource);
  }
  
  toString() {
    return this.__fakeObjectType;
  }
}