import { Utils } from "../../support/utils.js";
import { ElementType } from '../enums/docsenums.js';
const { is, isBlob , stringCircular, lobify} = Utils
import { getElementFactory } from './elementRegistry.js'
import { signatureArgs, notYetImplemented } from '../../support/helpers.js';
import { findItem } from './elementhelpers.js';
import { paragraphOptions, pageBreakOptions, tableOptions, textOptions, listItemOptions, imageOptions, positionedImageOptions } from './elementoptions.js';
import { deleteContentRange, createParagraphBullets, reverseUpdateContent, deleteParagraphBullets } from "./elementblasters.js";

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
  const isObject = !isArray && is.object(elementOrText);
  let isDetached = false;

  const { matchThrow } = signatureArgs([childIndex, elementOrText], insertMethodSignature);

  // Basic signature checks that don't depend on the element's type yet.
  if (!isAppend && !is.integer(childIndex)) matchThrow();
  if (isAppend && !is.nullOrUndefined(childIndex)) matchThrow();
  if (!packCanBeNull && is.nullOrUndefined(elementOrText)) matchThrow();

  if (isObject) {
    // A blob is an object, but doesn't have getType().
    // Other elements (Paragraph, Table, etc.) do.
    if (is.function(elementOrText.getType)) {
      const typeMatches = elementOrText.getType() === elementType;
      if (!typeMatches) {
        matchThrow();
      }

      isDetached = !!elementOrText.__isDetached;
      if (!isDetached) {
        throw new Error('Element must be detached.');
      }
    } else if (!isBlob(elementOrText)) {
      // It's an object, but not a blob and doesn't have getType(). Invalid.
      matchThrow();
    }
  } else {
    // Handle non-object arguments (arrays, strings, null)
    if (isArray && !canAcceptArray) matchThrow();
    if (isText && !canAcceptText) matchThrow();
    // is.nullOrUndefined was already checked, so if we get here with another
    // type (like a number), it's an invalid signature.
    if (!isArray && !isText && !is.nullOrUndefined(elementOrText)) {
      matchThrow();
    }
  }

  return { isAppend, isDetached: isObject && isDetached };
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
    } else { // Appending to a container (Body, Header, Footer, TableCell)
      const children = self.__children;
      if (children.length === 0) {
        // This should not happen for a container that exists in the document.
        // If it does, we have no reference point for the index.
        throw new Error(`Cannot append to an empty container: ${self.toString()}`);
      }
      const lastChildTwig = children[children.length - 1];
      const lastChildItem = elementMap.get(lastChildTwig.name);
      const endIndexBefore = lastChildItem.endIndex;

      insertIndex = endIndexBefore - 1;
      newElementStartIndex = endIndexBefore; // The new element will start after the old content.
      childStartIndex = null; // Child start index is unknown, must be found within container.

      // if it's a table type, it will automatically insert a leading \n so we dont need to force it
      leading = options.elementType === ElementType.TABLE ? '' : '\n';

      // No "protection" requests are needed for appends, as we are not modifying existing elements.
      // The shadow.refresh() call at the end of elementInserter handles all named range updates correctly.
    }
  } else {
    // It's an insert operation.
    const isParaInsert = self.getType() === ElementType.PARAGRAPH;
    if (isParaInsert) {
      // Inserting into an existing paragraph. No newlines needed.
      if (childIndex < 0 || childIndex > children.length) {
        throw new Error(`Child index (${childIndex}) must be between 0 and the number of child elements (${children.length}).`);
      }
      if (children.length === 0 || childIndex === children.length) {
        // Inserting into an empty paragraph or at the end.
        insertIndex = item.endIndex - 1;
      } else {
        // Inserting before an existing child.
        const targetChildTwig = children[childIndex];
        const targetChildItem = elementMap.get(targetChildTwig.name);
        insertIndex = targetChildItem.startIndex;
      }
      newElementStartIndex = item.startIndex; // The container is the paragraph itself.
      childStartIndex = insertIndex; // The new child will start where we insert it.
    } else {
      // It's an insert operation, creating a new element in a Body/Header/etc.
      if (childIndex < 0 || childIndex > children.length) {
        throw new Error(`Child index (${childIndex}) must be between 0 and the number of child elements (${children.length}).`);
      }
      // Handle the case where we are inserting at the end (which is like an append).
      if (childIndex === children.length) {
        const lastChildTwig = children.length > 0 ? children[children.length - 1] : null;
        const lastChildItem = lastChildTwig ? elementMap.get(lastChildTwig.name) : item;
        insertIndex = lastChildItem.endIndex - 1;
        newElementStartIndex = lastChildItem.endIndex;
        leading = '\n';
      } else {
        const targetChildTwig = children[childIndex];
        const targetChildItem = elementMap.get(targetChildTwig.name);

        if (targetChildItem.__type === "TABLE") {
          insertIndex = targetChildItem.startIndex - 1; // Insert before the table.
          leading = '\n';
          newElementStartIndex = insertIndex + 1;
        } else {
          insertIndex = targetChildItem.startIndex;
          trailing = '\n';
          newElementStartIndex = insertIndex;
        }
      }
      childStartIndex = null; // Child start index is unknown, must be found within container.
    }
  }

  return { insertIndex, newElementStartIndex, childStartIndex, requests, leading, trailing };
};

