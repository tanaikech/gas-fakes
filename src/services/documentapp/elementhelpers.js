/**
 * @file Provides helper functions for working with fake document elements.
 */


import { Utils } from "../../support/utils.js";
const { is } = Utils


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
  // A ListItem is a Paragraph with a bullet. Check for this before generic Paragraph.
  if (se.paragraph && se.paragraph.bullet) return { prop: 'paragraph', type: 'LIST_ITEM' };
  if (se.table) return { prop: 'table', type: 'TABLE' };
  if (se.paragraph) return { prop: 'paragraph', type: 'PARAGRAPH' };

  // These elements are "naked" - their children are at the top level.
  // The prop is null because we don't need to look deeper into the object.
  if (se.tableCells) return { prop: null, type: 'TABLE_ROW' };
  if (se.textRun) return { prop: null, type: 'TEXT' };
  if (se.pageBreak) return { prop: null, type: 'PAGE_BREAK' };
  if (se.horizontalRule) return { prop: null, type: 'HORIZONTAL_RULE' };
  if (se.footnoteReference) return { prop: null, type: 'FOOTNOTE_REFERENCE' };
  if (se.inlineObjectElement) return { prop: null, type: 'INLINE_IMAGE' };
  if (se.positionedObjectElement) return { prop: null, type: 'POSITIONED_IMAGE' };

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
    const item = element.__elementMapItem;
    let text = '';

    if (item.paragraph) { // It's a Paragraph
      text = item.paragraph.elements?.map(e => e.textRun?.content || '').join('') || '';
    } else if (item.content) { // It's a TableCell
      text = item.content.map(structuralElement =>
        // A cell's content is an array of structural elements (usually paragraphs)
        structuralElement.paragraph?.elements?.map(e => e.textRun?.content || '').join('') || ''
      ).join('\n'); // Apps Script joins multiple paragraphs in a cell with a newline
    }
    return text.replace(/\n$/, '');
  }

  const text = getTextRecursive(element.__twig, element.__structure);
  // Paragraphs in the Docs API have a trailing newline. The Apps Script getText() method removes it.
  return text.replace(/\n$/, '');
};

/**
 * Gets the attributes of an element like a Paragraph or ListItem.
 * @param {import('./fakeelement.js').FakeElement} element The element to get attributes from.
 * @returns {object} The attributes.
 */
