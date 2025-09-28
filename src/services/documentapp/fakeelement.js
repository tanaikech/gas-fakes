/**
 * @file Provides a fake implementation of the base Element class.
 */
import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { ElementType } from '../enums/docsenums.js';
import { getElementFactory } from './elementRegistry.js';
import { findItem } from './elementhelpers.js';

/**
 * @typedef {import('./shadow.js').ShadowStructure} ShadowStructure
 */

const shadowPrefix = "GAS_FAKE_";

/**
 * A map of element types to their corresponding 'as' methods (e.g., asParagraph).
 * @private
 */
const asCasts = {
  PARAGRAPH: {
    method: 'asParagraph',
  },
  TABLE: {
    method: 'asTable',
  },
  TABLE_ROW: {
    method: 'asTableRow',
  },
  TABLE_CELL: {
    method: 'asTableCell',
  },
  TEXT: {
    method: 'asText',
  },
  PAGE_BREAK: {
    method: 'asPageBreak',
  },
  HORIZONTAL_RULE: {
    method: 'asHorizontalRule',
  },
  FOOTNOTE_REFERENCE: {
    method: 'asFootnoteReference',
  },
};

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
     * @param {ShadowStructure | null} structure - The document's structure manager, or null for a detached element.
     * @param {string | object} nameOrItem - The unique name of the element within the structure, or the raw element resource for a detached element.
     * @private
     */
  constructor(shadowDocument, nameOrItem) {
      const { nargs, matchThrow } = signatureArgs(arguments, 'FakeElement');
      if (nargs !== 2) matchThrow();

      // An element is either "attached" (with a structure and a name)
      // or "detached" (with a structural element but no live structure).
      // A detached element is created by copy().
      if (is.string(nameOrItem)) { // Attached
      if (!is.object(shadowDocument) || !nameOrItem.startsWith(shadowPrefix)) {
          throw new Error(`Invalid arguments for attached FakeElement: ${nameOrItem}. Name must start with '${shadowPrefix}'.`);
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

      // Dynamically add as...() methods like asParagraph()
      Reflect.ownKeys(asCasts).forEach((cast) => {
        const ob = asCasts[cast];
        this[ob.method] = this.__cast.bind(this, cast);
      });
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
    const { __type: type } = item;
    asType = asType || type;
    if (type !== asType) {
      throw new Error(`${type} can't be cast as ${asType}`);
    }
    const factory = getElementFactory(asType);
    return factory(this.__shadowDocument, this.__name);
  }

  /**
   * Returns the string "Element".
   * @returns {string}
   */
  toString() {
    return 'Element';
  }
}

/**
 * Creates a new proxied FakeElement instance.
 * @param {...any} args The arguments for the FakeElement constructor.
 * @returns {FakeElement} A new proxied FakeElement instance.
 */
export const newFakeElement = (...args) => Proxies.guard(new FakeElement(...args));
