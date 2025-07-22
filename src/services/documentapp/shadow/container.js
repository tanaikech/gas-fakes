import { Proxies } from '../../../support/proxies.js';

export const newShadowContainer = (...args) => {
  return Proxies.guard(new ShadowContainer (...args));
};

export class ShadowContainer {
  constructor(shadowDocument, container) {
    this.__shadowDocument = shadowDocument;
    this.__container = container
  }

  get content () {
    return this.__container.content;
  }

  /**
   * Gets the children
   * @returns {ShadowElement[]} The children elements.
   */
  get children() {
    // add an index for better identifaction later
    return this.content.filter(f=>!f.sectionBreak)
  }

  /**
   * Gets the child by its index
   * @param {number} childIndex - The index of the child element to retrieve.
   * @returns {FakeElement} The child element.
   */
  getChild(childIndex) {
    return this.children[childIndex]
  }

  /**
   * Gets the childIndex from its child
   * @param {number} child - The index of the child element to retrieve.
   * @returns {FakeElement} The child element.
   */
  getChildIndex(child) {
    // we cant necessarily use a mempry compare as we'll potentially be using a different address
    let index = this.children.indexOf(child)
    if (index === -1 ) {
      // TODO -- refine this we''l start ny checking that the startIndex is the same
      // Need to check what happens if theyve changed - will it still be equality?
      index = this.children.findIndex(c => c.startIndex === child.startIndex)
    }
    return index
  }

  getNumChildren() {
    return this.children.length
  }

}

