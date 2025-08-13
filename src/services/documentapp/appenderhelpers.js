import { Utils } from "../../support/utils.js";
import { ElementType } from '../enums/docsenums.js';
const { is } = Utils
import { getElementFactory } from './elementRegistry.js'
import { signatureArgs } from '../../support/helpers.js';
import { findItem, makeProtectionRequests } from './elementhelpers.js';
import { paragraphOptions, pageBreakOptions, tableOptions } from './elementoptions.js';
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
const calculateInsertionPointsAndInitialRequests = (self, childIndex, isAppend, shadow) => {
  const structure = shadow.structure;
  const item = structure.elementMap.get(self.__name);
  const children = item.__twig.children;

  let insertIndex;
  let newElementStartIndex;
  let requests;

  if (isAppend) {
    const isParaAppend = self.getType() === ElementType.PARAGRAPH;
    if (isParaAppend) {
      insertIndex = item.endIndex - 1;
      newElementStartIndex = item.startIndex;
    } else {
      const endIndexBefore = structure.shadowDocument.__endBodyIndex;
      insertIndex = endIndexBefore - 1;
      newElementStartIndex = endIndexBefore;
    }
    const targetChildTwig = children.length > 0 ? children[children.length - 1] : item.__twig;
    requests = children.length ? makeProtectionRequests(shadow, targetChildTwig) : [];
  } else { // It's an insert
    if (childIndex < 0 || childIndex >= children.length) {
      throw new Error(`Child index (${childIndex}) must be less than or equal to the number of child elements (${children.length}).`);
    }
    const targetChildTwig = children[childIndex];
    const targetChildItem = structure.elementMap.get(targetChildTwig.name);
    insertIndex = targetChildItem.startIndex;
    newElementStartIndex = insertIndex;
    requests = makeProtectionRequests(shadow, targetChildTwig);
  }

  return { insertIndex, newElementStartIndex, requests };
};

/**
 * Finds and creates the new element instance after a batch update.
 * @private
 */
const findAndReturnNewElement = (self, shadow, insertIndex, newElementStartIndex, isAppend, options) => {
  const { elementType, findType, findChildType } = options;

  const findContainerType = (is.function(findType) ? findType(isAppend) : findType) || elementType.toString();
  const childTypeToFind = is.function(findChildType) ? findChildType(isAppend) : findChildType;

  // For operations that return a child element (like PageBreak), we need to find it.
  if (childTypeToFind) {
    // When inserting into a paragraph (append or insert), the new child's start index is the insertion point.
    if (self.getType() === ElementType.PARAGRAPH) {
      const finalItem = findItem(shadow.__elementMap, childTypeToFind, insertIndex);
      const factory = getElementFactory(childTypeToFind);
      return factory(shadow.structure, finalItem.__name);
    }

    // For other cases (body appends, all inserts), find the container first, then the child.
    const containerItem = findItem(shadow.__elementMap, findContainerType, newElementStartIndex);
    const childTwig = (containerItem.__twig.children || []).find(twig => {
      const childItem = shadow.__elementMap.get(twig.name);
      return childItem && childItem.__type === childTypeToFind;
    });
    if (!childTwig) {
      throw new Error(`Could not find child of type ${childTypeToFind} in new element`);
    }
    const finalItem = shadow.__elementMap.get(childTwig.name);
    const factory = getElementFactory(childTypeToFind);
    return factory(shadow.structure, finalItem.__name);
  }

  // For operations that return the container element itself.
  const containerItem = findItem(shadow.__elementMap, findContainerType, newElementStartIndex);
  const factory = getElementFactory(findContainerType);
  return factory(shadow.structure, containerItem.__name);
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

  // 3. Calculate insertion points and initial "protection" requests for existing elements.
  const { insertIndex, newElementStartIndex, requests } = calculateInsertionPointsAndInitialRequests(
    self, childIndex, isAppend, shadow
  );

  // 4. Build the main batch update request list.
  const { getMainRequest, getStyleRequests } = options;
  const mainRequests = [].concat(getMainRequest(elementOrText, { index: insertIndex, segmentId }, isAppend, self, structure));
  requests.unshift(...mainRequests);

  // Add styling requests if inserting a copied (detached) element.
  if (isDetached && getStyleRequests) {
    requests.push(...getStyleRequests(elementOrText, newElementStartIndex, isAppend));
  }

  // 5. Execute the update and refresh the document state.
  Docs.Documents.batchUpdate({ requests }, shadow.getId());
  shadow.refresh();

  // 6. Find and return the newly created element instance.
  return findAndReturnNewElement(self, shadow, insertIndex, newElementStartIndex, isAppend, options);
};



// THE API has no way of inserting a horizontal rule
// parking this for now - it'll need to be resurrected if this issue ever gets resolved
// https://issuetracker.google.com/issues/437825936


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