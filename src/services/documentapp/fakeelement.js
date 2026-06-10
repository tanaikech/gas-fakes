/**
 * @file Provides a fake implementation of the base Element class.
 */
import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { ElementType } from '../enums/docsenums.js';
import { getElementFactory } from './elementRegistry.js';
import { findItem, getAttributes, updateParagraphStyle, updateTextStyle, attributesToStyle } from './elementhelpers.js';

/**
 * @typedef {import('./shadow.js').ShadowStructure} ShadowStructure
 */

const shadowPrefix = "GAS_FAKE_";

/**
 * Represents a generic element in a Google Document.
 * In the Document Service model, almost everything is a type of Element.
 * This base class provides common functionality like getting the parent, type, and copying.
 * @class FakeElement
 * @implements {GoogleAppsScript.Document.Element}
 */
export class FakeElement {
  /**
   * The constructor for an element.
   * @param {import('./shadowdocument.js').ShadowDocument | null} shadowDocument - The document's shadow document manager, or null for a detached element.
   * @param {string | object} nameOrItem - The unique name of the element within the structure, or the raw element resource for a detached element.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    const {
      nargs,
      matchThrow
    } = signatureArgs(arguments, 'FakeElement');
    if (nargs !== 2) matchThrow();

    // An element is either "attached" (with a structure and a name)
    // or "detached" (with a structural element but no live structure).
    // A detached element is created by copy().
    if (is.string(nameOrItem)) { // Attached
      if (!is.object(shadowDocument) || (!nameOrItem.startsWith(shadowPrefix) && !nameOrItem.startsWith('kix.'))) {
        throw new Error(`Invalid arguments for attached FakeElement: ${nameOrItem}. Name must start with '${shadowPrefix}' or 'kix.'.`);
      }
      this.__isDetached = false;
      this.__shadowDocument = shadowDocument;
      // Cache the element's initial position. This is the key to "reviving" the element.
      const initialItem = this.__getElementMapItem(nameOrItem);
      this.__initialStartIndex = initialItem.startIndex;
      this.__initialSegmentId = initialItem.__segmentId;
      this.__name = nameOrItem;
      this.__detachedItem = null;
    } else if (is.object(nameOrItem)) { // Detached
      if (!is.null(shadowDocument)) {
        throw new Error('shadowDocument must be null for a detached FakeElement');
      }
      this.__isDetached = true;
      this.__shadowDocument = null;
      this.__name = null;
      this.__detachedItem = nameOrItem;
    }
  }

  /**
   * Gets the shadow document manager associated with this element's structure.
   * @type {import('./shadowdocument.js').ShadowDocument | null}
   */
  get shadowDocument() {
    return this.__shadowDocument;
  }

  get __structure() {
    if (this.__isDetached) return null;
    return this.__shadowDocument.structure;
  }

  /**
   * Gets the underlying element resource item from the structure map or the detached item.
   * @type {object}
   * @private
   */
  get __elementMapItem() {
    if (this.__isDetached) {
      return this.__detachedItem;
    }

    // 1. Try the last known name. This is fast if nothing has changed.
    const lastKnownItem = this.__getElementMapItem(this.__name, true); // noThrow = true
    if (lastKnownItem) {
      return lastKnownItem;
    }

    // 2. If the last name was stale, find the element by its initial position.
    const revivedItem = findItem(this.__shadowDocument.elementMap, this.getType().toString(), this.__initialStartIndex, this.__initialSegmentId);
    // 3. Update the internal name so the next lookup is fast again.
    this.__name = revivedItem.__name;
    return revivedItem;
  }

  /**
   * Helper to retrieve an item from the structure's element map.
   * @param {string} name The name of the element to retrieve.
   * @returns {object} The element map item.
   * @private
   */
  __getElementMapItem(name, noThrow = false) {
    const item = this.__shadowDocument.getElement(name);
    if (!item) {
      if (noThrow) return null;
      throw new Error(`element with name ${name} not found`);
    }
    return item;
  }

  /**
   * Gets the hierarchical 'twig' for this element from the element map item.
   * The twig represents the element's position in the document tree.
   * @type {object}
   * @private
   */
  get __twig() {
    return this.__elementMapItem.__twig;
  }

  /**
   * Gets the next sibling element of this element.
   * @returns {GoogleAppsScript.Document.Element | null} The next sibling element, or null if none exists.
   * @see https://developers.google.com/apps-script/reference/document/element#getNextSibling()
   */
  getNextSibling() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.getNextSibling');
    if (nargs !== 0) matchThrow();

    if (this.__isDetached || !this.__twig.parent) return null;

    const parent = this.__twig.parent;
    const children = parent.children;
    const currentIndex = children.indexOf(this.__twig);

    if (currentIndex === -1 || currentIndex === children.length - 1) {
      return null;
    }

