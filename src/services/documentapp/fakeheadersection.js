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

registerElement('HEADER_SECTION', newFakeHeaderSection);
