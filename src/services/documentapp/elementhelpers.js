/**
 * @file Provides helper functions for working with fake document elements.
 */

import {slogger } from "../../support/slogger.js";
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

  slogger.error(se);
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

  // Base case: Text element.
  if (item.textRun) {
    return item.textRun.content || '';
  }

  // Recursive case: Container element.
  // Note: For Paragraph, item.paragraph.elements will be processed as children via __twig.children
  if (item.__twig && item.__twig.children && item.__twig.children.length > 0) {
    return item.__twig.children
      .map(childTwig => getTextRecursive(childTwig, structure))
      .join('');
  }

  // Fallback for elements that might not have children in twig yet (e.g. Paragraph during initial map)
  if (item.paragraph) {
    return item.paragraph.elements.map(e => e.textRun?.content || '').join('');
  }

  return '';
};

/**
 * Gets the text content of an element, flattening all child text elements.
 * @param {import('./fakeelement.js').FakeElement} element The element to get text from.
 * @returns {string} The text content.
 */
export const getText = (element) => {
  if (!element) return '';
  const item = element.__elementMapItem;
  if (!item) return '';

  if (element.__isDetached) {
    let text = '';

    if (item.textRun) {
      text = item.textRun.content || '';
    } else if (item.paragraph) { // It's a Paragraph
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
  if (element.__isDetached) return {};

  const item = element.__elementMapItem;
  const inlineParaStyle = item.paragraph?.paragraphStyle || {};
  const firstTextRun = item.paragraph?.elements?.find(e => e.textRun);
  const textRunTextStyle = firstTextRun?.textRun?.textStyle || {};

  const attributes = {};
  const namedStyleType = inlineParaStyle.namedStyleType || 'NORMAL_TEXT';
  const Attribute = DocumentApp.Attribute;

  const getColorString = (colorObject) => {
    if (!colorObject || !colorObject.rgbColor) return null;
    const { red = 0, green = 0, blue = 0 } = colorObject.rgbColor;
    const toHex = (c) => Math.round((c || 0) * 255).toString(16).padStart(2, '0');
    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
  };

  // Helper to convert a style object to attributes.
  const styleToAttributes = (styleObj, isParaStyle) => {
    const tempAttrs = {};
    if (isParaStyle) {
      if (styleObj.alignment) {
        const alignmentMap = {
          'START': DocumentApp.HorizontalAlignment.LEFT,
          'CENTER': DocumentApp.HorizontalAlignment.CENTER,
          'END': DocumentApp.HorizontalAlignment.RIGHT,
          'JUSTIFY': DocumentApp.HorizontalAlignment.JUSTIFIED,
        };
        tempAttrs[Attribute.HORIZONTAL_ALIGNMENT] = alignmentMap[styleObj.alignment];
      }
      if (styleObj.direction) tempAttrs[Attribute.LEFT_TO_RIGHT] = styleObj.direction === 'LEFT_TO_RIGHT';
      if (styleObj.lineSpacing) tempAttrs[Attribute.LINE_SPACING] = styleObj.lineSpacing / 100;
      if (!is.undefined(styleObj.indentStart?.magnitude)) tempAttrs[Attribute.INDENT_START] = styleObj.indentStart.magnitude;
      if (!is.undefined(styleObj.indentEnd?.magnitude)) tempAttrs[Attribute.INDENT_END] = styleObj.indentEnd.magnitude;
      if (!is.undefined(styleObj.indentFirstLine?.magnitude)) tempAttrs[Attribute.INDENT_FIRST_LINE] = styleObj.indentFirstLine.magnitude;
      if (!is.undefined(styleObj.spaceAbove?.magnitude)) tempAttrs[Attribute.SPACING_BEFORE] = styleObj.spaceAbove.magnitude;
      if (!is.undefined(styleObj.spaceBelow?.magnitude)) tempAttrs[Attribute.SPACING_AFTER] = styleObj.spaceBelow.magnitude;
    } else { // isTextStyle
      if (styleObj.backgroundColor) tempAttrs[Attribute.BACKGROUND_COLOR] = getColorString(styleObj.backgroundColor.color);
      if (!is.undefined(styleObj.bold)) tempAttrs[Attribute.BOLD] = styleObj.bold;
      if (styleObj.weightedFontFamily?.fontFamily) tempAttrs[Attribute.FONT_FAMILY] = styleObj.weightedFontFamily.fontFamily;
      if (styleObj.fontSize?.magnitude) tempAttrs[Attribute.FONT_SIZE] = styleObj.fontSize.magnitude;
      if (styleObj.foregroundColor) tempAttrs[Attribute.FOREGROUND_COLOR] = getColorString(styleObj.foregroundColor.color);
      if (!is.undefined(styleObj.italic)) tempAttrs[Attribute.ITALIC] = styleObj.italic;
      if (!is.undefined(styleObj.strikethrough)) tempAttrs[Attribute.STRIKETHROUGH] = styleObj.strikethrough;
      if (!is.undefined(styleObj.underline)) tempAttrs[Attribute.UNDERLINE] = styleObj.underline;
      if (styleObj.link?.url) tempAttrs[Attribute.LINK_URL] = styleObj.link.url;
    }
    return tempAttrs;
  };

  // 1. Get attributes from INLINE styles ONLY. This matches live behavior.
  const inlineParaAttrs = styleToAttributes(inlineParaStyle, true);
  const inlineTextAttrs = styleToAttributes(textRunTextStyle, false);
  Object.assign(attributes, inlineParaAttrs, inlineTextAttrs);

  // 2. Handle the NORMAL_TEXT exception: computed paragraph styles are returned.
  // This mimics the live behavior where newly appended NORMAL_TEXT paragraphs
  // report their computed paragraph styles.
  if (namedStyleType === 'NORMAL_TEXT') {
    const namedStyles = element.shadowDocument.resource.namedStyles?.styles || [];
    const normalTextStyleDef = namedStyles.find(s => s.namedStyleType === 'NORMAL_TEXT');
    if (normalTextStyleDef) {
      const baseParaStyle = normalTextStyleDef.paragraphStyle || {};
      const baseParaAttrs = styleToAttributes(baseParaStyle, true);
      // Merge base attributes, but give precedence to inline attributes already set.
      for (const key in baseParaAttrs) {
        if (attributes[key] === undefined) {
          attributes[key] = baseParaAttrs[key];
        }
      }
    }
  }

  // 3. Add HEADING and LIST attributes which are always present.
  if (element.getHeading) {
    attributes[Attribute.HEADING] = element.getHeading();
  }

  // --- List Item Attributes ---
  if (item.paragraph?.bullet) {
    if (element.getListId) attributes[Attribute.LIST_ID] = element.getListId();
    if (element.getNestingLevel) attributes[Attribute.NESTING_LEVEL] = element.getNestingLevel();
    if (element.getGlyphType) attributes[Attribute.GLYPH_TYPE] = element.getGlyphType();
  }

  // 4. Ensure all other attributes are null if not set.
  // This is the key to mimicking the live behavior where inherited attributes are null.
  const allAttrs = Object.values(DocumentApp.Attribute);
  allAttrs.forEach(attrKey => {
    if (attributes[attrKey] === undefined) attributes[attrKey] = null;
  });

  return attributes;
};

/**
 * Converts a DocumentApp.Attribute map to Docs API style objects.
 * @param {object} attributes The attributes to convert.
 * @returns {{paragraphStyle: object, textStyle: object, paraFields: string, textFields: string}}
 */
export const attributesToStyle = (attributes) => {
  const paragraphStyle = {};
  const textStyle = {};
  const paraFields = [];
  const textFields = [];

  const Attribute = DocumentApp.Attribute;

  const hexToRgb = (hex) => {
    if (!hex || !is.string(hex) || !hex.startsWith('#')) return null;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { color: { rgbColor: { red: r, green: g, blue: b } } };
  };

  const alignmentMap = {
    [DocumentApp.HorizontalAlignment.LEFT]: 'START',
    [DocumentApp.HorizontalAlignment.CENTER]: 'CENTER',
    [DocumentApp.HorizontalAlignment.RIGHT]: 'END',
    [DocumentApp.HorizontalAlignment.JUSTIFIED]: 'JUSTIFY',
  };

  for (const [key, value] of Object.entries(attributes)) {
    // Note: keys are likely strings like "BOLD", "HORIZONTAL_ALIGNMENT"
    switch (key) {
      case 'HORIZONTAL_ALIGNMENT':
      case Attribute.HORIZONTAL_ALIGNMENT.toString():
        paragraphStyle.alignment = alignmentMap[value] || value;
        paraFields.push('alignment');
        break;
      case 'LEFT_TO_RIGHT':
      case Attribute.LEFT_TO_RIGHT.toString():
        paragraphStyle.direction = value ? 'LEFT_TO_RIGHT' : 'RIGHT_TO_LEFT';
        paraFields.push('direction');
        break;
      case 'LINE_SPACING':
      case Attribute.LINE_SPACING.toString():
        paragraphStyle.lineSpacing = Math.round(value * 100);
        paraFields.push('lineSpacing');
        break;
      case 'INDENT_START':
      case Attribute.INDENT_START.toString():
        paragraphStyle.indentStart = { magnitude: value, unit: 'PT' };
        paraFields.push('indentStart');
        break;
      case 'INDENT_END':
      case Attribute.INDENT_END.toString():
        paragraphStyle.indentEnd = { magnitude: value, unit: 'PT' };
        paraFields.push('indentEnd');
        break;
      case 'INDENT_FIRST_LINE':
      case Attribute.INDENT_FIRST_LINE.toString():
        paragraphStyle.indentFirstLine = { magnitude: value, unit: 'PT' };
        paraFields.push('indentFirstLine');
        break;
      case 'SPACING_BEFORE':
      case Attribute.SPACING_BEFORE.toString():
        paragraphStyle.spaceAbove = { magnitude: value, unit: 'PT' };
        paraFields.push('spaceAbove');
        break;
      case 'SPACING_AFTER':
      case Attribute.SPACING_AFTER.toString():
        paragraphStyle.spaceBelow = { magnitude: value, unit: 'PT' };
        paraFields.push('spaceBelow');
        break;
      case 'BACKGROUND_COLOR':
      case Attribute.BACKGROUND_COLOR.toString():
        textStyle.backgroundColor = hexToRgb(value);
        textFields.push('backgroundColor');
        break;
      case 'BOLD':
      case Attribute.BOLD.toString():
        textStyle.bold = value;
        textFields.push('bold');
        break;
      case 'FONT_FAMILY':
      case Attribute.FONT_FAMILY.toString():
        textStyle.weightedFontFamily = { fontFamily: value };
        textFields.push('weightedFontFamily');
        break;
      case 'FONT_SIZE':
      case Attribute.FONT_SIZE.toString():
        textStyle.fontSize = { magnitude: value, unit: 'PT' };
        textFields.push('fontSize');
        break;
      case 'FOREGROUND_COLOR':
      case Attribute.FOREGROUND_COLOR.toString():
        textStyle.foregroundColor = hexToRgb(value);
        textFields.push('foregroundColor');
        break;
      case 'ITALIC':
      case Attribute.ITALIC.toString():
        textStyle.italic = value;
        textFields.push('italic');
        break;
      case 'STRIKETHROUGH':
      case Attribute.STRIKETHROUGH.toString():
        textStyle.strikethrough = value;
        textFields.push('strikethrough');
        break;
      case 'UNDERLINE':
      case Attribute.UNDERLINE.toString():
        textStyle.underline = value;
        textFields.push('underline');
        break;
      case 'LINK_URL':
      case Attribute.LINK_URL.toString():
        textStyle.link = { url: value };
        textFields.push('link');
        break;
    }
  }

  return { 
    paragraphStyle, 
    textStyle, 
    paraFields: paraFields.join(','), 
    textFields: textFields.join(',') 
  };
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
    slogger.error(elementMap.values())
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

/**
 * Updates the text style for a given element or range within it.
 * @param {import('./fakeelement.js').FakeElement} element The element whose text style to update.
 * @param {GoogleAppsScript.Document.TextStyle} textStyle The style object to apply.
 * @param {string} fields The comma-separated string of field names to update.
 * @param {object} [range] Optional specific range. Defaults to the element's range.
 * @returns {import('./fakeelement.js').FakeElement} The element, for chaining.
 */
export const updateTextStyle = (element, textStyle, fields, range = null) => {
  const shadow = element.shadowDocument;
  const item = element.__elementMapItem;
  const updateRange = range || {
    startIndex: item.startIndex,
    endIndex: item.endIndex,
    segmentId: shadow.__segmentId,
    tabId: shadow.__tabId,
  };

  const requests = [{
    updateTextStyle: { range: updateRange, textStyle, fields },
  }];

  Docs.Documents.batchUpdate({ requests }, shadow.getId());
  shadow.refresh();
  return element;
};
