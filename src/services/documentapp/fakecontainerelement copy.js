import { Proxies } from '../../support/proxies.js';
import { FakeElement } from './fakeelement.js';
import { signatureArgs, unimplementedProps } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { newFakeElement } from './fakeelement.js';
import { getSeType } from './elementFactory.js';
import { newFakeBody } from './fakebody.js';

export const newFakeContainerElement = (...args) => {
  return Proxies.guard(new FakeContainerElement(...args));
};
const propsWaitingRoom = [
  'clear',
  'editAsText',
  'findElement',
  'findText',
  'getLinkUrl',
  'getTextAlignment',
  'isAtDocumentEnd',
  'merge',
  'removeChild',
  'replaceText',
  'setAttributes',
  'setLinkUrl',
  'setText',
  'setTextAlignment',
];

/**
 * Base class for elements that can contain other elements.
 * @see https://developers.google.com/apps-script/reference/document/container-element
 */
export class FakeContainerElement {
  constructor(parent, content) {
    this.__parent = parent;
    this.__content = content;

    // Filter out props that are implemented here from the waiting room of the parent.
    const implemented = ['getChild', 'getChildIndex', 'getNumChildren','getChildren', 'asBody'];
    unimplementedProps(this, propsWaitingRoom.filter(p => !implemented.includes(p)));
  }

  get __structuralElements() {
    // The API response can contain elements we don't support in DocumentApp, like sectionBreak.
    // We filter these out
    // also assign a serial number for easier identification
    // if this has come from cache the serial number generated will be the same between calls
    // if its come from the api, the serial numbers generated could be different
    return this.__content.filter(f => !f.sectionBreak).map((f, __seIndex) => ({ ...f, __seIndex }));
  }

  /**
   * Gets the child element at the specified index.
   * @param {number} childIndex - The index of the child element to retrieve.
   * @returns {FakeElement} The child element.
   */
  getChildren() {
    // Use the factory to create specific element types (Paragraph, Table, etc.)
    return this.__structuralElements.map(se => newFakeElement(this, se)).filter(Boolean);
  }


  getChild(childIndex) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.getChildIndex');
    const children = this.getChildren();
    if (nargs !== 1 || !is.integer(childIndex) || childIndex < 0 || childIndex >= children.length) {
      matchThrow();
    }

    const child = children.find(c => c.__seIndex === childIndex);
    if (!child) {
      throw new Error(`child with index ${childIndex} not found`);
    }

    return child;
  }

  /**
   * Gets the child index of the specified child element.
   * @param {FakeElement} child - The child element to find.
   * @returns {number} The index of the child element, or -1 if not found.
   */
  getChildIndex(child) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.getChildIndex');
    if (nargs !== 1 || !is.object(child) || !child.getParent) {
      matchThrow();
    }

    return this.getChildren().findIndex(c => c === child);
  }

  /**
   * Gets the number of children.
   * @returns {number} The number of children.
   */
  getNumChildren() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.getNumChildren');
    if (nargs !== 0) matchThrow();
    return this.getChildren().length;
  }

  asBody () {
    return newFakeBody(this, this.__content)
  }

}