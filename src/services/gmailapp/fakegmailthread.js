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

  /**
   * Gets the labels of this thread.
   * @returns {GmailLabel[]} An array of labels for this thread.
   */
  getLabels() {
    const labelIds = new Set();
    if (this.__threadResource.messages) {
      this.__threadResource.messages.forEach(m => {
        if (m.labelIds) m.labelIds.forEach(id => labelIds.add(id));
      });
    }
    const labels = [];
    if (globalThis.GmailApp) {
      const userLabels = globalThis.GmailApp.getUserLabels();
      labelIds.forEach(id => {
        // Match by ID if possible, or name? getUserLabels returns FakeGmailLabel objects.
        // FakeGmailLabel usually wraps resource {id, name}.
        // Standard user labels in API have format "Label_...".
        // FakeGmailApp.getUserLabels() implementation?
        const found = userLabels.find(l => {
          // If l.getId() matches id?
          // FakeGmailLabel has getId().
          return l.getId() === id;
        });
        if (found) labels.push(found);
        else {
          // Try system labels? FakeGmailApp doesn't expose system labels via getUserLabels.
          // But our test uses User labels "AllowedLabel".
        }
      });
    }
    return labels;
  }

  /**
   * Adds a label to this thread.
   * @param {GmailLabel} label - The label to add.
   * @returns {GmailThread} This thread, for chaining.
   */
  addLabel(label) {
    Gmail.Users.Threads.modify({ addLabelIds: [label.getId()] }, 'me', this.getId());
    return this;
  }

  toString() {
    return this.__fakeObjectType;
  }
}
