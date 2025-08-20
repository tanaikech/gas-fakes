import { Utils } from "../../support/utils.js";
import { ElementType } from '../enums/docsenums.js';
const { is } = Utils
import { getElementFactory } from './elementRegistry.js'
import { signatureArgs } from '../../support/helpers.js';
import { findItem, makeProtectionRequests } from './elementhelpers.js';
import { paragraphOptions, pageBreakOptions, tableOptions, textOptions } from './elementoptions.js';


/**
 * Validates arguments for the elementInserter function.
 * @private
 */
const validateInserterArgs = (elementOrText, childIndex, options) => {
  const {
    canAcceptArray = false,
    elementType,
    insertMethodSignature,
    canAcceptText,
    packCanBeNull = false
  } = options;

  const isAppend = is.null(childIndex);
  const isText = is.string(elementOrText);
  const isArray = is.array(elementOrText);
  const isObject = !is.array && is.object(elementOrText);
  const isDetached = isObject && !!elementOrText.__isDetached;
  const typeMatches = isObject && elementOrText.getType() === elementType;

  const { matchThrow } = signatureArgs([childIndex, elementOrText], insertMethodSignature);

  if (isArray && !canAcceptArray) {
    matchThrow();
  }
  if (isObject && !typeMatches) {
    matchThrow();
  }

  if (isObject && (elementOrText.getParent() || !isDetached)) {
    throw new Error('Element must be detached.');
  }

  if (isText && !canAcceptText) {
    matchThrow();
  }

  if (!packCanBeNull && is.nullOrUndefined(elementOrText)) {
    matchThrow();
  }
  if (!isAppend && (!is.integer(childIndex) || !(packCanBeNull || isText || typeMatches))) {
    matchThrow();
  }
  if (isAppend && !is.nullOrUndefined(childIndex)) {
    matchThrow();
  }

  return { isAppend, isDetached };
};

/**
 * Calculates insertion points and generates initial protection requests.
 * @private
 */
const calculateInsertionPointsAndInitialRequests = (self, childIndex, isAppend, shadow, options) => {
  const { elementMap, shadowDocument } = shadow.structure;
  const item = elementMap.get(self.__name);
  const children = item.__twig.children;

  let insertIndex, newElementStartIndex, childStartIndex, requests = [], leading = '', trailing = '';

  if (isAppend) {
    const isParaAppend = self.getType() === ElementType.PARAGRAPH;
    if (isParaAppend) {
      // Appending to an existing paragraph. The container is modified.
      insertIndex = item.endIndex - 1;
      newElementStartIndex = item.startIndex; // The container is the paragraph itself.

      const lastChildTwig = children.length > 0 ? children[children.length - 1] : null;
      const lastChildItem = lastChildTwig ? elementMap.get(lastChildTwig.name) : null;

      // If we are appending text and the last child is also text, they might merge.
      // The new text will become part of the existing text element.
      if (options.elementType === ElementType.TEXT && lastChildItem && lastChildItem.__type === 'TEXT') {
        childStartIndex = lastChildItem.startIndex;
      } else {
        // For other elements (like PageBreak) or when appending to a non-text element,
        // the new child will start exactly where we insert it.
        childStartIndex = insertIndex;
      }
    } else {
      // Appending to the body, creating a new element.
      const endIndexBefore = shadowDocument.__endBodyIndex;
      insertIndex = endIndexBefore - 1;
      newElementStartIndex = endIndexBefore; // The new element will start after the old content.
      childStartIndex = null; // Child start index is unknown, must be found within container.

      // if it's a table type, it will automatically insert a leading \n so we dont need to force it
      leading = options.elementType === ElementType.TABLE ? '' : '\n';

      const targetChildTwig = children.length > 0 ? children[children.length - 1] : item.__twig;
      requests = children.length ? makeProtectionRequests(shadow, targetChildTwig) : [];
    }
  } else {
    // It's an insert operation, creating a new element.
    if (childIndex < 0 || childIndex >= children.length) {
      throw new Error(`Child index (${childIndex}) must be less than the number of child elements (${children.length}).`);
    }
    const targetChildTwig = children[childIndex];
    const targetChildItem = elementMap.get(targetChildTwig.name);
    let protectTwig = null
    // rules with tables mean we have to insert before preceding paragrap
    if (targetChildItem.__type === "TABLE") {
      insertIndex = targetChildItem.startIndex - 1; // Insert before the table.
      if (childIndex < 1) {
        // because a table cant ever be the first child
        throw new Error(`Cannot insert before the first child element table (${targetChildItem.name})`);
      }
      protectTwig = children[childIndex - 1]
      leading = '\n'
    } else {
      insertIndex = targetChildItem.startIndex
      trailing = '\n'
    }
    // account for the leading \n that a table will insert autonatically
    newElementStartIndex = options.elementType === ElementType.TABLE ? insertIndex + 1 : insertIndex;
    // TODO validate what this is used for
    childStartIndex = null; // Child start index is unknown, must be found within container.
    requests = protectTwig ? makeProtectionRequests(shadow, protectTwig) : []
  }

  return { insertIndex, newElementStartIndex, childStartIndex, requests, leading, trailing };
};

