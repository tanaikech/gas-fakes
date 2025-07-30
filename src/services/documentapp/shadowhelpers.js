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
  const isAppend = is.null(childIndex); // This will now only be true when called from appendParagraph

  // 1. Validation
  if (isAppend) {
    const isText = is.string(textOrParagraph);
    if (!isText && !(is.object(textOrParagraph) && textOrParagraph.getType() === ElementType.PARAGRAPH)) {
      throw new Error('invalid arguments to appendParagraph');
    }
    if (!isText && textOrParagraph.getParent()) {
      throw new Error('Element must be detached.');
    }
  } else {
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
  }

  const text = is.string(textOrParagraph) ? textOrParagraph : textOrParagraph.getText();

  const shadow = self.__structure.shadowDocument;
  const structure = shadow.structure; // This will trigger a refresh if needed
  const item = structure.elementMap.get(self.__name); // Use the fresh item for the container
  const children = item.__twig.children;

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

  let insertIndex;
  let newParaStartIndex;
  let requests = [];
  let textToInsert;

  if (isAppend) {
    // APPEND LOGIC: Insert '\n' + text at the end. Protect the last element with shift=0.
    textToInsert = '\n' + text;
    const endIndexBefore = structure.shadowDocument.__endBodyIndex;
    insertIndex = endIndexBefore - 1;
    newParaStartIndex = endIndexBefore;
    if (children.length > 0) {
      requests = makeProtectionRequests(children[children.length - 1], 0);
    }
  } else {
    // INSERT LOGIC: Insert text + '\n' at the target. Protect the target element with a calculated shift.
    if (childIndex < 0 || childIndex >= children.length) { // Should be strictly less than, as append is handled elsewhere
      throw new Error(`Child index (${childIndex}) must be less than or equal to the number of child elements (${children.length}).`);
    }
    textToInsert = text + '\n';
    const targetChildTwig = children[childIndex];
    const targetChildItem = structure.elementMap.get(targetChildTwig.name);
    insertIndex = targetChildItem.startIndex;
    newParaStartIndex = insertIndex;
    const shift = textToInsert.length;
    requests = makeProtectionRequests(targetChildTwig, shift);
  }
  
  // put the insert text at the beginning before any remakes of the anmed ranges
  requests.unshift({
    insertText: {
      location: { index: insertIndex },
      text: textToInsert,
    },
  });

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