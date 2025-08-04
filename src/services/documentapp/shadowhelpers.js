import { Utils } from "../../support/utils.js";
const { getEnumKeys } = Utils
import { ElementType } from '../enums/docsenums.js';
const { is } = Utils
import { getElementFactory } from './elementRegistry.js'
import { signatureArgs } from "../../support/helpers.js";

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

const shadowPrefix = "GAS_FAKE_"

export const makeNrPrefix = (type = null) => {
  if (is.null(type)) {
    return shadowPrefix
  }
  if (!is.nonEmptyString(type)) {
    throw `expected a non empty string - got ${type}`
  }
  return shadowPrefix + type + '_'
}

export const getCurrentNr = (data) => {
  // filter out unrelated namedranges, and add the rest for lookup later
  return Reflect.ownKeys(data.namedRanges || {})
    .filter(key => key.startsWith(shadowPrefix))
    .reduce((p, c) => {
      // strangly there's another level of .namedRanges property
      if (data.namedRanges[c].namedRanges.length !== 1) {
        // TODO I dont know if this true yet we'll need to investigate
        throw new Error(`expected only 1 nr match but got ${data.namedRanges[c].namedRanges.length}`)
      }
      data.namedRanges[c].namedRanges.forEach(r => {
        p.push(r)
      })
      return p
    }, [])
}

const addNrRequest = (type, element, addRequests) => {
  const name = makeNrPrefix(type) + Utilities.getUuid()
  addRequests.push({
    createNamedRange: {
      name,
      range: {
        endIndex: element.endIndex,
        startIndex: element.startIndex
      }
    }
  })
  return {
    name
  }
}

// either finds a matching named range, or adds it to the creation queue
export const findOrCreateNamedRangeName = (element, type, currentNr, addRequests) => {
  const { endIndex, startIndex } = element;
  const prefix = makeNrPrefix(type);

  const bestMatchIndex = currentNr.findIndex(nr =>
    nr.name.startsWith(prefix) &&
    (nr.ranges || []).some(range => range.endIndex === endIndex && range.startIndex === startIndex)
  );

  if (bestMatchIndex !== -1) {
    // We found a match (either exact or expanded).
    // Consume it from the list so it can't be matched to another element.
    const [foundRange] = currentNr.splice(bestMatchIndex, 1);
    return foundRange;
  }

  // If no match was found, it's a genuinely new element.
  return addNrRequest(type, element, addRequests);
};

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
    getShift,
    getMainRequest,
    getStyleRequests,
    findType,
  } = options;

  const isAppend = is.null(childIndex);

  // --- VALIDATION ---
  if (!isAppend) {
    if (!elementOrText || elementOrText.getType() !== elementType) {
      throw new Error(`The parameters (number,${(elementOrText || 'null').toString()}) don't match the method signature for ${insertMethodSignature}.`);
    }
    if (elementOrText.getParent()) {
      throw new Error('Element must be detached.');
    }
    const { nargs, matchThrow } = signatureArgs([self, childIndex, elementOrText], insertMethodSignature);
    if (nargs !== 3 || !is.integer(childIndex) || !is.object(elementOrText)) {
      matchThrow();
    }
  } else {
    const isText = is.string(elementOrText);
    if (isText && !canAcceptText) {
      throw new Error(`Invalid argument type for append method.`);
    }
    // for append, element can be null (e.g. appendPageBreak())
    if (!isText && elementOrText && !(is.object(elementOrText) && elementOrText.getType() === elementType)) {
      throw new Error(`invalid arguments to append method`);
    }
    if (!isText && elementOrText && elementOrText.getParent()) {
      throw new Error('Element must be detached.');
    }
  }

  const isDetached = is.object(elementOrText) && elementOrText.__isDetached;
  const shift = getShift(elementOrText, isDetached);

  const makeProtectionRequests = (twig, shift = 0) => {
    const ur = [];
    const stet = (innerTwig) => {
      const elItem = structure.elementMap.get(innerTwig.name);
      if (!elItem) {
        throw new Error(`stet: element with name ${innerTwig.name} not found in refreshed map`);
      }
      const nr = shadow.nrMap.get(elItem.__name);
      if (nr) {
        ur.push({ deleteNamedRange: { namedRangeId: nr.namedRangeId } });
        ur.push({
          createNamedRange: {
            name: elItem.__name,
            range: {
              startIndex: elItem.startIndex + shift,
              endIndex: elItem.endIndex + shift,
            },
          },
        });
      }
      (elItem.__twig?.children || []).forEach(childTwig => stet(childTwig));
    };
    stet(twig);
    return ur;
  };

  const shadow = self.__structure.shadowDocument;
  const structure = shadow.structure;
  const segmentId = shadow.__segmentId;
  const item = structure.elementMap.get(self.__name);
  const children = item.__twig.children;

  let insertIndex;
  let newElementStartIndex;
  let requests = [];

  if (isAppend) {
    const endIndexBefore = structure.shadowDocument.__endBodyIndex;
    insertIndex = endIndexBefore - 1;
    const useStartsAtInsertPoint = is.function(options.startsAtInsertPoint) ? options.startsAtInsertPoint(isAppend) : !!options.startsAtInsertPoint;
    // For appendParagraph, the new element starts at the end of the previous content (endIndexBefore).
    // For appendPageBreak and all 'insert' operations, the new element starts at the insertion point (insertIndex).
    newElementStartIndex = isAppend && !useStartsAtInsertPoint ? endIndexBefore : insertIndex;
    if (children.length > 0) {
      requests = makeProtectionRequests(children[children.length - 1], 0);
    }
  } else {
    // The case of childIndex === children.length is now handled by the append... methods,
    // so this check can be strict.
    if (childIndex < 0 || childIndex >= children.length) {
      throw new Error(`Child index (${childIndex}) must be less than or equal to the number of child elements (${children.length}).`);
    }
    const targetChildTwig = children[childIndex];
    const targetChildItem = structure.elementMap.get(targetChildTwig.name);
    insertIndex = targetChildItem.startIndex;
    newElementStartIndex = insertIndex;
    requests = makeProtectionRequests(targetChildTwig, shift);
  }

  // Use [].concat to ensure we have an array, as getMainRequest might return a single object or an array.
  const mainRequests = [].concat(getMainRequest(elementOrText, { index: insertIndex, segmentId }, isAppend));
  requests.unshift(...mainRequests);

  if (isDetached && getStyleRequests) {
    requests.push(...getStyleRequests(elementOrText, newElementStartIndex, shift, isAppend));
  }

  Docs.Documents.batchUpdate({ requests }, shadow.getId());
  shadow.refresh();

  const findContainerType = (is.function(options.findType) ? options.findType(isAppend) : findType) || elementType.toString();
  const childTypeToFind = is.function(options.findChildType) ? options.findChildType(isAppend) : options.findChildType;

  const containerItem = findItem(shadow.__elementMap, findContainerType, newElementStartIndex);

  if (childTypeToFind) {
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
  const factory = getElementFactory(findContainerType);
  return factory(shadow.structure, containerItem.__name);
};

