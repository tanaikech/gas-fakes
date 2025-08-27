/**
 * @file Provides a fake implementation of the base ContainerElement class.
 */
import { getElementFactory } from './elementRegistry.js';
import { Proxies } from '../../support/proxies.js';
import { newFakeElement } from './fakeelement.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { getElementProp } from './elementhelpers.js';
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
   * @param {import('./shadowdocument.js').ShadowDocument} shadowDocument The shadow document manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Gets the shadow document manager associated with this element's structure.
   * @type {import('./shadowdocument.js').ShadowDocument | null}
   * @private
   */
  get shadowDocument() {
    return this.__shadowDocument;
  }

  /**
   * Gets the segment ID for the content of this element.
   * @type {string | null}
   * @private
   */
  get __segmentId() {
    if (this.__isDetached) return null;
    const item = this.__elementMapItem;
    // For Body, headerId/footerId will be undefined, so it falls back to the shadow's segmentId (which is null/empty for body).
    // For Header/Footer, this will return the correct ID.
    return item.headerId || item.footerId || this.shadowDocument.__segmentId;
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

    // Handle detached elements, which don't have a live shadowDocument.
    if (this.__isDetached) {
      const parentItem = this.__elementMapItem;
      if (childIndex >= this.__twig.children.length) matchThrow();

      let childResource;
      let childType; // The type of the child element we will create.
      const parentType = this.getType().toString();

      if (parentType === 'TABLE') {
        childResource = parentItem.table.tableRows[childIndex];
        childType = 'TABLE_ROW';
      } else if (parentType === 'TABLE_ROW') {
        childResource = parentItem.tableCells[childIndex];
        childType = 'TABLE_CELL';
      } else if (parentType === 'TABLE_CELL') {
        childResource = parentItem.content[childIndex];
        // For a table cell, the child is a structural element, so we need to determine its type.
        ({ type: childType } = getElementProp(childResource));
      } else if (parentType === 'PARAGRAPH') {
        const visibleChildren = parentItem.paragraph.elements.filter(e =>
          e.pageBreak || e.horizontalRule || (e.textRun && e.textRun.content && e.textRun.content !== '\n')
        );
        childResource = visibleChildren[childIndex];
        if (childResource) {
          // For a paragraph, the child is a paragraph element, so we need to determine its type.
          ({ type: childType } = getElementProp(childResource));
        }
      } else {
        throw new Error(`getChild on detached element of type ${parentType} not supported`);
      }

      if (!childResource) matchThrow();

      // Create and return the detached child element.
      const factory = getElementFactory(childType);
      return factory(null, childResource);
    }

    // Attached element logic
    const structure = this.__structure;
    const item = structure.elementMap.get(this.__name);
    const children = item.__twig.children;

    if (childIndex >= children.length) matchThrow();

    const childTwig = children[childIndex];
    if (!childTwig) throw new Error(`child with index ${childIndex} not found`);
    
    return newFakeElement(this.shadowDocument, childTwig.name).__cast();
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

    let children;
    if (this.__isDetached) {
      children = this.__twig.children;
    } else {
      // Get the refreshed structure to find the index within the up-to-date children list.
      const structure = this.__structure;
      const item = structure.elementMap.get(this.__name);
      children = item.__twig.children;
    }

    // We just need to compare the name here.
    const seIndex = children.findIndex(c => c.name === child.__name);
    return seIndex;
  }

  /**
   * Retrieves the number of children in the element.
   * @returns {number} The number of children.
   * @see https://developers.google.com/apps-script/reference/document/container-element#getNumChildren()
   */
  getNumChildren() {
    if (this.__isDetached) {
      return this.__twig.children.length;
    }
    // Must get the latest structure to return an accurate count,
    // as the object's internal state might be stale.
    const item = this.__structure.elementMap.get(this.__name);
    return item.__twig.children.length;
  }

}