import { createMimeMessage } from './fakemimemessage.js';
import { Proxies } from '../../support/proxies.js';
import { newFakeGmailLabel } from './fakegmaillabel.js';
import { newFakeGmailDraft } from './fakegmaildraft.js';

/**
 * Provides access to Gmail threads, messages, and labels.
 */
class FakeGmailApp {
  constructor() {
    this.__fakeObjectType = 'GmailApp';
  }

  /**
   * Creates a draft email message.
   * @param {string} recipient a comma-separated list of email addresses
   * @param {string} subject the subject of the message
   * @param {string} body the body of the message
   * @param {object} options an object of optional parameters
   * @returns {GmailDraft} the newly created draft
   */
  createDraft(recipient, subject, body, options) {
    // this is a fairly naive implementation of rfc2822
    const raw = createMimeMessage(recipient, subject, body, options);

    // rfc4648 url safe alphabet
    const encoded = Utilities.base64Encode(raw, Utilities.Charset.UTF_8)
      .replace(/\+/g, '-').replace(/\//g, '_');

    const draft = Gmail.Users.Drafts.create({ message: { raw: encoded } }, 'me');
    return newFakeGmailDraft(draft);
  }

  /**
   * Creates a new user label.
   * @param {string} name The name of the new label.
   * @returns {GmailLabel} The new label.
   */
  createLabel(name) {
    const newLabelResource = Gmail.newLabel().setName(name);
    const createdLabelResource = Gmail.Users.Labels.create(newLabelResource, 'me');
    return newFakeGmailLabel(createdLabelResource);
  }

  /**
   * Gets a list of user-created labels.
   * @returns {GmailLabel[]} An array of user-created labels.
   */
  getUserLabels() {
    const { labels } = Gmail.Users.Labels.list('me');
    // The documentation for GmailApp.getUserLabels() says "user-created labels".
    // The live environment follows this, so we will filter for type 'user'.
    return labels ? labels.filter(l => l.type === 'user').map(labelResource => newFakeGmailLabel(labelResource)) : [];
  }
  /**
   * Deletes the specified label.
   * @param {GmailLabel} label The label to delete.
   * @returns {GmailApp} The Gmail service, useful for chaining.
   */
  deleteLabel(label) {
    Gmail.Users.Labels.remove('me', label.getId());
    return this;
  }

  /**
   * Gets a list of the emails that are set up as aliases for this account in Gmail.
   * @returns {string[]} An array of aliases for this account.
   */
  getAliases() {
    const { sendAs } = Gmail.Users.Settings.SendAs.list('me');
    return sendAs ? sendAs.map(alias => alias.sendAsEmail) : [];
  }
}

export const newFakeGmailApp = (...args) => Proxies.guard(new FakeGmailApp(...args));