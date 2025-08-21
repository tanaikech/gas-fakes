/**
 * @file Provides a fake implementation of the ListItem class.
 */
import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { registerElement } from './elementRegistry.js';
import { getText } from './elementhelpers.js';
import { appendText } from './appenderhelpers.js';

/**
 * Creates a new proxied FakeListItem instance.
 * @param {...any} args The arguments for the FakeListItem constructor.
 * @returns {FakeListItem} A new proxied FakeListItem instance.
 */
export const newFakeListItem = (...args) => {
  return Proxies.guard(new FakeListItem(...args));
};

/**
 * A fake implementation of the ListItem class for DocumentApp.
 * @class FakeListItem
 * @extends {FakeContainerElement}
 * @implements {GoogleAppsScript.Document.ListItem}
 * @see https://developers.google.com/apps-script/reference/document/list-item
 */
export class FakeListItem extends FakeContainerElement {
  /**
   * @param {object} structure The document structure manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(structure, nameOrItem) {
    super(structure, nameOrItem);
  }

  /**
   * Gets the text content of the list item, flattening all child text elements.
   * @returns {string} The text content.
   * @see https://developers.google.com/apps-script/reference/document/list-item#getText()
   */
  getText() {
    return getText(this);
  }

  /**
   * Appends text to the list item.
   * @param {string|GoogleAppsScript.Document.Text} textOrTextElement The text to append.
   * @returns {GoogleAppsScript.Document.ListItem} The list item, for chaining.
   */
  appendText(textOrTextElement) {
    appendText(this, textOrTextElement);
    return this;
  }

  toString() {
    return 'ListItem';
  }
}

registerElement('LIST_ITEM', newFakeListItem);

