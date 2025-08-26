/**
 * @file Provides a fake implementation of the FooterSection class.
 */
import { Proxies } from '../../support/proxies.js';
import { FakeSectionElement } from './fakesectionelement.js';
import { registerElement } from './elementRegistry.js';

/**
 * Creates a new proxied FakeFooterSection instance.
 * @param {...any} args The arguments for the FakeFooterSection constructor.
 * @returns {FakeFooterSection} A new proxied FakeFooterSection instance.
 */
export const newFakeFooterSection = (...args) => {
  return Proxies.guard(new FakeFooterSection(...args));
};

/**
 * A fake implementation of the FooterSection class for DocumentApp.
 * @class FakeFooterSection
 * @extends {FakeContainerElement}
 * @extends {FakeSectionElement}
 * @implements {GoogleAppsScript.Document.FooterSection}
 * @see https://developers.google.com/apps-script/reference/document/footer-section
 */
class FakeFooterSection extends FakeSectionElement {
  /**
   * @param {object} structure The document structure manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(structure, nameOrItem) {
    super(structure, nameOrItem);
  }

  /**
   * Returns the string "FooterSection".
   * @returns {string}
   */
  toString() {
    return 'FooterSection';
  }
}

registerElement('FOOTER_SECTION', newFakeFooterSection);
