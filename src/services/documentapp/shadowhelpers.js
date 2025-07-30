import { Utils } from "../../support/utils.js";
const { getEnumKeys } = Utils
import { ElementType } from '../enums/docsenums.js';
const { is } = Utils
import { getElementFactory } from './elementRegistry.js'


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
  // Always get the latest structure, as the 'self' object could be stale.
  const shadow = self.__structure.shadowDocument;
  const structure = shadow.structure;
  const item = structure.elementMap.get(self.__name);

  let text = []

  const extract = (elItem, text) => {
    if (elItem && elItem.__type === ElementType.PARAGRAPH.toString()) {
      text.push(extractText(elItem))
    } else {
      const leaves = (elItem?.__twig?.children || []).map(leaf => structure.elementMap.get(leaf.name))
      leaves.forEach(leaf => {
        extract(leaf, text)
      });
    }
  }

  extract(item, text)
  return text.join('\n');

}

/**
 * this is here because appendParagraph is supported by a number of different classes, but not all
 * @param {FakeContainerElement} self one that supports adding paragraphs - body, tablecell,header, footer
 * @returns {string} the concacentaed text in all the sub elements
 */
export const appendParagraph = (self, textOrParagraph) => {
  const supportedContainers = [
    ElementType.BODY_SECTION,
    ElementType.TABLE_CELL,
    ElementType.HEADER_SECTION,
    ElementType.FOOTER_SECTION
  ]
  // Can be a string or a Paragraph object``
  const isText = is.string(textOrParagraph)
  if (!isText && !(is.object(textOrParagraph) && supportedContainers.includes(self.getType()))) {
    throw new Error('invalidarguments to appendParagraph');
  }

  // A paragraph must be detached before it can be appended.
  if (!isText && textOrParagraph.getParent()) {
    throw new Error('Exception: Element must be detached.');
  }

  const text = isText ? textOrParagraph : textOrParagraph.getText()

  // Get the LATEST shadow document state, as the 'self' object could be stale
  // if multiple appends are chained on the same container object.
  const shadow = self.__structure.shadowDocument;
  const structure = shadow.structure; // This will trigger a refresh if needed
  const item = structure.elementMap.get(self.__name); // Use the fresh item for the container
  const endIndexBefore = structure.shadowDocument.__endBodyIndex;
  const insertIndex = endIndexBefore - 1;

  let requests;
  let newParaStartIndex;

  // makeUpdateRange creates requests to delete and re-create a named range with the same bounds,
  // preventing it from expanding during an insertion.
  const makeUpdateRange = (element) => {
    const nr = shadow.nrMap.get(element.__name)
    if (!nr) {
      // it might be a new element that doesn't have a registered NR yet, which is fine.
      return null
    }
    const deleteNamedRange = Docs.newDeleteNamedRangeRequest()
      .setNamedRangeId(nr.namedRangeId)

    const createNamedRange = Docs.newCreateNamedRangeRequest()
      .setName(element.__name)
      .setRange(Docs.newRange()
        .setStartIndex(element.startIndex)
        .setEndIndex(element.endIndex)
      )
    return {
      deleteNamedRange,
      createNamedRange
    }
  }

  // We only need to protect the last element in the container (and its children) from being expanded by the insertion.
  // which is the last element in the container.
  const ur = []
  const children = item.__twig.children;
  if (children.length > 0) {
    const lastChildTwig = children[children.length - 1];
    const stet = (twig) => {
      // Use the fresh structure map, not the potentially stale one from 'self'
      const elItem = structure.elementMap.get(twig.name);
      if (!elItem) {
        throw new Error(`stet: element with name ${twig.name} not found in refreshed map`);
      }
      const update = makeUpdateRange(elItem);
      if (update) {
        ur.push({ deleteNamedRange: update.deleteNamedRange });
        ur.push({ createNamedRange: update.createNamedRange });
      }
      (elItem.__twig?.children || []).forEach(childTwig => {
        stet(childTwig);
      });
    };
    stet(lastChildTwig);
  }
  const insertText = Docs.newInsertTextRequest()
    .setLocation(Docs.newLocation().setIndex(insertIndex))
    .setText('\n'+text)
  requests = [{insertText}].concat (ur)

  // The new paragraph starts at the old end index.
  newParaStartIndex = endIndexBefore;

  Docs.Documents.batchUpdate({ requests }, shadow.getId());

  shadow.refresh()

  // we need to get the name of the new paragraph entry
  const et = ElementType.PARAGRAPH.toString()

  const newItem = findItem(shadow.__elementMap, et, newParaStartIndex);
  const factory = getElementFactory(et);
  return factory(self.__structure, newItem.__name);
}

export const findItem = (elementMap, type, startIndex) => {
  const item = Array.from(elementMap.values()).find(f => f.__type === type && f.startIndex === startIndex)
  if (!item) {
    throw new Error(`Couldnt find element ${type} at ${startIndex}`)
  }
  return item
}