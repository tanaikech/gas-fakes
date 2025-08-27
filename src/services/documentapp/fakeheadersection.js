/**
 * @file Provides a fake implementation of the HeaderSection class.
 */
import { Proxies } from '../../support/proxies.js';
import { FakeSectionElement } from './fakesectionelement.js';
import { registerElement } from './elementRegistry.js';

/**
 * Creates a new proxied FakeHeaderSection instance.
 * @param {...any} args The arguments for the FakeHeaderSection constructor.
 * @returns {FakeHeaderSection} A new proxied FakeHeaderSection instance.
 */
export const newFakeHeaderSection = (...args) => {
  return Proxies.guard(new FakeHeaderSection(...args));
};

/**
 * A fake implementation of the HeaderSection class for DocumentApp.
 * @class FakeHeaderSection
 * @extends {FakeContainerElement}
 * @extends {FakeSectionElement}
 * @implements {GoogleAppsScript.Document.HeaderSection}
 * @see https://developers.google.com/apps-script/reference/document/header-section
 */
class FakeHeaderSection extends FakeSectionElement {
  /**
   * @param {import('./shadowdocument.js').ShadowDocument} shadowDocument The shadow document manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Returns the string "HeaderSection".
   * @returns {string}
   */
  toString() {
    return 'HeaderSection';
  }
}

registerElement('HEADER_SECTION', newFakeHeaderSection);