export const getAttributes = (element) => {
  // cannot get attributes from a detached element as it has no context
  if (element.__isDetached) return {};

  const item = element.__elementMapItem;
  const paraStyle = item.paragraph?.paragraphStyle || {};

  // --- Style Resolution ---
  // 1. Start with the named style as the base.
  const namedStyleType = paraStyle.namedStyleType || 'NORMAL_TEXT';
  const namedStyles = element.shadowDocument.resource.namedStyles?.styles || [];
  const namedStyle = namedStyles.find(s => s.namedStyleType === namedStyleType);
  const baseTextStyle = namedStyle?.textStyle || {};
  const baseParaStyle = namedStyle?.paragraphStyle || {};

  // 2. Merge the paragraph-level style overrides.
  const finalParaStyle = { ...baseParaStyle, ...paraStyle };

  // 3. Merge the text-run-level style overrides.
  const paraTextStyle = item.paragraph?.textStyle || {};
  const firstTextRun = item.paragraph?.elements?.find(e => e.textRun);
  const textRunTextStyle = firstTextRun?.textRun?.textStyle || {};
  const finalTextStyle = { ...baseTextStyle, ...paraTextStyle, ...textRunTextStyle };

  const attributes = {};
  const Attribute = DocumentApp.Attribute;

  const getColorString = (colorObject) => {
    if (!colorObject || !colorObject.rgbColor) return null;
    const { red = 0, green = 0, blue = 0 } = colorObject.rgbColor;
    const toHex = (c) => Math.round((c || 0) * 255).toString(16).padStart(2, '0');
    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
  };

  // --- Paragraph Attributes from finalParaStyle ---
  if (element.getHeading) {
    attributes[Attribute.HEADING] = element.getHeading();
  }

  if (finalParaStyle.alignment) {
    const alignmentMap = {
      'START': DocumentApp.HorizontalAlignment.LEFT,
      'CENTER': DocumentApp.HorizontalAlignment.CENTER,
      'END': DocumentApp.HorizontalAlignment.RIGHT,
      'JUSTIFY': DocumentApp.HorizontalAlignment.JUSTIFIED,
    };
    attributes[Attribute.HORIZONTAL_ALIGNMENT] = alignmentMap[finalParaStyle.alignment];
  }

  if (finalParaStyle.direction) {
    attributes[Attribute.LEFT_TO_RIGHT] = finalParaStyle.direction === 'LEFT_TO_RIGHT';
  }

  if (finalParaStyle.lineSpacing) {
    attributes[Attribute.LINE_SPACING] = finalParaStyle.lineSpacing / 100;
  }

  if (!is.undefined(finalParaStyle.indentStart?.magnitude)) attributes[Attribute.INDENT_START] = finalParaStyle.indentStart.magnitude;
  if (!is.undefined(finalParaStyle.indentEnd?.magnitude)) attributes[Attribute.INDENT_END] = finalParaStyle.indentEnd.magnitude;
  if (!is.undefined(finalParaStyle.indentFirstLine?.magnitude)) attributes[Attribute.INDENT_FIRST_LINE] = finalParaStyle.indentFirstLine.magnitude;
  if (!is.undefined(finalParaStyle.spaceAbove?.magnitude)) attributes[Attribute.SPACING_BEFORE] = finalParaStyle.spaceAbove.magnitude;
  if (!is.undefined(finalParaStyle.spaceBelow?.magnitude)) attributes[Attribute.SPACING_AFTER] = finalParaStyle.spaceBelow.magnitude;

  // --- Text Attributes from finalTextStyle ---
  if (finalTextStyle.backgroundColor) attributes[Attribute.BACKGROUND_COLOR] = getColorString(finalTextStyle.backgroundColor.color);
  if (!is.undefined(finalTextStyle.bold)) attributes[Attribute.BOLD] = finalTextStyle.bold;
  if (finalTextStyle.weightedFontFamily?.fontFamily) attributes[Attribute.FONT_FAMILY] = finalTextStyle.weightedFontFamily.fontFamily;
  if (finalTextStyle.fontSize?.magnitude) attributes[Attribute.FONT_SIZE] = finalTextStyle.fontSize.magnitude;
  if (finalTextStyle.foregroundColor) attributes[Attribute.FOREGROUND_COLOR] = getColorString(finalTextStyle.foregroundColor.color);
  if (!is.undefined(finalTextStyle.italic)) attributes[Attribute.ITALIC] = finalTextStyle.italic;
  if (!is.undefined(finalTextStyle.strikethrough)) attributes[Attribute.STRIKETHROUGH] = finalTextStyle.strikethrough;
  if (!is.undefined(finalTextStyle.underline)) attributes[Attribute.UNDERLINE] = finalTextStyle.underline;
  if (finalTextStyle.link?.url) attributes[Attribute.LINK_URL] = finalTextStyle.link.url;

  // --- List Item Attributes ---
  if (item.paragraph?.bullet) {
    if (element.getListId) attributes[Attribute.LIST_ID] = element.getListId();
    if (element.getNestingLevel) attributes[Attribute.NESTING_LEVEL] = element.getNestingLevel();
    if (element.getGlyphType) attributes[Attribute.GLYPH_TYPE] = element.getGlyphType();
  }

  // Ensure boolean attributes are null if not explicitly set, to match live behavior.
  const booleanTextAttributes = [Attribute.BOLD, Attribute.ITALIC, Attribute.STRIKETHROUGH, Attribute.UNDERLINE];
  booleanTextAttributes.forEach(attr => {
    if (attributes[attr] === undefined) {
      attributes[attr] = null;
    }
  });

  return attributes;
};

export const findItem = (elementMap, type, startIndex, segmentId) => {
  const item = Array.from(elementMap.values()).find(f => {
    // segmentId from API is empty string for body, but we might pass null. Normalize.
    const itemSegmentId = f.__segmentId || '';
    const searchSegmentId = segmentId || '';
    if (itemSegmentId !== searchSegmentId) {
      return false;
    }

    // For container elements that don't have a startIndex (like Header, Footer, Footnote),
    // we can find them by type and segmentId alone.
    if (is.undefined(startIndex)) {
      return f.__type === type;
    }

    // A ListItem is a specialized Paragraph. A search for a PARAGRAPH should also find a LIST_ITEM
    // at the given location.
    if (type === 'PARAGRAPH') {
      return (f.__type === 'PARAGRAPH' || f.__type === 'LIST_ITEM') && f.startIndex === startIndex;
    }
    return f.__type === type && f.startIndex === startIndex;
  });
  if (!item) {
    console.log(elementMap.values())
    throw new Error(`Couldnt find element ${type} at ${startIndex} in segment ${segmentId || 'body'}`)
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
            segmentId: shadow.__segmentId,
            tabId: shadow.__tabId
          },
        },
      });
    }
    (elItem.__twig?.children || []).forEach(childTwig => stet(childTwig));
  };
  stet(twig);
  return ur;
};

/**
 * Updates the paragraph style for a given element.
 * @param {import('./fakeelement.js').FakeElement} element The element whose paragraph style to update.
 * @param {GoogleAppsScript.Document.ParagraphStyle} paragraphStyle The style object to apply.
 * @param {string} fields The comma-separated string of field names to update.
 * @returns {import('./fakeelement.js').FakeElement} The element, for chaining.
 */
export const updateParagraphStyle = (element, paragraphStyle, fields) => {
  const shadow = element.shadowDocument;
  const item = element.__elementMapItem;
  const range = {
    startIndex: item.startIndex,
    endIndex: item.endIndex,
    segmentId: shadow.__segmentId,
    tabId: shadow.__tabId,
  };

  const requests = [{
    updateParagraphStyle: { range, paragraphStyle, fields },
  }];

  Docs.Documents.batchUpdate({ requests }, shadow.getId());
  shadow.refresh();
  return element;
  
};
