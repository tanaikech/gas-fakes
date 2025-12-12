import { Proxies } from '../../support/proxies.js';

export const newFakeGmailThread = (...args) => Proxies.guard(new FakeGmailThread(...args));

/**
 * A thread in a user's Gmail account.
 * @see https://developers.google.com/apps-script/reference/gmail/gmail-thread
 */
class FakeGmailThread {
  constructor(threadResource) {
    this.__threadResource = threadResource;
    this.__fakeObjectType = 'GmailThread';
  }

  /**
   * Gets the ID of this thread.
   * @returns {string} The thread ID.
   */
  getId() {
    return this.__threadResource.id;
  }
  
  toString() {
    return this.__fakeObjectType;
  }
}
