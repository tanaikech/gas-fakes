/**
 * @file Provides helper functions for working with fake document elements.
 */


import { ElementType } from '../enums/docsenums.js';
import { Utils } from "../../support/utils.js";
const { is } = Utils
const { getEnumKeys } = Utils

// figures out what kind of element this is from the properties present
export const getElementProp = (se) => {
  const ownKeys = Reflect.ownKeys(se);

  // these are the known unsupported types
  const unsupported = ["sectionBreak"];
  if (ownKeys.some(f => unsupported.includes(f))) {
    return null;
  }

  // The order of these checks is important to distinguish between container types.
  // These elements contain their content in a nested property.
  if (se.table) return { prop: 'table', type: 'TABLE' };
  if (se.paragraph) return { prop: 'paragraph', type: 'PARAGRAPH' };

  // These elements are "naked" - their children are at the top level.
  // The prop is null because we don't need to look deeper into the object.
  if (se.tableCells) return { prop: null, type: 'TABLE_ROW' };
  if (se.textRun) return { prop: null, type: 'TEXT' };
  if (se.pageBreak) return { prop: null, type: 'PAGE_BREAK' };
  if (se.horizontalRule) return { prop: null, type: 'HORIZONTAL_RULE' };

  if (se.body) {
    return { prop: 'body', type: 'BODY_SECTION' };
  }

  console.log(se);
  throw new Error('couldnt establish structural element type');
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