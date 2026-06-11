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
 * @extends {FakeSectionElement}
 * @implements {GoogleAppsScript.Document.FooterSection}
 * @see https://developers.google.com/apps-script/reference/document/footer-section
 */
class FakeFooterSection extends FakeSectionElement {
  /**
   * @param {import('./shadowdocument.js').ShadowDocument} shadowDocument The shadow document manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Returns the string "FooterSection".
   * @returns {string}
   */
  toString() {
    return 'FooterSection';
  }

  appendHorizontalRule() {
    return super.appendHorizontalRule();
  }

  appendImage(image) {
    return super.appendImage(image);
  }

  appendListItem(listItemOrText) {
    return super.appendListItem(listItemOrText);
  }

  appendParagraph(paragraphOrText) {
    return super.appendParagraph(paragraphOrText);
  }

  appendTable(tableOrCells) {
    return super.appendTable(tableOrCells);
  }

  clear() {
    return super.clear();
  }

  editAsText() {
    return super.editAsText();
  }

  getText() {
    return super.getText();
  }

  insertHorizontalRule(childIndex) {
    return super.insertHorizontalRule(childIndex);
  }

  insertImage(childIndex, image) {
    return super.insertImage(childIndex, image);
  }

  insertListItem(childIndex, listItemOrText) {
    return super.insertListItem(childIndex, listItemOrText);
  }

  insertParagraph(childIndex, paragraph) {
    return super.insertParagraph(childIndex, paragraph);
  }

  insertTable(childIndex, table) {
    return super.insertTable(childIndex, table);
  }

  removeChild(child) {
    return super.removeChild(child);
  }

  setText(text) {
    return super.setText(text);
  }

  removeFromParent() {
    return super.removeFromParent();
  }
}

registerElement('FOOTER_SECTION', newFakeFooterSection);
