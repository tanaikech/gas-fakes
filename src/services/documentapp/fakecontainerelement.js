import { Proxies } from '../../support/proxies.js';
import { FakeElement } from './fakeelement.js';
import { signatureArgs, unimplementedProps } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is, enumKeys } = Utils;
import { ElementType } from '../enums/docsenums.js';
import { getSeType, create } from './elementFactory.js';

export const newFakeContainerElement = (...args) => {
  return Proxies.guard(new FakeContainerElement(...args));
};

/**
 * Base class for elements that can contain other elements.
 * @see https://developers.google.com/apps-script/reference/document/container-element
 */
export class FakeContainerElement {
  constructor(shadowContainer) {
    this.__shadowContainer = shadowContainer;
  }

  getChild(childIndex) {
    const se = this.__shadowContainer.getChild(childIndex);
    return create(this, se);
  }

  getChildIndex(child) {
    // child is a FakeElement, we need its structural element (__se)
    return this.__shadowContainer.getChildIndex(child.__se);
  }
  
  getNumChildren() {
    return this.__shadowContainer.getNumChildren()
  }


  getType () {
    const type = getSeType(this.__shadowContainer)
    return ElementType[type]
  }

}