const paragraphOptions = {
  elementType: ElementType.PARAGRAPH,
  insertMethodSignature: 'DocumentApp.Body.insertParagraph',
  canAcceptText: true,
  getShift: (textOrParagraph, isDetached) => {
    if (isDetached) {
      const item = textOrParagraph.__elementMapItem;
      const fullText = (item.paragraph?.elements || []).map(el => el.textRun?.content || '').join('');
      return fullText.length;
    }
    const baseText = is.string(textOrParagraph) ? textOrParagraph : textOrParagraph.getText();
    return baseText.length + 1;
  },
  getMainRequest: (textOrParagraph, location, isAppend) => {
    const isDetachedPara = is.object(textOrParagraph) && textOrParagraph.__isDetached;
    let baseText;
    if (isDetachedPara) {
      const item = textOrParagraph.__elementMapItem;
      const fullText = (item.paragraph?.elements || []).map(el => el.textRun?.content || '').join('');
      baseText = fullText.replace(/\n$/, '');
    } else {
      baseText = is.string(textOrParagraph) ? textOrParagraph : textOrParagraph.getText();
    }
    const textToInsert = isAppend ? '\n' + baseText : baseText + '\n';
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
    if (isAppend) currentOffset++;

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
  insertMethodSignature: 'DocumentApp.Body.insertPageBreak',
  canAcceptText: false,
  getShift: (pb, isDetached, isAppend) => 1, // All inserts are now 1 request.
  getMainRequest: (pageBreak, location, isAppend) => {
    // The live API handles both append and insert with a single request.
    // A single insertPageBreak request at a given index will create a new paragraph
    // to house the page break, splitting an existing paragraph if necessary.
    // The previous two-step process for append was creating an extra, unwanted paragraph.
    return { insertPageBreak: { location } };
  },
  getStyleRequests: null, // PageBreak styling on copy not supported yet.
  findType: ElementType.PARAGRAPH.toString(),
  findChildType: ElementType.PAGE_BREAK.toString(),
  startsAtInsertPoint: true, // A page break always creates a new paragraph at the insertion point.
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
    throw new Error(`Couldnt find element ${type} at ${startIndex}`)
  }
  return item
}