/**
 * Finds and creates the new element instance after a batch update.
 * @private
 */
const findAndReturnNewElement = (shadow, newElementStartIndex, childStartIndex, isAppend, options) => {
  const { elementType, findType, findChildType } = options;

  const findContainerType = (is.function(findType) ? findType(isAppend) : findType) || elementType.toString();
  const childTypeToFind = is.function(findChildType) ? findChildType(isAppend) : findChildType;
  let finalItem;

  // For operations that return a child element (like PageBreak), we need to find it.
  if (childTypeToFind) {
    if (childStartIndex !== null) {
      // The child's start index was predictable (e.g., appending to an existing paragraph).
      finalItem = findItem(shadow.elementMap, childTypeToFind, childStartIndex);
    } else {
      // A new container was created. Find it, then find the child within it.
      const containerItem = findItem(shadow.elementMap, findContainerType, newElementStartIndex);
      const childTwig = (containerItem.__twig.children || []).find(twig => {
        const childItem = shadow.elementMap.get(twig.name);
        return childItem && childItem.__type === childTypeToFind;
      });
      if (!childTwig) {
        throw new Error(`Could not find child of type ${childTypeToFind} in new element`);
      }
      finalItem = shadow.elementMap.get(childTwig.name);
    }
  } else {
    // For operations that return the container element itself.
    finalItem = findItem(shadow.elementMap, findContainerType, newElementStartIndex);
  }

  const factory = getElementFactory(finalItem.__type);
  return factory(shadow.structure, finalItem.__name);
};

/**
 * A generic inserter for various element types (Paragraph, PageBreak, etc.).
 * It handles both appending to the end of a container and inserting at a specific index.
 * This function orchestrates argument validation, calculating insertion points,
 * building and executing API requests, and returning the newly created element.
 * @param {FakeContainerElement} self - The container element to insert into (e.g., Body, Paragraph).
 * @param {string|object} elementOrText - The content to insert (string or a detached element).
 * @param {number|null} childIndex - The index to insert at, or null for an append operation.
 * @param {object} options - Configuration for the specific insertion type.
 * @returns {object} The newly created element.
 * @private
 */
const elementInserter = (self, elementOrText, childIndex, options) => {
  // 1. Validate arguments and determine operation type.
  const { isAppend, isDetached } = validateInserterArgs(elementOrText, childIndex, options);

  // 2. Get current document state.
  const shadow = self.__structure.shadowDocument;
  const structure = shadow.structure;
  const segmentId = shadow.__segmentId;

  // 3. Calculate insertion points, child start index, and initial "protection" requests.
  const { insertIndex, newElementStartIndex, childStartIndex, requests, leading, trailing } = calculateInsertionPointsAndInitialRequests(
    self, childIndex, isAppend, shadow, options
  );

  // 4. Build the main batch update request list.
  const { getMainRequest, getStyleRequests } = options;
  const mainRequests = [].concat(getMainRequest({
    content: elementOrText,
    location: { index: insertIndex, segmentId },
    isAppend,
    self,
    structure,
    leading,
    trailing
  }));
  requests.unshift(...mainRequests);

  // Add styling requests if inserting a copied (detached) element.
  if (isDetached && getStyleRequests) {
    requests.push(...getStyleRequests(elementOrText, newElementStartIndex, isAppend));
  }

  // 5. Execute the update and refresh the document state.
  Docs.Documents.batchUpdate({ requests }, shadow.getId());
  shadow.refresh();


  // 7. Find and return the newly created element instance.
  return findAndReturnNewElement(shadow, newElementStartIndex, childStartIndex, isAppend, options);
};



// THE API has no way of inserting a horizontal rule
// parking this for now - it'll need to be resurrected if this issue ever gets resolved
// https://issuetracker.google.com/issues/437825936


export const appendText = (self, textOrTextElement) => {
  return elementInserter(self, textOrTextElement, null, textOptions);
};

export const appendParagraph = (self, textOrParagraph) => {
  return elementInserter(self, textOrParagraph, null, paragraphOptions);
};

export const insertParagraph = (self, childIndex, paragraph) => {
  return elementInserter(self, paragraph, childIndex, paragraphOptions);
};

export const appendPageBreak = (self, pageBreak) => {
  return elementInserter(self, pageBreak, null, pageBreakOptions);
};

export const insertPageBreak = (self, childIndex, pageBreak) => {
  return elementInserter(self, pageBreak, childIndex, pageBreakOptions);
};

export const appendTable = (self, cells) => {
  return elementInserter(self, cells, null, tableOptions);
};

export const insertTable = (self, childIndex, table) => {
  return elementInserter(self, table, childIndex, tableOptions);
};