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
export const makeNrPrefix = (type) => {
  if (is.null(type)) return shadowPrefix
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
  return name
}

// either finds a matching named range, or adds it to the creation queue
export const findOrCreateNamedRangeName = (element, type, currentNr, addRequests) => {
  const { endIndex, startIndex } = element;

  const matchedNr = currentNr.filter(nr =>
    (nr.ranges || []).some(
      range => range.endIndex === endIndex && range.startIndex === startIndex) &&
    nr.name.startsWith(makeNrPrefix(type))
  );

  if (matchedNr.length > 1) {
    console.log(element, matchedNr);
    throw `ambiguous match for named range ${type}`;
  }

  return matchedNr.length ? matchedNr[0].name : addNrRequest(type, element, addRequests);
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
  const item = self.__elementMapItem

  let text = []

  const extract = (elItem, text) => {
    if (elItem && elItem.__type === ElementType.PARAGRAPH.toString()) {
      text.push(extractText(elItem))
    } else {
      const leaves = (elItem?.__twig?.children || []).map(leaf => self.__getElementMapItem(leaf.name))
      leaves.forEach(leaf => {
        extract(leaf, text)
      })
    }
  }
  extract(item, text)
  return text.join('\n')
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
  if (!isText & !(is.object(textOrParagraph) && supportedContainers.includes(self.getType()))) {
    throw new Error('invaliarguments to appendParagraph');
  }
  // TODO once copy is done - copy needs to be able to copy all children elements too
  // The copy() method creates a detached, deep copy of the element, including all its children and their properties.
  // if we're adding a paragraph it must not already be attached - so in other words, should be a copy of an existing
  // a new paragraph made with copy doesnt have a parent so is acceptable
  //if (!isText && textOrParagraph.getParent()) {
  //  throw new Error('Exception: Element must be detached.');
  //}

  // TODO
  // there isn'tactually a way to make a request that includes all a ready made paragraph's children
  // so for now we'll just insert its text, but we need to revisit this to handle any para children
  const text = isText ? textOrParagraph : textOrParagraph.getText()

  const shadow = self.__structure.shadowDocument;
  const endIndexBefore = shadow.__endBodyIndex;
  let requests;
  let newParaStartIndex;
 
  if (endIndexBefore === 2) {
    // This is an empty document. The only content is a newline at [1, 2).
    // To append content without moving the initial paragraph's NamedRange,
    // we must modify the existing paragraph in-place by inserting text at index 1.
    // CRUCIALLY, we do NOT include a newline in the text, as that would trigger
    // the creation of a *new* paragraph, which would prepend it.
    requests = [{
      insertText: { location: { index: 1 }, text: text }
    }];
    // The paragraph we are "creating" is the one at the start of the document.
    newParaStartIndex = 1;
  } else {
    // This is a non-empty document. To append a new paragraph, we insert a
    // newline character `\n` followed by the text. This must be done at the
    // end of the body content, which is at `endIndex - 1` (just before the
    // final newline of the last paragraph).
    const insertIndex = endIndexBefore - 1;
    requests = [{
      insertText: {
        location: { index: insertIndex, segmentId: self.__segmentId || null },
        text: '\n' + text
      }
    }];
    // The API creates the new paragraph element where the `\n` is inserted.
    newParaStartIndex = insertIndex;
  }
  Docs.Documents.batchUpdate({ requests }, shadow.getId());

  shadow.refresh()
  // we need to get the name of the new paragraph entry
  const et = ElementType.PARAGRAPH.toString()
  // The new paragraph's content starts at its startIndex, which we calculated.
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