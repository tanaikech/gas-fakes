import { Proxies } from '../../support/proxies.js';
import { ElementType } from '../enums/docsenums.js';
import { newFakeParagraph } from './fakeparagraph.js';
import { Utils } from '../../support/utils.js';
import { signatureArgs } from '../../support/helpers.js';
const { is } = Utils;

/**
 * A placeholder for fake Element classes.
 */
export class FakeElement {
  constructor(parent = null) {
    this.__parent = parent;
  }

  /**
   * Gets the element's parent element.
   * @returns {FakeElement|null} The parent element, or null if the element has no parent.
   */
  getParent() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.getParent');
    if (nargs !== 0) matchThrow();
    return this.__parent;
  }

  /**
   * Gets the number of children.
   * @returns {number} The number of children.
   */
  getNumChildren() {
    // Most elements don't have children, so default to 0.
    // Subclasses that can contain children (like Body, Paragraph, TableCell) should override this.
    return 0;
  }

  /**
   * Gets the element's type.
   * @returns {GoogleAppsScript.Document.ElementType} The element's type.
   */
  getType() {
    // This should be overridden by subclasses.
    return ElementType.UNSUPPORTED;
  }

  /**
   * Creates a FakeElement from a Docs API structural element.
   * @param {object} structuralElement - The structural element from the API response.
   * @param {FakeElement|null} parent - The parent container of this element.
   * @returns {FakeElement|null} The corresponding fake element, or null if not a supported element type.
   */
  static makeElementFromApi(structuralElement, parent = null) {
    if (is.undefined(structuralElement)) return null;

    // The paragraph object in the API contains elements.
    if (structuralElement.paragraph) {
      // The text is in the textRun.content of these elements.
      // The getText() method for a paragraph in Apps Script does not include the
      // trailing newline that marks the end of the paragraph in the API response.
      const text = structuralElement.paragraph.elements?.map(element => {
        return element.textRun ? element.textRun.content : '';
      }).join('').replace(/\n$/, '') || '';
      return newFakeParagraph(text, parent);
    }

    if (structuralElement.sectionBreak) {
      // As noted in `fakebody.js` and `oddities.md`, these are often ignored by DocumentApp methods.
      return null;
    }

    // TODO: Handle other element types like table, tableOfContents, etc.
    // For now, return a base element for anything else that is not explicitly handled.
    // This will allow `getNumChildren` to count it, but it won't have specific functionality.
    // The base `getType()` returns `UNSUPPORTED`.
    return newFakeElement(parent);
  }

  toString() {
    return 'Element';
  }
}

export const newFakeElement = (...args) => {
  return Proxies.guard(new FakeElement(...args));
};