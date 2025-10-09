import { Proxies } from '../../support/proxies.js';

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
   * Returns "GmailDraft"
   * @returns {string}
   */
  toString() {
    return this.__fakeObjectType;
  }
}