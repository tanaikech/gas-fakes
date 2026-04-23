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
  
  /**
   * Helper to get a header value.
   * @param {string} name - Header name
   * @returns {string}
   */
  __getHeader(name) {
    if (this.__messageResource.payload && this.__messageResource.payload.headers) {
      const header = this.__messageResource.payload.headers.find(h => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : '';
    }
    return '';
  }

  /**
   * Gets the subject of this message.
   * @returns {string} The subject.
   */
  getSubject() {
    ScriptApp.__behavior.checkMethod('GmailMessage', 'getSubject');
    return this.__getHeader('Subject');
  }

  /**
   * Gets the date and time of this message.
   * @returns {Date} The date and time.
   */
  getDate() {
    ScriptApp.__behavior.checkMethod('GmailMessage', 'getDate');
    if (this.__messageResource.internalDate) {
      return new Date(parseInt(this.__messageResource.internalDate, 10));
    }
    const dateHeader = this.__getHeader('Date');
    return dateHeader ? new Date(dateHeader) : new Date();
  }

  /**
   * Gets the snippet of the email.
   * @returns {string} The snippet.
   */
  getSnippet() {
    ScriptApp.__behavior.checkMethod('GmailMessage', 'getSnippet');
    return this.__messageResource.snippet || '';
  }

  /**
   * Gets the sender of this message.
   * @returns {string} The sender's email address.
   */
  getFrom() {
    ScriptApp.__behavior.checkMethod('GmailMessage', 'getFrom');
    return this.__getHeader('From');
  }

  /**
   * Gets the recipient of this message.
   * @returns {string} The recipient's email address.
   */
  getTo() {
    ScriptApp.__behavior.checkMethod('GmailMessage', 'getTo');
    return this.__getHeader('To');
  }

  toString() {
    return this.__fakeObjectType;
  }
}