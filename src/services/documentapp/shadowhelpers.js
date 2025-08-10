import { Utils } from "../../support/utils.js";
const { getEnumKeys } = Utils
import { ElementType } from '../enums/docsenums.js';
const { is } = Utils
import { getElementFactory } from './elementRegistry.js'
import { signatureArgs } from "../../support/helpers.js";

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

// these are all shared between classes that need to fiddle with elements
export const extractText = (se) => {
  if (!se || !se.paragraph || !se.paragraph.elements) return '';
  // The getText() method for a paragraph in Apps Script does not include the
  // trailing newline that marks the end of the paragraph in the API response.
  return se.paragraph.elements?.map(element => {
    return element.textRun ? element.textRun.content : '';
  }).join('').replace(/\n$/, '') || '';
};

/**
 * this is here because getText is supported by a number of different classes, but not all
 * @param {FakeElement} self 
 * @returns {string} the concacentaed text in all the sub elements
 */
export const getText = (self) => {
  // a detached element is one that would have been created by .copy() and is not yet part of the document
  if (self.__isDetached) {
    // This is a detached element, created by copy().
    // It holds its own data and is not connected to the live document.
    const item = self.__elementMapItem;
    if (item.__type === ElementType.PARAGRAPH.toString()) {
      return extractText(item);
    }
    return '';
  } else {
    // This is an attached element. Always get the latest structure to avoid stale state.
    const shadow = self.__structure.shadowDocument;
    const structure = shadow.structure;
    const item = structure.elementMap.get(self.__name);

    const children = (item?.__twig?.children || []).map(twig => {
      const childItem = structure.elementMap.get(twig.name);
      const factory = getElementFactory(childItem.__type);
      return factory(structure, twig.name);
    });

    return children.map(c => c.getText()).join('\n');
  }
}

/**
 * this is here because appendParagraph is supported by a number of different classes, but not all
 * @param {FakeContainerElement} self one that supports adding paragraphs - body, tablecell,header, footer
 * @returns {string} the concacentaed text in all the sub elements
 */
