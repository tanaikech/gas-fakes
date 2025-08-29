/**
 * @file Provides a fake implementation of the Footnote class.
 */
import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { registerElement } from './elementRegistry.js';

/**
 * Creates a new proxied FakeFootnote instance.
 * @param {...any} args The arguments for the FakeFootnote constructor.
 * @returns {FakeFootnote} A new proxied FakeFootnote instance.
 */
export const newFakeFootnote = (...args) => {
  return Proxies.guard(new FakeFootnote(...args));
};

/**
 * A fake implementation of the Footnote class for DocumentApp.
 * @class FakeFootnote
 * @extends {FakeContainerElement}
 * @implements {GoogleAppsScript.Document.Footnote}
 * @see https://developers.google.com/apps-script/reference/document/footnote
 */
class FakeFootnote extends FakeContainerElement {
  /**
   * @param {import('./shadowdocument.js').ShadowDocument} shadowDocument The shadow document manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Gets the contents of the footnote as a Body object.
   * @returns {GoogleAppsScript.Document.Body} The footnote contents.
   * @see https://developers.google.com/apps-script/reference/document/footnote#getFootnoteContents()
   */
  getFootnoteContents() {
    // A Footnote is a container, and in Apps Script it can be treated like a Body.
    // The API represents it as a list of StructuralElements, just like a Body.
    // So, we can return `this` cast as a Body.
    return this;
  }

  /**
   * Returns the string "Footnote".
   * @returns {string}
   */
  toString() {
    return 'Footnote';
  }
}

registerElement('FOOTNOTE', newFakeFootnote);

