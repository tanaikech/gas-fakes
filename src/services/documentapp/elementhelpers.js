/**
 * @file Provides helper functions for working with fake document elements.
 */


import { ElementType } from '../enums/docsenums.js';
import { Utils } from "../../support/utils.js";
const { is } = Utils
const { getEnumKeys } = Utils

// figures out what kind of element this is from the properties present
export const getElementProp = (se) => {
  // these are the known types
  const keys = getEnumKeys(ElementType);
  const ownKeys = Reflect.ownKeys(se);

  // these are the known unsupported types
  const unsupported = ["sectionBreak"]
  if (ownKeys.some(f => unsupported.includes(f))) {
    return null
  }
  // need to massage the keys to match the apps script props
  const upperKeys = ownKeys.map(f => f.toUpperCase()).map(f => {
    switch (f) {
      case 'TEXTRUN':
        return 'TEXT';
      case 'BODY':
        return 'BODY_SECTION';
      case 'PAGEBREAK':
        return 'PAGE_BREAK';
      case 'TABLE':
        return 'TABLE';
      case 'TABLEROW':
        return 'TABLE_ROW';
      case 'TABLECELLS':
        return 'TABLE_CELL';
      case 'PARAGRAPH':
        return 'PARAGRAPH'
      default:
        return f;
    }
  })

  // now see any of the props that are in se are known interesting props
  const idx = upperKeys.findIndex(key => keys.includes(key))

  if (idx === -1) {
    console.log(se)
    throw new Error('couldnt establish structural element type')
  }
  const prop = ownKeys[idx]
  const type = keys.find(key => key === upperKeys[idx])
  if (type === -1) {
    console.log(se, prop)
    throw new Error('couldnt establish structural element type')
  }

  return {
    prop,
    type
  }

}

/**
 * Recursively traverses an element's children to build a text string.
 * @param {object} twig The twig of the element to process.
 * @param {import('./shadow.js').ShadowStructure} structure The document structure manager.
 * @returns {string} The concatenated text.
 * @private
 */
const getTextRecursive = (twig, structure) => {
  const item = structure.elementMap.get(twig.name);
  if (!item) return '';

  // Base case: Text element. In the API, text is inside a paragraph's elements array.
  if (item.paragraph) {
    return item.paragraph.elements.map(e => e.textRun?.content || '').join('');
  }

  // Recursive case: Container element.
  if (item.__twig && item.__twig.children) {
    return item.__twig.children
      .map(childTwig => getTextRecursive(childTwig, structure))
      .join('');
  }

  return '';
};

/**
 * Gets the text content of an element, flattening all child text elements.
 * @param {import('./fakeelement.js').FakeElement} element The element to get text from.
 * @returns {string} The text content.
 */
export const getText = (element) => {
  if (!element || element.__isDetached) {
    // For a detached element, the content is in the cloned item.
    const item = element.__elementMapItem;
    return item.paragraph?.elements?.map(e => e.textRun?.content || '').join('').replace(/\n$/, '') || '';
  }

  const text = getTextRecursive(element.__twig, element.__structure);
  // Paragraphs in the Docs API have a trailing newline. The Apps Script getText() method removes it.
  return text.replace(/\n$/, '');
};
export const findItem = (elementMap, type, startIndex) => {
  const item = Array.from(elementMap.values()).find(f => f.__type === type && f.startIndex === startIndex)
  if (!item) {
    console.log(elementMap.values())
    throw new Error(`Couldnt find element ${type} at ${startIndex}`)
  }
  return item
}

// when we insert an element, its predecessor named range will end up being adjusted, so we need to reset it
// there isnt an update named range, so we delete and insert using the same name as before
// this means the nr id will change, but it doesnt matter.
export const makeProtectionRequests = (shadow, twig) => {
  const ur = [];
  const elementMap = shadow.structure.elementMap;
  const stet = (innerTwig, endIndex = null) => {
    const elItem = elementMap.get(innerTwig.name);
    if (is.null(endIndex)) endIndex = elItem.endIndex;
    if (!elItem) {
      throw new Error(`stet: element with name ${innerTwig.name} not found in refreshed map`);
    }

    const nr = shadow.nrMap.get(elItem.__name);
    if (nr) {
      ur.push({ deleteNamedRange: { namedRangeId: nr.namedRangeId } });
      ur.push({
        createNamedRange: {
          name: elItem.__name,
          // because we need to preserve the current state of the named range
          range: {
            startIndex: elItem.startIndex,
            endIndex,
          },
        },
      });
    }
    (elItem.__twig?.children || []).forEach(childTwig => stet(childTwig));
  };
  stet(twig);
  return ur;
};