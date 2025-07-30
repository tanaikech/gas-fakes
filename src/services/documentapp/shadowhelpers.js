import { Utils } from "../../support/utils.js";
const { getEnumKeys } = Utils
import { ElementType } from '../enums/docsenums.js';
const { is } = Utils
import { getElementFactory } from './elementRegistry.js'
import { signatureArgs } from "../../support/helpers.js";

export const getElementProp = (se) => {
  // these are the known types
  const keys = getEnumKeys(ElementType)
  const ownKeys = Reflect.ownKeys(se)

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
    const text = [];

    const extractDetached = (elItem) => {
      if (!elItem) return;
      // The __type was added during the copy() operation.
      if (elItem.__type === ElementType.PARAGRAPH.toString()) {
        text.push(extractText(elItem));
      } else {
        // The __prop was also added during copy().
        const prop = elItem.__prop;
        const children = (prop && elItem[prop]) ? (elItem[prop].content || elItem[prop].elements) : [];
        children.forEach(extractDetached);
      }
    };

    extractDetached(item);
    return text.join('\n');
  } else {
    // This is an attached element. Always get the latest structure to avoid stale state.
    const shadow = self.__structure.shadowDocument;
    const structure = shadow.structure;
    const item = structure.elementMap.get(self.__name);
    const text = [];

    const extractAttached = (elItem) => {
      if (elItem && elItem.__type === ElementType.PARAGRAPH.toString()) {
        text.push(extractText(elItem));
      } else {
        const leaves = (elItem?.__twig?.children || []).map(leaf => structure.elementMap.get(leaf.name));
        leaves.forEach(extractAttached);
      }
    }
    extractAttached(item);
    return text.join('\n');
  }
}

/**
 * this is here because appendParagraph is supported by a number of different classes, but not all
 * @param {FakeContainerElement} self one that supports adding paragraphs - body, tablecell,header, footer
 * @returns {string} the concacentaed text in all the sub elements
 */
