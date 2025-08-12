/**
 * @file Provides a fake implementation of the base ContainerElement class.
 */
import { Proxies } from '../../support/proxies.js';
import { newFakeElement } from './fakeelement.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { FakeElement } from './fakeelement.js';

/**
 * Creates a new proxied FakeContainerElement instance.
 * @param {...any} args The arguments for the FakeContainerElement constructor.
 * @returns {FakeContainerElement} A new proxied FakeContainerElement instance.
 */
export const newFakeContainerElement = (...args) => {
  return Proxies.guard(new FakeContainerElement(...args));
};

/**
 * Base class for elements that can contain other elements.
 * @class FakeContainerElement
 * @extends {FakeElement}
 * @see https://developers.google.com/apps-script/reference/document/container-element
 */
export class FakeContainerElement extends FakeElement {
  /**
   * @param {object} structure The document structure manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(structure, nameOrItem) {
    super(structure, nameOrItem);
  }

  /**
   * Gets the shadow document manager associated with this element's structure.
   * @type {import('./shadow.js').ShadowDocument | null}
   * @private
   */
  get shadowDocument() {
    if (this.__isDetached) return null;
    return this.__structure.shadowDocument;
  }

  /**
   * Gets the segment ID for the content of this element.
   * @type {string | null}
   * @private
   */
  get __segmentId() {
    if (this.__isDetached) return null;
    return this.__structure.shadowDocument.__segmentId
  }


  get __children() {
    return this.__twig.children;
  }


  /**
   * Retrieves the child element at the specified index.
   * @param {number} childIndex The zero-based index of the child element to retrieve.
   * @returns {GoogleAppsScript.Document.Element} The child element at the specified index.
   * @see https://developers.google.com/apps-script/reference/document/container-element#getChild(Integer)
   */
  getChild(childIndex) {
    const {
      nargs,
      matchThrow
    } = signatureArgs(arguments, 'ContainerElement.getChild');
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
   * Gets the index of a given child element.
   * @param {GoogleAppsScript.Document.Element} child The child element to find.
   * @returns {number} The zero-based index of the child element, or -1 if the element is not a child of this container.
   * @see https://developers.google.com/apps-script/reference/document/container-element#getChildIndex(Element)
   */
  getChildIndex(child) {
    const {
      nargs,
      matchThrow
    } = signatureArgs(arguments, 'ContainerElement.getChildIndex');
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

  /**
   * Retrieves the number of children in the element.
   * @returns {number} The number of children.
   * @see https://developers.google.com/apps-script/reference/document/container-element#getNumChildren()
   */
  getNumChildren() {
    // Must get the latest structure to return an accurate count,
    // as the object's internal state might be stale.
    const item = this.shadowDocument.structure.elementMap.get(this.__name);
    return item.__twig.children.length;
  }


}