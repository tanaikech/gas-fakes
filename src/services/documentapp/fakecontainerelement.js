import { Proxies } from '../../support/proxies.js';
import { FakeElement } from './fakeelement.js';
import { signatureArgs, unimplementedProps } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;


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

  // TODO these return the shadow elements rather than the apps script one, so we need to recast before returning them
  // getchildIndex also contains the apps script version, so we need to also recast before searching
  /**
   * Gets the child element at the specified index.
   * @param {number} childIndex - The index of the child element to retrieve.
   * @returns {FakeElement} The child element.
   */
  getChildren() {
    return this.__shadowContainer.children
  }


  getChild(childIndex) {
    return this.__shadowContainer.getChild(childIndex)
  }

  getChildIndex(child) {
    return this.__shadowContainer.getChildIndex(child)
  }

  
  getNumChildren() {
    return this.__shadowContainer.getNumChildren()
  }



}