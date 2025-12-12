import { createMimeMessage } from './fakemimemessage.js';
import { Proxies } from '../../support/proxies.js';
import { newFakeGmailLabel } from './fakegmaillabel.js';
import { newFakeGmailDraft } from './fakegmaildraft.js';
import { newFakeGmailMessage } from './fakegmailmessage.js';
import { newFakeGmailThread } from './fakegmailthread.js';

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

  /**
   * Retrieve an email message draft by ID.
   * @param {string} draftId The ID of the draft to retrieve.
   * @returns {GmailDraft} The draft with the given ID.
   */
  getDraft(draftId) {
    const draftResource = Gmail.Users.Drafts.get('me', draftId);
    return newFakeGmailDraft(draftResource);
  }

  /**
   * Retrieves all draft messages.
   * @returns {GmailMessage[]} An array of draft Gmail messages.
   */
  getDraftMessages() {
    const { drafts } = Gmail.Users.Drafts.list('me');
    return drafts ? drafts.map(draft => newFakeGmailMessage(draft.message)) : [];
  }

  /**
   * Gets all Gmail draft messages.
   * @returns {GmailDraft[]} An array of Gmail draft messages.
   */
  getDrafts() {
    const { drafts } = Gmail.Users.Drafts.list('me');
    return drafts ? drafts.map(draft => newFakeGmailDraft(draft)) : [];
  }

  /**
   * Retrieves all Inbox threads irrespective of labels.
   * @param {number} [start] - The index of the first thread to return.
   * @param {number} [max] - The maximum number of threads to return.
   * @returns {GmailThread[]} An array of Gmail threads in the Inbox.
   */
  getInboxThreads(start, max) {
    const params = { q: 'in:inbox' };
    if (start !== undefined) params.pageToken = start; // Gmail API uses pageToken for start
    if (max !== undefined) params.maxResults = max;

    const { threads } = Gmail.Users.Threads.list('me', params);
    return threads ? threads.map(thread => newFakeGmailThread(thread)) : [];
  }
}

export const newFakeGmailApp = (...args) => Proxies.guard(new FakeGmailApp(...args));