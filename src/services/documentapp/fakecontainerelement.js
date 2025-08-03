import { Proxies } from '../../support/proxies.js';
import { newFakeElement } from './fakeelement.js';
import { signatureArgs, unimplementedProps } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { FakeElement } from './fakeelement.js';

export const newFakeContainerElement = (...args) => {
  return Proxies.guard(new FakeContainerElement(...args));
};

/**
 * Base class for elements that can contain other elements.
 * @see https://developers.google.com/apps-script/reference/document/container-element
 */
export class FakeContainerElement extends FakeElement {
  constructor(structure, nameOrItem) {
    super(structure, nameOrItem)
  }

  get shadowDocument() {
    if (this.__isDetached) return null;
    return this.__structure.shadowDocument
  }

  get __segmentId() {
    if (this.__isDetached) return null;
    return this.__structure.shadowDocument.__segmentId
  }


  get __children() {
    return this.__twig.children
  }


  getChild(childIndex) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.getChild');
    if (nargs !== 1 || !is.integer(childIndex) || childIndex < 0) {
      matchThrow();
    }

    // Get the refreshed structure and the current element from it to ensure we have the latest children.
    const structure = this.shadowDocument.structure;
    const item = structure.elementMap.get(this.__name);
    const children = item.__twig.children;

    if (childIndex >= children.length) {
      // The index is out of bounds. The live API throws a parameter mismatch error.
      matchThrow();
    }

    const childTwig = children[childIndex];
    if (!childTwig) {
      throw new Error(`child with index ${childIndex} not found`);
    }
    return newFakeElement(structure, childTwig.name).__cast();
  }

  /**
   * the children are shadow, but the arguement arriving will be an apps script element
   * @param {FakeElement} child 
   * @returns 
   */
  getChildIndex(child) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.getChildIndex');
    if (nargs !== 1 || !is.object(child)) {
      matchThrow();
    }
    // Get the refreshed structure to find the index within the up-to-date children list.
    const structure = this.shadowDocument.structure;
    const item = structure.elementMap.get(this.__name);
    const children = item.__twig.children;

    // We just need to compare the name here.
    const seIndex = children.findIndex(c => c.name === child.__name);
    if (seIndex === -1) {
      // console.log(child); // Kept for potential future debugging
      throw new Error(`child with name ${child.__name} not found`);
    }
    return seIndex
  }

  getNumChildren() {
    // Must get the latest structure to return an accurate count,
    // as the object's internal state might be stale.
    const item = this.shadowDocument.structure.elementMap.get(this.__name);
    return item.__twig.children.length;
  }


}