import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { shadowPrefix } from './nrhelpers.js'
import { newFakeFootnoteSection } from './fakefootnotesection.js';
import { appendParagraph, insertParagraph, appendPageBreak, insertPageBreak, appendTable, insertTable, appendListItem, insertListItem, appendImage, insertImage } from './appenderhelpers.js'
import { registerElement } from './elementRegistry.js';
const { is } = Utils

class FakeBody extends FakeContainerElement {

  constructor(shadowDocument, name) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body');
    if ((nargs < 1 || nargs > 2) || !is.object(shadowDocument)) {
      matchThrow();
    }
    // The name from getBody() will be undefined, so we default it. The name from __cast() will be defined.
    super(shadowDocument, name || shadowPrefix + 'BODY_SECTION_')
  }

  getText() {
    // getChildren() is not a standard method on Body. We build the array of children
    // using getNumChildren() and getChild(i).
    const children = [];
    for (let i = 0; i < this.getNumChildren(); i++) {
      children.push(this.getChild(i));
    }
    // The live environment joins the text of each child paragraph with a newline.
    // An empty paragraph's text is '', so an empty doc's body text is '',
    // and a doc with an empty para and a 'p1' para has body text '\np1'.
    return children.map(c => c.getText()).join('\n');
  }

  appendParagraph(textOrParagraph) {
    return appendParagraph(this, textOrParagraph)
  }

  insertParagraph(childIndex, paragraph) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.insertParagraph');
    if (nargs !== 2) matchThrow();

    // Per the docs, inserting at an index equal to the number of children
    // is equivalent to an append operation.
    if (childIndex === this.getNumChildren()) {
      return this.appendParagraph(paragraph);
    }
    return insertParagraph(this, childIndex, paragraph);
  }

  appendPageBreak(pageBreak) {
    return appendPageBreak(this, pageBreak || null);
  }

  insertPageBreak(childIndex, pageBreak) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.insertPageBreak');
    if (nargs < 1 || nargs > 2) matchThrow();

    // Per the docs, inserting at an index equal to the number of children
    // is equivalent to an append operation.
    if (childIndex === this.getNumChildren()) {
      return this.appendPageBreak(pageBreak);
    }
    return insertPageBreak(this, childIndex, pageBreak);
  }

  appendTable(tableOrCells) {
    return appendTable(this, tableOrCells);
  }

  insertTable(childIndex, tableOrCells) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.insertTable');
    if (nargs !== 2) matchThrow();

    // Per the docs, inserting at an index equal to the number of children
    // is equivalent to an append operation.
    if (childIndex === this.getNumChildren()) {
      return this.appendTable(tableOrCells);
    }
    const t =  insertTable(this, childIndex, tableOrCells);
    return t
  }

  appendListItem(listItemOrText) {
    return appendListItem(this, listItemOrText);
  }

  insertListItem(childIndex, listItemOrText) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.insertListItem');
    if (nargs !== 2) matchThrow();

    // Per the docs, inserting at an index equal to the number of children
    // is equivalent to an append operation.
    if (childIndex === this.getNumChildren()) {
      return this.appendListItem(listItemOrText);
    }
    return insertListItem(this, childIndex, listItemOrText);
  }

  appendImage(image) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.appendImage');
    if (nargs !== 1) matchThrow();
    return appendImage(this, image);
  }

  insertImage(childIndex, image) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.insertImage');
    if (nargs !== 2) matchThrow();

    if (childIndex === this.getNumChildren()) {
      return this.appendImage(image);
    }
    return insertImage(this, childIndex, image);
  }

  /**
   * Gets the footnote section of the document.
   * @returns {GoogleAppsScript.Document.FootnoteSection} The footnote section.
   * @see https://developers.google.com/apps-script/reference/document/body#getFootnoteSection()
   */
  getFootnoteSection() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.getFootnoteSection');
    if (nargs !== 0) matchThrow();
    return newFakeFootnoteSection(this.__shadowDocument, shadowPrefix + 'FOOTNOTE_SECTION_');
  }

  toString() {
    return 'Body';
  }
}

export const newFakeBody = (...args) => Proxies.guard(new FakeBody(...args));

registerElement('BODY_SECTION', newFakeBody);
