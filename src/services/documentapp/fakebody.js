import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { makeNrPrefix } from './nrhelpers.js'
import { appendParagraph, insertParagraph, appendPageBreak, insertPageBreak, appendTable, insertTable } from './appenderhelpers.js'
import { registerElement } from './elementRegistry.js';
const { is } = Utils

class FakeBody extends FakeContainerElement {

  constructor(structure, name) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body');
    if ((nargs < 1 || nargs > 2) || !is.object(structure)) {
      matchThrow();
    }
    // The name from getBody() will be undefined, so we default it. The name from __cast() will be defined.
    super(structure, name || makeNrPrefix('BODY_SECTION'))
    this.__structure = structure

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
    // Per the docs, inserting at an index equal to the number of children
    // is equivalent to an append operation.
    if (childIndex === this.getNumChildren()) {
      return this.appendTable(tableOrCells);
    }
    const t =  insertTable(this, childIndex, tableOrCells);
    return t
  }

  toString() {
    return 'Body';
  }
}

export const newFakeBody = (...args) => Proxies.guard(new FakeBody(...args));

registerElement('BODY_SECTION', newFakeBody);