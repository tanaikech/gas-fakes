import { Proxies } from '../../support/proxies.js';
import { signatureArgs, unimplementedProps } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { makeNrPrefix } from './nrhelpers.js'
import { ElementType } from '../enums/docsenums.js';
import { getElementFactory } from './elementRegistry.js';

// the subclasses like paragraph are extensions of element, so we'll implement the shared ones here
// with placeholders for the others which we'll remove as they are implemented in the subclass
const propsWaitingRoom = [
  'addPositionedImage',
  'appendHorizontalRule',
  'appendInlineImage',
  'appendPageBreak',
  'appendText',
  'asAnchoredDrawing',
  'asBody',
  'asCodeSnippet',
  'asCommentSection',
  'asDate',
  'asDocumentBodySection',
  'asDocumentElement',
  'asEquation',
  'asEquationFunction',
  'asEquationFunctionArgumentSeparator',
  'asEquationSymbol',
  'asFooterSection',
  'asFootnote',
  'asFootnoteSection',
  'asHeaderSection',
  'asHorizontalRule',
  'asInlineDrawing',
  'asInlineImage',
  'asListItem',
  'asPageBreak',
  'asPerson',
  'asRichLink',
  'asTable',
  'asTableCell',
  'asTableOfContents',
  'asTableRow',
  'asTableRow',
  'asText',
  'asVariable',
  'clear',
  'copy',
  'editAsText',
  'findElement',
  'findText',
  'getAlignment',
  'getAttributes',
  'getBackgroundColor',
  'getChild',
  'getChildIndex',
  'getFontFamily',
  'getFontSize',
  'getForegroundColor',
  'getIndentEnd',
  'getIndentFirstLine',
  'getIndentStart',
  'getLineSpacing',
  'getLinkUrl',
  'getNextSibling',
  'getNumChildren',
  'getPositionedImage',
  'getPositionedImages',
  'getPreviousSibling',
  'getSpacingAfter',
  'getSpacingBefore',
  'getText',
  'getTextAlignment',
  'insertHorizontalRule',
  'insertInlineImage',
  'insertPageBreak',
  'insertText',
  'isAtDocumentEnd',
  'isBold',
  'isItalic',
  'isLeftToRight',
  'isStrikethrough',
  'isUnderline',
  'merge',
  'removeChild',
  'removeFromParent',
  'removePositionedImage',
  'replaceText',
  'setAlignment',
  'setAttributes',
  'setBackgroundColor',
  'setBold',
  'setFontFamily',
  'setFontSize',
  'setForegroundColor',
  'setIndentEnd',
  'setIndentFirstLine',
  'setIndentStart',
  'setItalic',
  'setLeftToRight',
  'setLineSpacing',
  'setLinkUrl',
  'setSpacingAfter',
  'setSpacingBefore',
  'setStrikethrough',
  'setText',
  'setTextAlignment',
  'setUnderline',
];

const asCasts = {
  "PARAGRAPH": {
    method: "asParagraph",
    element: "newParagraph"
  },
  "PAGE_BREAK": {
    method: "asPageBreak",
    element: "newPageBreak"
  },
  "TEXT": {
    method: "asText",
    element: "newText"
  }
}


/**
 * generic class for an element
 * in docs everything is an element, including the body
 * an elelement can presetn its subclass with methids like asParagraph, asBody etc
 */
export class FakeElement {
    /**
     * the parent will be the containg elemement
     * @param {object} se the structural element to build the element from
     * @param {*} se 
     */
    constructor(structure, nameOrItem) {
      const { nargs, matchThrow } = signatureArgs(arguments, 'FakeElement');
      if (nargs !== 2) matchThrow();

      // An element is either "attached" (with a structure and a name)
      // or "detached" (with a structural element but no live structure).
      // A detached element is created by copy().
      if (is.string(nameOrItem)) { // Attached
        if (!is.object(structure) || !nameOrItem.startsWith(makeNrPrefix(null))) {
          throw new Error("Invalid arguments for attached FakeElement");
        }
        this.__isDetached = false;
        this.__structure = structure;
        this.__name = nameOrItem;
        this.__detachedItem = null;
      } else if (is.object(nameOrItem)) { // Detached
        if (!is.null(structure)) {
          throw new Error("Structure must be null for a detached FakeElement");
        }
        this.__isDetached = true;
        this.__structure = null;
        this.__name = null;
        this.__detachedItem = nameOrItem;
      }

      Reflect.ownKeys (asCasts).forEach(cast => {
        const ob = asCasts[cast]
        this[ob.method] = this.__cast.bind(this, cast)
      })

    }

  get __elementMapItem() {
    if (this.__isDetached) {
      return this.__detachedItem;
    }
  return this.__getElementMapItem(this.__name)
}

__getElementMapItem(name) {
  const item = this.__structure.elementMap.get(name)
  if (!item) {
    throw new Error(`element with name ${name} not found`);
  }
  return item
}

  get __twig() {
  return this.__elementMapItem.__twig
}

getParent() {
  if (this.__isDetached) {
    return null;
  }
  // the body doesnt have a parent
  if (!this.__twig.parent) return null

  const name = this.__twig.parent.name
  const item = this.__structure.elementMap.get(name)
  if (!item) {
    throw new Error(`element with name ${name} not found`);
  }
  return newFakeElement(this.__structure, name).__cast()

}

getType() {
  const item = this.__elementMapItem
  const type = item.__type
  const enumType = ElementType[type]
  if (!enumType) {
    throw new Error(`element with type ${type} not found`);
  }
  return enumType
}

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
            parent: null // Break the circular reference
          };
        } else {
          clone[key] = deepClone(obj[key], cache);
        }
      }
    }
    return clone;
  };
  // at this point we have a cloned item -but all its children/parents/named range names will be wrong
  const clonedItem = deepClone(originalItem);

  // The factory will create the correct subclass (e.g., FakeParagraph)
  const factory = getElementFactory(this.getType().toString());
  return factory(null, clonedItem);
}

__cast(asType=null) {
  // we'll return an object that matches the type
  const item = this.__elementMapItem;
  const type = item.__type
  asType = asType || type
  if (type !== asType) {
    throw new Error(`${type} can't be cast as ${asType}`);
  }
  const factory = getElementFactory(asType);
  return factory(this.__structure, this.__name);
}

toString() {
  return 'Element';
}
}

export const newFakeElement = (...args) => Proxies.guard(new FakeElement(...args));
