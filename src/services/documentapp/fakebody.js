import { Proxies } from '../../support/proxies.js';
import { signatureArgs, unimplementedProps } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { makeNrPrefix, getText, appendParagraph, insertParagraph, appendPageBreak, insertPageBreak } from './shadowhelpers.js'
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
    if (!children.length) {
      return '';
    }
    const texts = children.map(c => c.getText());

    // A new document has one child: an empty paragraph.
    // If it's the only child, getText() should be empty.
    if (children.length === 1) {
      return texts[0]; // which is ""
    }

    // The live API's body.getText() doesn't produce a leading newline
    // from the initial empty paragraph when other content is present.
    // We need to identify and skip ONLY this initial empty paragraph.
    const firstChild = children[0];
    const firstItem = firstChild.__elementMapItem;

    // The initial paragraph in a new doc has startIndex 1.
    if (firstItem.startIndex === 1 && firstItem.paragraph && texts[0] === '') {
      return texts.slice(1).join('\n');
    }

    // Otherwise, join all texts. This handles cases where the first
    // element is a page break (which also has empty text).
    return texts.join('\n');
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

  toString() {
    return 'Body';
  }
}

export const newFakeBody = (...args) => Proxies.guard(new FakeBody(...args));

registerElement('BODY_SECTION', newFakeBody);
