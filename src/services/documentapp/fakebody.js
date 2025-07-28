import { Proxies } from '../../support/proxies.js';
import { signatureArgs, unimplementedProps } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { makeNrPrefix, getText, appendParagraph } from './shadowhelpers.js'
const { is } = Utils

class FakeBody extends FakeContainerElement {

  constructor(structure) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body');
    if (nargs !== 1 || !is.object(structure)) {
      matchThrow();
    } 
    super(structure, makeNrPrefix('BODY_SECTION'))
    this.__structure = structure

  }

  getText() {
    return getText(this)
  }

  appendParagraph(textOrParagraph) {
    return appendParagraph(this, textOrParagraph)
  }

  toString() {
    return 'Body';
  }
}

export const newFakeBody = (...args) => Proxies.guard(new FakeBody(...args));
