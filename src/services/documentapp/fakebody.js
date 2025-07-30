import { Proxies } from '../../support/proxies.js';
import { signatureArgs, unimplementedProps } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { makeNrPrefix, getText, appendParagraph } from './shadowhelpers.js'
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

registerElement('BODY_SECTION', newFakeBody);