const _elementInserter = (self, elementOrText, childIndex, options) => {
  const {
    elementType,
    insertMethodSignature,
    canAcceptText,
    getMainRequest,
    getStyleRequests,
    findType,
    packCanBeNull = false
  } = options;

  // identify the type of arguments and how to treat them
  const isAppend = is.null(childIndex);
  const isText = is.string(elementOrText);
  const isObject = is.object(elementOrText);
  const isDetached = isObject && !!elementOrText.__isDetached;
  const typeMatches = isObject && elementOrText.getType() === elementType;

  const { matchThrow } = signatureArgs([childIndex, elementOrText], insertMethodSignature);
  if (isText && !canAcceptText) {
    matchThrow()
  }
  if (isObject && (elementOrText.getParent() || !isDetached)) {
    throw new Error('Element must be detached.');
  }
  if (!packCanBeNull && is.nullOrUndefined(elementOrText)) {
    matchThrow();
  }
  if (!isAppend && !is.integer(childIndex) || !(packCanBeNull || isText || typeMatches)) {
    matchThrow();

  }
  if (isAppend && !is.nullOrUndefined(childIndex)) {
    matchThrow()
  }


  // ------------

  // set ourselves up at the current state of the shadow document
  const shadow = self.__structure.shadowDocument;
  const structure = shadow.structure;
  const segmentId = shadow.__segmentId;
  const item = structure.elementMap.get(self.__name);
  const children = item.__twig.children;

  let insertIndex;
  let newElementStartIndex;
  let requests = [];

  // we share this code between insert and append
  if (isAppend) {
    const isParaAppend = self.getType() === ElementType.PARAGRAPH;
    if (isParaAppend) {
      // Appending to a paragraph inserts content within it.
      insertIndex = item.endIndex - 1; // Before the paragraph's trailing newline -- agree
      // what's this newElementstartIndex ?
      newElementStartIndex = item.startIndex; // The paragraph being modified is the container.

    } else {
      const endIndexBefore = structure.shadowDocument.__endBodyIndex;
      // All appends to the body (Paragraph, PageBreak, etc.) must insert content
      // just before the final newline of the body to be a valid index.
      insertIndex = endIndexBefore - 1;
      newElementStartIndex = endIndexBefore;
    }
    const targetChildTwig = children[children.length - 1];
    requests = children.length ? makeProtectionRequests(shadow, targetChildTwig) : [];

  } else { // it's an insert
    if (childIndex < 0 || childIndex >= children.length) {
      throw new Error(`Child index (${childIndex}) must be less than or equal to the number of child elements (${children.length}).`);
    }
    const targetChildTwig = children[childIndex];
    const targetChildItem = structure.elementMap.get(targetChildTwig.name);
    insertIndex = targetChildItem.startIndex;
    newElementStartIndex = insertIndex;
    requests = makeProtectionRequests(shadow, targetChildTwig);
  }

  // Use [].concat to ensure we have an array, as getMainRequest might return a single object or an array.
  const mainRequests = [].concat(getMainRequest(elementOrText, { index: insertIndex, segmentId }, isAppend, self, structure));
  requests.unshift(...mainRequests);

  if (isDetached && getStyleRequests) {
    requests.push(...getStyleRequests(elementOrText, newElementStartIndex, isAppend));
  }

  // commit
  Docs.Documents.batchUpdate({ requests }, shadow.getId());
  // this will fetch any shadow doc updates
  shadow.refresh();
  /*
  
  */

  const findContainerType = (is.function(options.findType) ? options.findType(isAppend) : findType) || elementType.toString();
  const childTypeToFind = is.function(options.findChildType) ? options.findChildType(isAppend) : options.findChildType;

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

// describes how to handle parargraph elements
const paragraphOptions = {
  elementType: ElementType.PARAGRAPH,
  insertMethodSignature: 'DocumentApp.Body.insertParagraph',
  canAcceptText: true,
  getMainRequest: (textOrParagraph, location, isAppend, self) => {
    const isDetachedPara = is.object(textOrParagraph) && textOrParagraph.__isDetached;
    let baseText;
    if (isDetachedPara) {
      const item = textOrParagraph.__elementMapItem;
      const fullText = (item.paragraph?.elements || []).map(el => el.textRun?.content || '').join('');
      baseText = fullText.replace(/\n$/, '');
    } else {
      baseText = is.string(textOrParagraph) ? textOrParagraph : textOrParagraph.getText();
    }

    const isBodyAppend = isAppend && self.getType() !== ElementType.PARAGRAPH;
    const textToInsert = isBodyAppend ? '\n' + baseText : baseText + '\n';
    return { insertText: { location, text: textToInsert } };
  },
  getStyleRequests: (paragraph, startIndex, length, isAppend) => {
    const requests = [];
    const detachedItem = paragraph.__elementMapItem;
    const paraElements = detachedItem.paragraph?.elements || [];
    const paraStyle = detachedItem.paragraph?.paragraphStyle;

    if (paraStyle && Object.keys(paraStyle).length > 0) {
      const fields = Object.keys(paraStyle).join(',');
      requests.push({
        updateParagraphStyle: { range: { startIndex, endIndex: startIndex + length }, paragraphStyle: paraStyle, fields: fields },
      });
    }

    let currentOffset = startIndex;
    paraElements.forEach(el => {
      if (el.textRun && el.textRun.content) {
        const content = el.textRun.content;
        const textStyle = el.textRun.textStyle;
        const styleableContent = content.replace(/\n$/, '');
        const styleableLength = styleableContent.length;

        if (textStyle && Object.keys(textStyle).length > 0 && styleableLength > 0) {
          const fields = Object.keys(textStyle).join(',');
          requests.push({ updateTextStyle: { range: { startIndex: currentOffset, endIndex: currentOffset + styleableLength }, textStyle: textStyle, fields: fields } });
        }
        currentOffset += content.length;
      }
    });
    return requests;
  },
};

const pageBreakOptions = {
  elementType: ElementType.PAGE_BREAK,
  insertMethodSignature: 'DocumentApp.Body.pageBreak',
  packCanBeNull: true,
  canAcceptText: false,
  getMainRequest: (_pageBreak, loc, _isAppend, self) => {

    // the only difference between a body append and para append is that we need to insert 
    // '\n before if its a body
    // in both cases, we need to remove the additional \n that inserting a page break causes
    const reqs = []
    const location = Docs.newLocation()
      .setSegmentId(loc.segmentId)
      .setIndex(loc.index)


    // th api inserts both a pb and a \n
    reqs.push({
      insertPageBreak: Docs.newInsertPageBreakRequest()
        .setLocation(location)
    })

    // if an actual append we have to do this stuff
    // if a body insert we don't need to bother
    // I THINK!
    if (_isAppend) {
      // this is where the additional \n inserted by the page request will end up
      // if its an append para
      const range = Docs.newRange()
        .setStartIndex(loc.index + 1)
        .setEndIndex(loc.index + 2)

      // only required if we are appending to the body
      // since we use the same location, it'll be inserted juse before the pagebreak we just inserted
      if (self.getType() === ElementType.BODY_SECTION) {
        reqs.push({
          insertText: Docs.newInsertTextRequest()
            .setLocation(location)
            .setText(`\n`)
        })
        // the unwanted \n will end up here if its a body append
        range
          .setStartIndex(loc.index + 2)
          .setEndIndex(loc.index + 3)
      }
      // this is about getting rid of the extra \n that insert page break creates
      reqs.push({
        deleteContentRange: Docs.newDeleteContentRangeRequest()
          .setRange(range)
      })
    }

    return reqs

  },
  getStyleRequests: null, // PageBreak styling on copy not supported yet.
  findType: ElementType.PARAGRAPH.toString(),
  findChildType: ElementType.PAGE_BREAK.toString()
};

export const appendParagraph = (self, textOrParagraph) => {
  return _elementInserter(self, textOrParagraph, null, paragraphOptions);
};

export const insertParagraph = (self, childIndex, paragraph) => {
  return _elementInserter(self, paragraph, childIndex, paragraphOptions);
};

export const appendPageBreak = (self, pageBreak) => {
  return _elementInserter(self, pageBreak, null, pageBreakOptions);
};

export const insertPageBreak = (self, childIndex, pageBreak) => {
  return _elementInserter(self, pageBreak, childIndex, pageBreakOptions);
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
const makeProtectionRequests = (shadow, twig) => {
  const ur = [];
  const elementMap = shadow.structure.elementMap;
  const stet = (innerTwig, endIndex = null) => {
    const elItem = elementMap.get(innerTwig.name);
    if (is.null(endIndex)) endIndex = elItem.endIndex;
    if (!elItem) {
      throw new Error(`stet: element with name ${innerTwig.name} not found in refreshed map`);
    }
    // problem here - when we insert a page break it's before the previous \n
    // therefore the previous endindex, which contains the \n will be retained
    // however, we need to remap up to the insertion point in that case.
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