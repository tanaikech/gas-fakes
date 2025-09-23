import { Proxies } from '../../support/proxies.js';
import { notYetImplemented } from '../../support/helpers.js';

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
    return notYetImplemented('GmailLabel.deleteLabel');
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
    return this.__labelResource.name;
  }

  /**
   * Returns the name of the label.
   * @returns {string} The name of the label.
   */
  toString() {
    return this.getName();
  }
}