/**
 * Finds and creates the new element instance after a batch update.
 * @private
 */
const findAndReturnNewElement = (shadow, newElementStartIndex, childStartIndex, isAppend, options, segmentId) => {
  const { elementType, findType, findChildType } = options;

  const findContainerType = (is.function(findType) ? findType(isAppend) : findType) || elementType.toString();
  const childTypeToFind = is.function(findChildType) ? findChildType(isAppend) : findChildType;
  let finalItem;

  // For operations that return a child element (like PageBreak), we need to find it.
  if (childTypeToFind) {
    if (childStartIndex !== null) {
      // The child's start index was predictable (e.g., appending to an existing paragraph).
      finalItem = findItem(shadow.elementMap, childTypeToFind, childStartIndex, segmentId);
    } else {
      // A new container was created. Find it, then find the child within it.
      const containerItem = findItem(shadow.elementMap, findContainerType, newElementStartIndex, segmentId);
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
    finalItem = findItem(shadow.elementMap, findContainerType, newElementStartIndex, segmentId);
  }

  const factory = getElementFactory(finalItem.__type);
  return factory(shadow, finalItem.__name);
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
  // Before the mutation, record the container's identity.
  const selfName = self.__name;
  const selfStartIndex = self.__elementMapItem.startIndex;
  const selfType = self.getType().toString();

  // 1. Validate arguments and determine operation type.
  const { isAppend, isDetached } = validateInserterArgs(elementOrText, childIndex, options);

  // 2. Get current document state.
  const shadow = self.__structure.shadowDocument;
  const structure = shadow.structure;
  const segmentId = self.__segmentId;
  const tabId = self.__tabId; // TabId is document-wide for now

  // 3. Calculate insertion points, child start index, and initial "protection" requests.
  let { insertIndex, newElementStartIndex, childStartIndex, requests, leading, trailing } = calculateInsertionPointsAndInitialRequests(
    self, childIndex, isAppend, shadow, options
  );

  // 4. Build the main batch update request list.
  const { getMainRequest, getStyleRequests } = options;
  const mainRequestResult = getMainRequest({
    content: elementOrText,
    location: { index: insertIndex, segmentId, tabId },
    isAppend,
    self,
    structure,
    leading,
    trailing
  });

  let mainRequests;
  let cleanup = null;

  if (is.plainObject(mainRequestResult) && mainRequestResult.requests) {
    mainRequests = [].concat(mainRequestResult.requests);
    cleanup = mainRequestResult.cleanup;
  } else {
    mainRequests = [].concat(mainRequestResult);
  }
  // if we were inserting a table then there;ll be an unwanted \n to remove - this should be -2 from the insertIndex
  // TODO we need to check if that index is actually a paragraph or not otherwise this will fail/screw up
  if (!isAppend && options.elementType === ElementType.TABLE && insertIndex > 1) {
    mainRequests.push(deleteContentRange(insertIndex - 1, insertIndex, segmentId, tabId))
  }
  requests.unshift(...mainRequests);

  // Add styling requests if inserting a copied (detached) element.
  if (isDetached && getStyleRequests) {
    requests.push(...getStyleRequests(elementOrText, newElementStartIndex, isAppend, segmentId, tabId));
  }

  // For new list items (not copied ones), we first insert a paragraph, then apply the bullet.
  // This ensures we don't accidentally apply the bullet to a preceding paragraph by using
  // the reliable newElementStartIndex.
  if (options.elementType === ElementType.LIST_ITEM && !isDetached) {
    requests.push(createParagraphBullets(newElementStartIndex, undefined, segmentId, tabId))
  }

  // The live API forbids setting pageBreakBefore in a header, footer, or footnote.
  // We must remove it from any style requests before sending them.
  const parentType = self.getType();
  if (parentType === ElementType.HEADER_SECTION || parentType === ElementType.FOOTER_SECTION || parentType === ElementType.FOOTNOTE) {
    requests.forEach(req => {
      if (req.updateParagraphStyle) {
        const pStyle = req.updateParagraphStyle.paragraphStyle;
        if (pStyle && pStyle.pageBreakBefore !== undefined) {
          delete pStyle.pageBreakBefore;
          const fields = req.updateParagraphStyle.fields.split(',');
          const newFields = fields.filter(f => f !== 'pageBreakBefore');
          req.updateParagraphStyle.fields = newFields.join(',');
        }
      }
    });
    // Filter out any requests that became empty
    requests = requests.filter(req => !req.updateParagraphStyle || req.updateParagraphStyle.fields);
  }

  // 5. Execute the update and refresh the document state.
  try {
    if (requests.length > 0) {
      Docs.Documents.batchUpdate({ requests }, shadow.getId());
    }
    shadow.refresh(); // must always refresh, as getMainRequest might have side effects
  } finally {
    if (cleanup) {
      cleanup();
    }
  }

  // 6. Handle table content population if necessary. This is a two-phase update
  // because we need the table to exist before we can get the indices to populate its cells.
  if (options.elementType === ElementType.TABLE) {
    const cells = isDetached ? elementOrText.getValues() : elementOrText;

    if (cells && cells.length > 0 && cells[0].length > 0) {
      // The table was created at newElementStartIndex
      const { body, headers, footers } = shadow.__unpackDocumentTab(shadow.resource);
      let containerContent;

      // Determine the correct content array based on the container type and segmentId
      if (self.getType() === ElementType.BODY_SECTION) {
        containerContent = body.content;
      } else if (self.getType() === ElementType.HEADER_SECTION) {
        containerContent = headers[segmentId]?.content;
      } else if (self.getType() === ElementType.FOOTER_SECTION) {
        containerContent = footers[segmentId]?.content;
      } else {
        // This logic is for top-level containers. TableCell would need a different approach.
        // For now, this covers the failing case.
        throw new Error(`Table population not supported in container of type: ${self.getType()}`);
      }

      if (!containerContent) {
        throw new Error(`Could not find content for segmentId: ${segmentId}`);
      }

      const populateRequests = reverseUpdateContent(containerContent, newElementStartIndex, cells, segmentId, tabId);
      if (populateRequests.length > 0) {
        Docs.Documents.batchUpdate({ requests: populateRequests }, shadow.getId());
        shadow.refresh();
      }
    }

    // When the API inserts a table, it automatically adds a paragraph after it.
    // This new paragraph can sometimes inherit the list style of the element
    // preceding the table. We need to explicitly remove this bullet formatting.
    const tableItem = findItem(shadow.elementMap, 'TABLE', newElementStartIndex, segmentId);
    if (tableItem) {
      const paragraphAfterTableIndex = tableItem.endIndex;
      const paraItem = findItem(shadow.elementMap, 'PARAGRAPH', paragraphAfterTableIndex, segmentId);

      // findItem for PARAGRAPH will also find LIST_ITEM.
      // We check if the found item has a bullet, which indicates it wrongly inherited list properties.
      if (paraItem && paraItem.paragraph && paraItem.paragraph.bullet) {
        Docs.Documents.batchUpdate({ requests: [deleteParagraphBullets(paraItem.startIndex, segmentId, tabId)] }, shadow.getId());
        shadow.refresh(); // Refresh again after fixing the paragraph
      }
    }
  }

  // 7. Find and return the newly created element instance.
  return findAndReturnNewElement(shadow, newElementStartIndex, childStartIndex, isAppend, options, segmentId);
};

/**
 * Creates a footnote and a reference to it.
 * @param {FakeContainerElement} parent The parent container.
 * @param {string} text The text for the footnote.
 * @returns {GoogleAppsScript.Document.Footnote} The new footnote element.
 */
export const createFootnote = (parent, text) => {
  if (parent.__isDetached) {
    throw new Error('Cannot append to a detached element.');
  }
  const shadow = parent.shadowDocument;
  const segmentId = parent.__segmentId;
  const tabId = parent.__tabId;

  // Find the insertion point at the end of the parent container.
  const parentItem = shadow.getElement(parent.__name);
  const children = parentItem.__twig.children;
  const lastChild = children.length > 0 ? shadow.getElement(children[children.length - 1].name) : parentItem;
  const insertIndex = lastChild.endIndex - 1;

  const requests = [{
    // Create a new paragraph for the footnote reference by inserting a newline at the end of the parent.
    insertText: {
      text: '\n',
      location: { index: insertIndex, segmentId, tabId },
    },
  }, {
    // Create the footnote and its reference at the start of the new paragraph.
    createFootnote: {
      location: {
        index: insertIndex + 1,
        segmentId,
        tabId,
      },
    },
  }, {
    // Ensure the new paragraph is not a list item by removing any inherited bullet.
    // This prevents the paragraph holding the footnote reference from being misidentified.
    deleteParagraphBullets: {
      range: {
        startIndex: insertIndex + 1,
        endIndex: insertIndex + 1, // A single point is sufficient
        segmentId,
        tabId,
      },
    },
  }];

  const response = Docs.Documents.batchUpdate({ requests }, shadow.getId());
  const footnoteId = response.replies[1].createFootnote.footnoteId;

  if (text) {
    const textRequest = {
      insertText: {
        text,
        location: {
          segmentId: footnoteId, // The footnote content is its own segment
          index: 1, // Insert at the beginning of the footnote content
        },
      },
    };
    Docs.Documents.batchUpdate({ requests: [textRequest] }, shadow.getId());
  }
  shadow.refresh();
  return shadow.getFootnoteById(footnoteId);
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

export const appendListItem = (self, listItemOrText) => {
  return elementInserter(self, listItemOrText, null, listItemOptions);
};

export const insertListItem = (self, childIndex, listItemOrText) => {
  return elementInserter(self, listItemOrText, childIndex, listItemOptions);
};

export const addPositionedImage = (self, image) => {
  // Per the docs, this anchors the image to the beginning of the paragraph.
  return elementInserter(self, image, 0, positionedImageOptions);
};

export const appendImage = (self, image) => {
  return elementInserter(self, image, null, imageOptions);
};

export const insertImage = (self, childIndex, image) => {
  return elementInserter(self, image, childIndex, imageOptions);
};