    const nextTwig = children[currentIndex + 1];
    return newFakeElement(this.__shadowDocument, nextTwig.name).__cast();
  }

  /**
   * Gets the previous sibling element of this element.
   * @returns {GoogleAppsScript.Document.Element | null} The previous sibling element, or null if none exists.
   * @see https://developers.google.com/apps-script/reference/document/element#getPreviousSibling()
   */
  getPreviousSibling() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.getPreviousSibling');
    if (nargs !== 0) matchThrow();

    if (this.__isDetached || !this.__twig.parent) return null;

    const parent = this.__twig.parent;
    const children = parent.children;
    const currentIndex = children.indexOf(this.__twig);

    if (currentIndex <= 0) {
      return null;
    }

    const prevTwig = children[currentIndex - 1];
    return newFakeElement(this.__shadowDocument, prevTwig.name).__cast();
  }

  /**
   * Gets the parent element of this element.
   * @returns {GoogleAppsScript.Document.ContainerElement | null} The parent element, or null if it has no parent (e.g., it's the Body or is detached).
   * @see https://developers.google.com/apps-script/reference/document/element#getParent()
   */
  getParent() {
    if (this.__isDetached) {
      return null;
    }
    // The body doesn't have a parent.
    if (!this.__twig.parent) return null;

    const { name } = this.__twig.parent;
    const item = this.__getElementMapItem(name);
    if (!item) {
      throw new Error(`Parent element with name ${name} not found`);
    }
    // Create a new element instance for the parent and cast it to its proper type.
    return newFakeElement(this.__shadowDocument, name).__cast();
  }

  /**
   * Gets the element's type.
   * @returns {GoogleAppsScript.Document.ElementType} The element's type.
   * @see https://developers.google.com/apps-script/reference/document/element#getType()
   */
  getType() {
    const { __type: type } = this.__elementMapItem;
    const enumType = ElementType[type];
    if (!enumType) {
      throw new Error(`Element with type ${type} not found in ElementType enum`);
    }
    return enumType;
  }

  /**
   * Retrieves the element's attributes.
   * @returns {object} The element's attributes.
   * @see https://developers.google.com/apps-script/reference/document/element#getAttributes()
   */
  getAttributes() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.getAttributes');
    if (nargs !== 0) matchThrow();

    return getAttributes(this);
  }

  /**
   * Sets the element's attributes.
   * @param {object} attributes - The attributes to set.
   * @returns {GoogleAppsScript.Document.Element} The current element.
   * @see https://developers.google.com/apps-script/reference/document/element#setAttributes(Object)
   */
  setAttributes(attributes) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.setAttributes');
    if (nargs !== 1 || !is.object(attributes)) matchThrow();

    const { paragraphStyle, textStyle, paraFields, textFields } = attributesToStyle(attributes);
    const type = this.getType().toString();

    if (paraFields && (type === 'PARAGRAPH' || type === 'LIST_ITEM' || type === 'BODY_SECTION')) {
      updateParagraphStyle(this, paragraphStyle, paraFields);
    }
    if (textFields) {
      updateTextStyle(this, textStyle, textFields);
    }
    return this;
  }

  /**
   * Determines whether the element is at the end of the Document.
   * @returns {boolean} Whether the element is at the end of the tab.
   * @see https://developers.google.com/apps-script/reference/document/element#isAtDocumentEnd()
   */
  isAtDocumentEnd() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.isAtDocumentEnd');
    if (nargs !== 0) matchThrow();

    if (this.__isDetached) return false;

    let current = this;
    while (current && !current.__isDetached) {
      const parent = current.getParent();
      if (!parent) return true; // Body or root is end

      const children = parent.__twig.children;
      if (children.indexOf(current.__twig) !== children.length - 1) {
        return false;
      }
      current = parent;
    }
    return true;
  }

  /**
   * Merges the element with the preceding sibling of the same type.
   * @returns {GoogleAppsScript.Document.Element | null} The merged element.
   * @see https://developers.google.com/apps-script/reference/document/element#merge()
   */
  merge() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.merge');
    if (nargs !== 0) matchThrow();
    // Implementation of merge is complex and requires careful management of child indices.
    // For now, we'll mark it as not implemented.
    throw new Error('merge() is not yet implemented in gas-fakes');
  }

  /**
   * Removes the element from its parent.
   * @returns {GoogleAppsScript.Document.Element | null} The removed element.
   * @see https://developers.google.com/apps-script/reference/document/element#removeFromParent()
   */
  removeFromParent() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.removeFromParent');
    if (nargs !== 0) matchThrow();

    if (this.__isDetached) {
      throw new Error('removeFromParent not supported for detached elements');
    }

    const parent = this.getParent();
    if (!parent) {
      throw new Error('Cannot remove root element (Body)');
    }

    const item = this.__elementMapItem;
    const range = {
      startIndex: item.startIndex,
      endIndex: item.endIndex,
      segmentId: this.__shadowDocument.__segmentId,
      tabId: this.__shadowDocument.__tabId
    };

    Docs.Documents.batchUpdate({
      requests: [{
        deleteContentRange: { range }
      }]
    }, this.__shadowDocument.getId());

    this.__shadowDocument.refresh();
    return this;
  }

  /**
   * Creates a detached copy of the element.
   * The copied element has no parent and is not part of the document until it is inserted.
   * @returns {GoogleAppsScript.Document.Element} A new, detached copy of the element.
   * @see https://developers.google.com/apps-script/reference/document/element#copy()
   */
  copy() {
    const originalItem = this.__elementMapItem;

    // Custom deep clone function to handle the circular reference in __twig.parent.
    // JSON.stringify cannot handle circular structures.
    const deepClone = (obj, cache = new WeakMap()) => {
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }
      if (cache.has(obj)) {
        return cache.get(obj);
      }

      const clone = Array.isArray(obj) ? [] : {};
      cache.set(obj, clone);

      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          // The __twig property is the one with the circular reference via its 'parent' property.
          // We clone it, but explicitly set the parent to null to break the cycle for the detached copy.
          if (key === '__twig') {
            const twig = obj[key];
            clone[key] = {
              name: twig.name,
              children: deepClone(twig.children, cache), // Recursively clone children twigs
              parent: null, // Break the circular reference
            };
          } else {
            clone[key] = deepClone(obj[key], cache);
          }
        }
      }
      return clone;
    };

    const clonedItem = deepClone(originalItem);

    // The factory will create the correct subclass (e.g., FakeParagraph)
    const factory = getElementFactory(this.getType().toString());
    return factory(null, clonedItem);
  }

  /**
   * Casts the generic FakeElement to its specific type (e.g., FakeParagraph).
   * This is used by methods like `asParagraph()`.
   * @param {string} [asType=null] - The type to cast to. If null, uses the element's own type.
   * @returns {FakeElement} A new instance of the specific element subclass.
   * @private
   */
  __cast(asType = null) {
    // We'll return an object that matches the type.
    const item = this.__elementMapItem;
    const {
      __type: type
    } = item;
    asType = asType || type;
    if (type !== asType) {
      throw new Error(`${type} can't be cast as ${asType}`);
    }
    const factory = getElementFactory(asType);
    return factory(this.__shadowDocument, this.__name);
  }

  /**
   * Returns the current element as a Body.
   * @returns {GoogleAppsScript.Document.Body} The current element.
   */
  asBody() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asBody');
    if (nargs !== 0) matchThrow();
    return this.__cast('BODY_SECTION');
  }

  /**
   * Returns the current element as a Date.
   * @returns {GoogleAppsScript.Document.Date} The current element.
   */
  asDate() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asDate');
    if (nargs !== 0) matchThrow();
    return this.__cast('DATE');
  }

  /**
   * Returns the current element as an Equation.
   * @returns {GoogleAppsScript.Document.Equation} The current element.
   */
  asEquation() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asEquation');
    if (nargs !== 0) matchThrow();
    return this.__cast('EQUATION');
  }

  /**
   * Returns the current element as an EquationFunction.
   * @returns {GoogleAppsScript.Document.EquationFunction} The current element.
   */
  asEquationFunction() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asEquationFunction');
    if (nargs !== 0) matchThrow();
    return this.__cast('EQUATION_FUNCTION');
  }

  /**
   * Returns the current element as an EquationFunctionArgumentSeparator.
   * @returns {GoogleAppsScript.Document.EquationFunctionArgumentSeparator} The current element.
   */
  asEquationFunctionArgumentSeparator() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asEquationFunctionArgumentSeparator');
    if (nargs !== 0) matchThrow();
    return this.__cast('EQUATION_FUNCTION_ARGUMENT_SEPARATOR');
  }

  /**
   * Returns the current element as an EquationSymbol.
   * @returns {GoogleAppsScript.Document.EquationSymbol} The current element.
   */
  asEquationSymbol() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asEquationSymbol');
    if (nargs !== 0) matchThrow();
    return this.__cast('EQUATION_SYMBOL');
  }

  /**
   * Returns the current element as a FooterSection.
   * @returns {GoogleAppsScript.Document.FooterSection} The current element.
   */
  asFooterSection() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asFooterSection');
    if (nargs !== 0) matchThrow();
    return this.__cast('FOOTER_SECTION');
  }

  /**
   * Returns the current element as a Footnote.
   * @returns {GoogleAppsScript.Document.Footnote} The current element.
   */
  asFootnote() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asFootnote');
    if (nargs !== 0) matchThrow();
    return this.__cast('FOOTNOTE');
  }

  /**
   * Returns the current element as a FootnoteSection.
   * @returns {GoogleAppsScript.Document.FootnoteSection} The current element.
   */
  asFootnoteSection() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asFootnoteSection');
    if (nargs !== 0) matchThrow();
    return this.__cast('FOOTNOTE_SECTION');
  }

  /**
   * Returns the current element as a HeaderSection.
   * @returns {GoogleAppsScript.Document.HeaderSection} The current element.
   */
  asHeaderSection() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asHeaderSection');
    if (nargs !== 0) matchThrow();
    return this.__cast('HEADER_SECTION');
  }

  /**
   * Returns the current element as a HorizontalRule.
   * @returns {GoogleAppsScript.Document.HorizontalRule} The current element.
   */
  asHorizontalRule() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asHorizontalRule');
    if (nargs !== 0) matchThrow();
    return this.__cast('HORIZONTAL_RULE');
  }

  /**
   * Returns the current element as an InlineDrawing.
   * @returns {GoogleAppsScript.Document.InlineDrawing} The current element.
   */
  asInlineDrawing() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asInlineDrawing');
    if (nargs !== 0) matchThrow();
    return this.__cast('INLINE_DRAWING');
  }

  /**
   * Returns the current element as an InlineImage.
   * @returns {GoogleAppsScript.Document.InlineImage} The current element.
   */
  asInlineImage() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asInlineImage');
    if (nargs !== 0) matchThrow();
    return this.__cast('INLINE_IMAGE');
  }

  /**
   * Returns the current element as a ListItem.
   * @returns {GoogleAppsScript.Document.ListItem} The current element.
   */
  asListItem() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asListItem');
    if (nargs !== 0) matchThrow();
    return this.__cast('LIST_ITEM');
  }

  /**
   * Returns the current element as a PageBreak.
   * @returns {GoogleAppsScript.Document.PageBreak} The current element.
   */
  asPageBreak() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asPageBreak');
    if (nargs !== 0) matchThrow();
    return this.__cast('PAGE_BREAK');
  }

  /**
   * Returns the current element as a Paragraph.
   * @returns {GoogleAppsScript.Document.Paragraph} The current element.
   */
  asParagraph() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asParagraph');
    if (nargs !== 0) matchThrow();
    return this.__cast('PARAGRAPH');
  }

  /**
   * Returns the current element as a Person.
   * @returns {GoogleAppsScript.Document.Person} The current element.
   */
  asPerson() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asPerson');
    if (nargs !== 0) matchThrow();
    return this.__cast('PERSON');
  }

  /**
   * Returns the current element as a RichLink.
   * @returns {GoogleAppsScript.Document.RichLink} The current element.
   */
  asRichLink() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asRichLink');
    if (nargs !== 0) matchThrow();
    return this.__cast('RICH_LINK');
  }

  /**
   * Returns the current element as a Table.
   * @returns {GoogleAppsScript.Document.Table} The current element.
   */
  asTable() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asTable');
    if (nargs !== 0) matchThrow();
    return this.__cast('TABLE');
  }

  /**
   * Returns the current element as a TableCell.
   * @returns {GoogleAppsScript.Document.TableCell} The current element.
   */
  asTableCell() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asTableCell');
    if (nargs !== 0) matchThrow();
    return this.__cast('TABLE_CELL');
  }

  /**
   * Returns the current element as a TableOfContents.
   * @returns {GoogleAppsScript.Document.TableOfContents} The current element.
   */
  asTableOfContents() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asTableOfContents');
    if (nargs !== 0) matchThrow();
    return this.__cast('TABLE_OF_CONTENTS');
  }

  /**
   * Returns the current element as a TableRow.
   * @returns {GoogleAppsScript.Document.TableRow} The current element.
   */
  asTableRow() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asTableRow');
    if (nargs !== 0) matchThrow();
    return this.__cast('TABLE_ROW');
  }

  /**
   * Returns the current element as a Text.
   * @returns {GoogleAppsScript.Document.Text} The current element.
   */
  asText() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asText');
    if (nargs !== 0) matchThrow();
    return this.__cast('TEXT');
  }

  /**
   * Returns the current element as a FootnoteReference.
   * @returns {GoogleAppsScript.Document.FootnoteReference} The current element.
   * @private
   */
  asFootnoteReference() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.asFootnoteReference');
    if (nargs !== 0) matchThrow();
    return this.__cast('FOOTNOTE_REFERENCE');
  }

  /**
   * Returns the string "Element".
   * @returns {string}
   */
  toString() {
    return this.constructor.name.replace('Fake', '');
  }
}

/**
 * Creates a new proxied FakeElement instance.
 * @param {...any} args The arguments for the FakeElement constructor.
 * @returns {FakeElement} A new proxied FakeElement instance.
 */
export const newFakeElement = (...args) => Proxies.guard(new FakeElement(...args));
