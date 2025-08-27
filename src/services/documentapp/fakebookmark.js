/**
 * @file Provides a fake implementation of the Bookmark class.
 */
import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { registerElement, getElementFactory } from './elementRegistry.js';
import { newFakePosition } from './fakeposition.js';
import { signatureArgs } from '../../support/helpers.js';

const BOOKMARK_PREFIX = 'kix.';

/**
 * Creates a new proxied FakeBookmark instance.
 * @param {...any} args The arguments for the FakeBookmark constructor.
 * @returns {FakeBookmark} A new proxied FakeBookmark instance.
 */
export const newFakeBookmark = (...args) => {
  return Proxies.guard(new FakeBookmark(...args));
};

/**
 * A fake implementation of the Bookmark class for DocumentApp.
 * @class FakeBookmark
 * @extends {FakeContainerElement}
 * @implements {GoogleAppsScript.Document.Bookmark}
 * @see https://developers.google.com/apps-script/reference/document/bookmark
 */
export class FakeBookmark extends FakeContainerElement {
  /**
   * @param {import('./shadowdocument.js').ShadowDocument} shadowDocument The shadow document manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Gets the ID of the bookmark.
   * @returns {string} The bookmark ID.
   */
  getId() {
    const item = this.__elementMapItem;
    // The name is the full named range name, e.g., "kix.abcdef123".
    // The ID is the part after "kix.".
    return item.name.startsWith(BOOKMARK_PREFIX) ? item.name.substring(BOOKMARK_PREFIX.length) : item.name;
  }

  /**
   * Gets the position of the bookmark.
   * @returns {GoogleAppsScript.Document.Position} The bookmark's position.
   */
  getPosition() {
    const shadow = this.shadowDocument;
    const item = this.__elementMapItem;
    const range = item.ranges[0]; // A bookmark has one range.

    const { startIndex } = range;

    // Find the element that contains this position's startIndex.
    const containingElementItem = Array.from(shadow.elementMap.values()).find(
      el => el.startIndex <= startIndex && el.endIndex > startIndex && el.__type !== 'BODY_SECTION'
    );

    if (!containingElementItem) {
      throw new Error(`Could not find element containing bookmark at index ${startIndex}`);
    }

    const factory = getElementFactory(containingElementItem.__type);
    const element = factory(shadow.structure, containingElementItem.__name);
    const offset = startIndex - containingElementItem.startIndex;

    return newFakePosition(element, offset);
  }

  /**
   * Removes the bookmark from the document.
   */
  remove() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Bookmark.remove');
    if (nargs !== 0) matchThrow();

    const shadow = this.shadowDocument;
    const item = this.__elementMapItem;

    const requests = [{ deleteNamedRange: { namedRangeId: item.namedRangeId } }];
    Docs.Documents.batchUpdate({ requests }, shadow.getId());
    shadow.refresh();
  }

  toString() {
    return 'Bookmark';
  }
}

registerElement('BOOKMARK', newFakeBookmark);
