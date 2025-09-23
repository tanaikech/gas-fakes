import { Proxies } from '../../support/proxies.js';
import { newFakeGmailLabel } from './fakegmaillabel.js';

/**
 * Provides access to Gmail threads, messages, and labels.
 */
class FakeGmailApp {
  constructor() {
    this.__fakeObjectType = 'GmailApp';
  }

  /**
   * Gets a list of user-created labels.
   * @returns {GmailLabel[]} An array of user-created labels.
   */
  getLabels() {
    const { labels } = Gmail.Users.Labels.list({ userId: 'me' });
    // The API returns all labels, including system labels. The documentation for GmailApp.getLabels()
    // says "user-created labels", but in practice it returns system labels as well. We will mimic this.
    return labels ? labels.map(labelResource => newFakeGmailLabel(labelResource)) : [];
  }
}

export const newFakeGmailApp = (...args) => Proxies.guard(new FakeGmailApp(...args));