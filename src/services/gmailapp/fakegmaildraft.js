import { Proxies } from '../../support/proxies.js';
import { newFakeGmailMessage } from './fakegmailmessage.js';

export const newFakeGmailDraft = (...args) => Proxies.guard(new FakeGmailDraft(...args));

/**
 * A draft email message in a user's Gmail account.
 * @see https://developers.google.com/apps-script/reference/gmail/gmail-draft
 */
class FakeGmailDraft {
  constructor(draftResource) {
    this.__draftResource = draftResource;
    this.__fakeObjectType = 'GmailDraft';
  }

  /**
   * Gets the ID of this draft.
   * @returns {string} The draft ID.
   */
  getId() {
    return this.__draftResource.id;
  }

  /**
   * Returns a GmailMessage representing this draft.
   * @returns {GmailMessage} The message that represents the contents of this draft.
   */
  getMessage() {
    // The draft resource has a message object that contains the message ID.
    // However, the Gmail API's drafts.get() returns a message object with a full message resource.
    // So, this.__draftResource.message itself is the message resource.
    return newFakeGmailMessage(this.__draftResource.message);
  }

  /**
   * Returns "GmailDraft"
   * @returns {string}
   */
  toString() {
    return this.__fakeObjectType;
  }
}