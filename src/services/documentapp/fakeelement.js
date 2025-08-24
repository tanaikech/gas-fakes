/**
 * @file Provides a fake implementation of the base Element class.
 */
import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { makeNrPrefix } from './nrhelpers.js';
import { ElementType } from '../enums/docsenums.js';
import { getElementFactory } from './elementRegistry.js';

/**
 * @typedef {import('./shadow.js').ShadowStructure} ShadowStructure
 */

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
    constructor(structure, nameOrItem) {
      const { nargs, matchThrow } = signatureArgs(arguments, 'FakeElement');
      if (nargs !== 2) matchThrow();

      // An element is either "attached" (with a structure and a name)
      // or "detached" (with a structural element but no live structure).
      // A detached element is created by copy().
      if (is.string(nameOrItem)) { // Attached
        if (!is.object(structure) || !nameOrItem.startsWith(makeNrPrefix())) {
          throw new Error('Invalid arguments for attached FakeElement');
        }
        this.__isDetached = false;
        this.__structure = structure;
        this.__name = nameOrItem;
        this.__detachedItem = null;
      } else if (is.object(nameOrItem)) { // Detached
        if (!is.null(structure)) {
          throw new Error('Structure must be null for a detached FakeElement');
        }
        this.__isDetached = true;
        this.__structure = null;
        this.__name = null;
        this.__detachedItem = nameOrItem;
      }

      // Dynamically add as...() methods like asParagraph()
      Reflect.ownKeys(asCasts).forEach((cast) => {
        const ob = asCasts[cast];
        this[ob.method] = this.__cast.bind(this, cast);
      });
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
    return this.__getElementMapItem(this.__name);
  }

  /**
   * Helper to retrieve an item from the structure's element map.
   * @param {string} name The name of the element to retrieve.
   * @returns {object} The element map item.
   * @private
   */
  __getElementMapItem(name) {
    const item = this.__structure.elementMap.get(name);
    if (!item) {
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
    const item = this.__structure.elementMap.get(name);
    if (!item) {
      throw new Error(`Parent element with name ${name} not found`);
    }
    // Create a new element instance for the parent and cast it to its proper type.
    return newFakeElement(this.__structure, name).__cast();
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
    return factory(this.__structure, this.__name);
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