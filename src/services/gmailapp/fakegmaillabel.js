import { Proxies } from '../../support/proxies.js';

export const newFakeGmailLabel = (...args) => Proxies.guard(new FakeGmailLabel(...args));

/**
 * A user-created label in a user's Gmail account.
 */
class FakeGmailLabel {
  constructor(labelResource) {
    this.__labelResource = labelResource;
    this.__fakeObjectType = 'GmailLabel';
  }

  /**
   * Deletes this label.
   */
  deleteLabel() {
    Gmail.Users.Labels.remove('me', this.getId());
  }

  /**
   * Gets the ID of this label.
   * @returns {string} The label ID.
   */
  getId() {
    return this.__labelResource.id;
  }

  /**
   * Gets the name of this label.
   * @returns {string} The label name.
   */
  getName() {
    ScriptApp.__behavior.checkMethod('GmailLabel', 'getName');
    return this.__labelResource.name;
  }

  addToThread(thread) {
    ScriptApp.__behavior.checkMethod('GmailLabel', 'addToThread');
    thread.addLabel(this);
    return this;
  }

  addToThreads(threads) {
    ScriptApp.__behavior.checkMethod('GmailLabel', 'addToThreads');
    threads.forEach(t => t.addLabel(this));
    return this;
  }

  removeFromThread(thread) {
    ScriptApp.__behavior.checkMethod('GmailLabel', 'removeFromThread');
    thread.removeLabel(this);
    return this;
  }

  removeFromThreads(threads) {
    ScriptApp.__behavior.checkMethod('GmailLabel', 'removeFromThreads');
    threads.forEach(t => t.removeLabel(this));
    return this;
  }

  getThreads(start = 0, max = 500) {
    ScriptApp.__behavior.checkMethod('GmailLabel', 'getThreads');
    if (globalThis.GmailApp) {
      // API search uses the name for user labels, or we can use ID for system labels?
      // Usually `label:name` works well. If name has spaces, wrap in quotes.
      const queryName = this.getName().includes(' ') ? `"${this.getName()}"` : this.getName();
      return globalThis.GmailApp.search(`label:${queryName}`, start, max);
    }
    return [];
  }

  getUnreadCount() {
    ScriptApp.__behavior.checkMethod('GmailLabel', 'getUnreadCount');
    if (globalThis.GmailApp) {
      const queryName = this.getName().includes(' ') ? `"${this.getName()}"` : this.getName();
      return globalThis.GmailApp.search(`label:${queryName} is:unread`, 0, 500).length;
    }
    return 0;
  }

  /**
   * Returns the name of the label.
   * @returns {string} The name of the label.
   */
  toString() {
    return 'GmailLabel';
  }
}