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
}

export const newFakeGmailApp = (...args) => Proxies.guard(new FakeGmailApp(...args));