const _paragraphInserter = (self, textOrParagraph, childIndex) => {
  const isAppend = is.null(childIndex);

  if (!isAppend) {
    if (textOrParagraph.getType() !== ElementType.PARAGRAPH) {
      // Match the live Apps Script error for invalid parameter type.
      throw new Error(`The parameters (number,${textOrParagraph.toString()}) don't match the method signature for DocumentApp.Body.insertParagraph.`);
    }
    if (textOrParagraph.getParent()) {
      // Match the live Apps Script error for attached elements.
      throw new Error('Element must be detached.');
    }
    const { nargs, matchThrow } = signatureArgs([self, childIndex, textOrParagraph], 'Body.insertParagraph');
    if (nargs !== 3 || !is.integer(childIndex) || !is.object(textOrParagraph)) {
      matchThrow();
    }
  } else {
    const isText = is.string(textOrParagraph);
    if (!isText && !(is.object(textOrParagraph) && textOrParagraph.getType() === ElementType.PARAGRAPH)) {
      throw new Error('invalid arguments to appendParagraph');
    }
    if (!isText && textOrParagraph.getParent()) {
      throw new Error('Element must be detached.');
    }
  }

  const isDetachedPara = is.object(textOrParagraph) && textOrParagraph.__isDetached;

  // Determine the text to be inserted first. This is needed for calculating the shift for protection.
  let baseText;
  if (isDetachedPara) {
    const item = textOrParagraph.__elementMapItem;
    const fullText = (item.paragraph?.elements || []).map(el => el.textRun?.content || '').join('');
    baseText = fullText.replace(/\n$/, ''); // Remove trailing newline, we'll add it back.
  } else {
    baseText = is.string(textOrParagraph) ? textOrParagraph : textOrParagraph.getText();
  }

  // a protection request is required to remake the named range with the same endindex
  // this is because inserting/appending will extend existing named ranges, so we wont be able to use
  // them to identify existing elements - so an inserttext actually becomes
  // inserttext, deletenamedrange, createnamedrange (with same name and indices as the pre insert nr)
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
  const structure = shadow.structure; // This will trigger a refresh if needed
  const item = structure.elementMap.get(self.__name); // Use the fresh item for the container
  const children = item.__twig.children;

  let insertIndex;
  let newParaStartIndex;
  let requests = [];
  let textToInsert;

  if (isAppend) {
    // APPEND LOGIC
    textToInsert = '\n' + baseText; // Prepend newline for append
    const endIndexBefore = structure.shadowDocument.__endBodyIndex;
    insertIndex = endIndexBefore - 1;
    newParaStartIndex = endIndexBefore;
    if (children.length > 0) {
      requests = makeProtectionRequests(children[children.length - 1], 0); // No shift for append protection
    }
  } else {
    // INSERT LOGIC
    textToInsert = baseText + '\n'; // Append newline for insert
    if (childIndex < 0 || childIndex >= children.length) { // Should be strictly less than, as append is handled elsewhere
      throw new Error(`Child index (${childIndex}) must be less than or equal to the number of child elements (${children.length}).`);
    }
    const targetChildTwig = children[childIndex];
    const targetChildItem = structure.elementMap.get(targetChildTwig.name);
    insertIndex = targetChildItem.startIndex;
    newParaStartIndex = insertIndex;
    const shift = textToInsert.length;
    requests = makeProtectionRequests(targetChildTwig, shift);
  }

  // Add the main text insertion request.
  requests.unshift({
    insertText: {
      location: { index: insertIndex },
      text: textToInsert,
    },
  });

  // If it was a detached paragraph, add styling requests.
  if (isDetachedPara) {
    const detachedItem = textOrParagraph.__elementMapItem;
    const paraElements = detachedItem.paragraph?.elements || [];
    const paraStyle = detachedItem.paragraph?.paragraphStyle;

    const paraStartIndex = isAppend ? newParaStartIndex : insertIndex;
    const paraEndIndex = paraStartIndex + textToInsert.length;

    // Add paragraph style request
    if (paraStyle && Object.keys(paraStyle).length > 0) {
      const fields = Object.keys(paraStyle).join(',');
      requests.push({
        updateParagraphStyle: { range: { startIndex: paraStartIndex, endIndex: paraEndIndex }, paragraphStyle: paraStyle, fields: fields },
      });
    }

    // Add text style requests
    let currentOffset = paraStartIndex;
    if (isAppend) currentOffset++; // Skip leading '\n'

    paraElements.forEach(el => {
      if (el.textRun && el.textRun.content) {
        const content = el.textRun.content;
        const textStyle = el.textRun.textStyle;

        // The API does not allow styling the structural newline at the end of a paragraph.
        // We must calculate the styling range based only on the visible text content.
        const styleableContent = content.replace(/\n$/, '');
        const styleableLength = styleableContent.length;

        if (textStyle && Object.keys(textStyle).length > 0 && styleableLength > 0) {
          const fields = Object.keys(textStyle).join(',');
          requests.push({ updateTextStyle: { range: { startIndex: currentOffset, endIndex: currentOffset + styleableLength }, textStyle: textStyle, fields: fields } });
        }
        // Always advance the offset by the full length of the content from the API to keep positions correct.
        currentOffset += content.length;
      }
    });
  }

  Docs.Documents.batchUpdate({ requests }, shadow.getId());

  shadow.refresh();

  const et = ElementType.PARAGRAPH.toString();
  const newItem = findItem(shadow.__elementMap, et, newParaStartIndex);
  const factory = getElementFactory(et);
  return factory(shadow.structure, newItem.__name);
};

export const appendParagraph = (self, textOrParagraph) => {
  return _paragraphInserter(self, textOrParagraph, null);
};

export const insertParagraph = (self, childIndex, paragraph) => {
  return _paragraphInserter(self, paragraph, childIndex);
};

export const findItem = (elementMap, type, startIndex) => {
  const item = Array.from(elementMap.values()).find(f => f.__type === type && f.startIndex === startIndex)
  if (!item) {
    throw new Error(`Couldnt find element ${type} at ${startIndex}`)
  }
  return item
}