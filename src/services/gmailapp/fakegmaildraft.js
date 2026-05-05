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
    ScriptApp.__behavior.checkMethod('GmailDraft', 'getMessage');
    const messageId = this.getMessageId();
    if (!messageId) return null;
    const messageResource = Gmail.Users.Messages.get('me', messageId);
    return newFakeGmailMessage(messageResource);
  }

  getMessageId() {
    ScriptApp.__behavior.checkMethod('GmailDraft', 'getMessageId');
    return this.__draftResource.message ? this.__draftResource.message.id : null;
  }

  deleteDraft() {
    ScriptApp.__behavior.checkMethod('GmailDraft', 'deleteDraft');
    Gmail.Users.Drafts.remove('me', this.getId());
  }

  send() {
    ScriptApp.__behavior.checkMethod('GmailDraft', 'send');
    const res = Gmail.Users.Drafts.send({ id: this.getId() }, 'me');
    // The API returns a message resource
    return newFakeGmailMessage(res);
  }

  update(recipient, subject, body, options) {
    ScriptApp.__behavior.checkMethod('GmailDraft', 'update');
    const { createMimeMessage } = require('./fakemimemessage.js');
    const raw = createMimeMessage(recipient, subject, body, options);
    const encoded = Utilities.base64Encode(raw, Utilities.Charset.UTF_8).replace(/\+/g, '-').replace(/\//g, '_');
    
    this.__draftResource = Gmail.Users.Drafts.update({ message: { raw: encoded } }, 'me', this.getId());
    return this;
  }

  /**
   * Returns "GmailDraft"
   * @returns {string}
   */
  toString() {
    return this.__fakeObjectType;
  }
}