/**
 * @file Provides a fake implementation of the ListItem class.
 */
import { Proxies } from '../../support/proxies.js';
import { FakeParagraph } from './fakeparagraph.js';
import { registerElement } from './elementRegistry.js';
import { getText, updateParagraphStyle, getAttributes as getAttributesHelper, findItem } from './elementhelpers.js';
import { appendText, insertImage } from './appenderhelpers.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is, lobify } = Utils;

/**
 * Creates a new proxied FakeListItem instance.
 * @param {...any} args The arguments for the FakeListItem constructor.
 * @returns {FakeListItem} A new proxied FakeListItem instance.
 */
export const newFakeListItem = (...args) => {
  return Proxies.guard(new FakeListItem(...args));
};

/**
 * A fake implementation of the ListItem class for DocumentApp.
 * @class FakeListItem
 * @extends {FakeParagraph}
 * @implements {GoogleAppsScript.Document.ListItem}
 * @see https://developers.google.com/apps-script/reference/document/list-item
 */
export class FakeListItem extends FakeParagraph {
  /**
   * @param {import('./shadowdocument.js').ShadowDocument} shadowDocument The shadow document manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Gets a copy of the element's attributes.
   * @returns {object} The attributes.
   */
  getAttributes() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.getAttributes');
    if (nargs !== 0) matchThrow();
    return getAttributesHelper(this);
  }

  /**
   * Gets the glyph type of this list item.
   * @returns {GoogleAppsScript.Document.GlyphType} The glyph type.
   * @see https://developers.google.com/apps-script/reference/document/list-item#getGlyphType()
   */
  getGlyphType() {
    const listId = this.getListId();
    if (!listId) return null;

    const nestingLevel = this.getNestingLevel();
    // The shadowDocument is only available on attached elements.
    if (this.__isDetached) return null;
    const docResource = this.shadowDocument.resource;
    // The lists can be at the top level or inside the first tab.
    const { lists } = this.shadowDocument.__unpackDocumentTab(docResource);
    // Find the list by ID.
    const list = lists?.[listId];
    if (!list) return null;

    const levelProps = list.listProperties?.nestingLevels?.[nestingLevel];
    // For a default list, the API might not return explicit level properties.
    // If we have a list item, it's safe to assume a default glyph if not specified.
    if (!levelProps) {
      // The default list type in Apps Script is numbered.
      return DocumentApp.GlyphType.NUMBER;
    }

    // Map the API's glyph representation to the Apps Script GlyphType enum.
    if (levelProps.glyphType && levelProps.glyphType !== 'GLYPH_TYPE_UNSPECIFIED' && levelProps.glyphType !== 'NONE') {
      // Ordered list
      const typeMap = {
        'DECIMAL': 'NUMBER',
        'UPPER_ALPHA': 'LATIN_UPPER',
        'LOWER_ALPHA': 'LATIN_LOWER',
        'UPPER_ROMAN': 'ROMAN_UPPER',
        'LOWER_ROMAN': 'ROMAN_LOWER',
      };
      return DocumentApp.GlyphType[typeMap[levelProps.glyphType]] || null;
    } else if (levelProps.glyphSymbol) { // It's an unordered list with a specific symbol.
      // Unordered list. The symbol is a character. We map it back to the enum.
      const symbolMap = {
        '\u25CF': 'BULLET',        // ●
        '\u25CB': 'HOLLOW_BULLET', // ○
        '\u25A0': 'SQUARE_BULLET', // ■
      };
      // The default preset BULLET_DISC_CIRCLE_SQUARE uses these.
      return DocumentApp.GlyphType[symbolMap[levelProps.glyphSymbol]] || DocumentApp.GlyphType.BULLET;
    }
    // If it's an unordered list but glyphSymbol is not specified (e.g., default bullet), return BULLET.
    return DocumentApp.GlyphType.BULLET;
  }

  /**
   * Gets the ID of the list that contains this list item.
   * @returns {string} The list ID.
   * @see https://developers.google.com/apps-script/reference/document/list-item#getListId()
   */
  getListId() {
    const item = this.__elementMapItem;
    return item.paragraph?.bullet?.listId || null;
  }

  /**
   * Gets the nesting level of this list item.
   * @returns {Integer} The nesting level, starting from 0.
   * @see https://developers.google.com/apps-script/reference/document/list-item#getNestingLevel()
   */
  getNestingLevel() {
    const item = this.__elementMapItem;
    // The API returns a zero-based nesting level. If it's undefined, it defaults to 0.
    return item.paragraph?.bullet?.nestingLevel ?? 0;
  }

  /**
   * Gets the paragraph heading type.
   * @returns {GoogleAppsScript.Document.ParagraphHeading} The heading type.
   */
  getHeading() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.getHeading');
    if (nargs !== 0) matchThrow();

    const item = this.__elementMapItem;
    const namedStyleType = item.paragraph?.paragraphStyle?.namedStyleType;

    const apiToEnumMap = {
      'NORMAL_TEXT': DocumentApp.ParagraphHeading.NORMAL,
      'HEADING_1': DocumentApp.ParagraphHeading.HEADING1,
      'HEADING_2': DocumentApp.ParagraphHeading.HEADING2,
      'HEADING_3': DocumentApp.ParagraphHeading.HEADING3,
      'HEADING_4': DocumentApp.ParagraphHeading.HEADING4,
      'HEADING_5': DocumentApp.ParagraphHeading.HEADING5,
      'HEADING_6': DocumentApp.ParagraphHeading.HEADING6,
      'TITLE': DocumentApp.ParagraphHeading.TITLE,
      'SUBTITLE': DocumentApp.ParagraphHeading.SUBTITLE
    };

    return apiToEnumMap[namedStyleType] || DocumentApp.ParagraphHeading.NORMAL;
  }

  /**
   * Sets the paragraph heading type.
   * @param {GoogleAppsScript.Document.ParagraphHeading} heading The heading type.
   * @returns {ListItem} The list item, for chaining.
   */
  setHeading(heading) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.setHeading');
    if (nargs !== 1) matchThrow();

    const headingMap = {
      'NORMAL': 'NORMAL_TEXT',
      'HEADING1': 'HEADING_1',
      'HEADING2': 'HEADING_2',
      'HEADING3': 'HEADING_3',
      'HEADING4': 'HEADING_4',
      'HEADING5': 'HEADING_5',
      'HEADING6': 'HEADING_6',
      'TITLE': 'TITLE',
      'SUBTITLE': 'SUBTITLE'
    };

    const apiHeading = headingMap[heading];
    if (!apiHeading) {
      throw new Error(`Invalid argument: ${heading}`);
    }

    const paragraphStyle = { namedStyleType: apiHeading };
    const fields = 'namedStyleType';

    // Since ListItem is a paragraph, we can use the paragraph style updater.
    updateParagraphStyle(this, paragraphStyle, fields);
    return this;
  }

  getAlignment() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.getAlignment');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT];
  }

  setAlignment(alignment) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.setAlignment');
    if (nargs !== 1) matchThrow();

    const alignmentMap = {
      [DocumentApp.HorizontalAlignment.LEFT]: 'START',
      [DocumentApp.HorizontalAlignment.CENTER]: 'CENTER',
      [DocumentApp.HorizontalAlignment.RIGHT]: 'END',
      [DocumentApp.HorizontalAlignment.JUSTIFIED]: 'JUSTIFY',
    };

    const apiAlignment = alignmentMap[alignment];
    if (!apiAlignment) {
      throw new Error(`Invalid argument: ${alignment}`);
    }

    return updateParagraphStyle(this, { alignment: apiAlignment }, 'alignment');
  }

  getIndentEnd() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.getIndentEnd');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.INDENT_END];
  }

  setIndentEnd(indentEnd) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.setIndentEnd');
    if (nargs !== 1 || !is.number(indentEnd)) matchThrow();
    return updateParagraphStyle(this, { indentEnd: { magnitude: indentEnd, unit: 'PT' } }, 'indentEnd');
  }

  getIndentFirstLine() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.getIndentFirstLine');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.INDENT_FIRST_LINE];
  }

  getIndentStart() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.getIndentStart');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.INDENT_START];
  }

  getLineSpacing() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.getLineSpacing');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.LINE_SPACING];
  }

  setLineSpacing(multiplier) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.setLineSpacing');
    if (nargs !== 1 || !is.number(multiplier)) matchThrow();
    return updateParagraphStyle(this, { lineSpacing: multiplier * 100 }, 'lineSpacing');
  }

  getSpacingAfter() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.getSpacingAfter');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.SPACING_AFTER];
  }

  setSpacingAfter(spacingAfter) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.setSpacingAfter');
    if (nargs !== 1 || !is.number(spacingAfter)) matchThrow();
    return updateParagraphStyle(this, { spaceBelow: { magnitude: spacingAfter, unit: 'PT' } }, 'spaceBelow');
  }

  getSpacingBefore() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.getSpacingBefore');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.SPACING_BEFORE];
  }

  setSpacingBefore(spacingBefore) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.setSpacingBefore');
    if (nargs !== 1 || !is.number(spacingBefore)) matchThrow();
    return updateParagraphStyle(this, { spaceAbove: { magnitude: spacingBefore, unit: 'PT' } }, 'spaceAbove');
  }

  isLeftToRight() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.isLeftToRight');
    if (nargs !== 0) matchThrow();
    // The getAttributes helper will return true/false/null.
    const ltr = this.getAttributes()[DocumentApp.Attribute.LEFT_TO_RIGHT];
    // Default to true if null, which matches live behavior for new paragraphs.
    return ltr === null ? true : ltr;
  }

  setLeftToRight(leftToRight) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.setLeftToRight');
    if (nargs !== 1 || !is.boolean(leftToRight)) matchThrow();
    const direction = leftToRight ? 'LEFT_TO_RIGHT' : 'RIGHT_TO_LEFT';
    return updateParagraphStyle(this, { direction }, 'direction');
  }


  /**
   * Sets the glyph type of the list item.
   * @param {GoogleAppsScript.Document.GlyphType} glyphType The new glyph type.
   * @returns {ListItem} The list item, for chaining.
   * @see https://developers.google.com/apps-script/reference/document/list-item#setGlyphType(GlyphType)
   */
  setGlyphType(glyphType) {
    // The public Google Docs API does not currently support modifying list properties
    // like the glyph type directly. This would require an `updateListProperties`
    // request, which does not exist. See https://issuetracker.google.com/issues/36761330.
    return notYetImplemented('ListItem.setGlyphType due to Docs API limitations');
  }

  /**
   * Sets the indentation for the first line of the list item.
   * @param {number} indentFirstLine The indentation in points.
   * @returns {ListItem} The list item, for chaining.
   * @see https://developers.google.com/apps-script/reference/document/list-item#setIndentFirstLine(Number)
   */
  setIndentFirstLine(indentFirstLine) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.setIndentFirstLine');
    if (nargs !== 1 || !is.number(indentFirstLine)) matchThrow();
    return updateParagraphStyle(this, { indentFirstLine: { magnitude: indentFirstLine, unit: 'PT' } }, 'indentFirstLine');
  }

  /**
   * Sets the start indentation of the list item.
   * @param {number} indentStart The start indentation in points.
   * @returns {ListItem} The list item, for chaining.
   * @see https://developers.google.com/apps-script/reference/document/list-item#setIndentStart(Number)
   */
  setIndentStart(indentStart) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.setIndentStart');
    if (nargs !== 1 || !is.number(indentStart)) matchThrow();
    return updateParagraphStyle(this, { indentStart: { magnitude: indentStart, unit: 'PT' } }, 'indentStart');
  }

  clear() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.clear');
    if (nargs !== 0) matchThrow();

    const item = this.__elementMapItem;
    const requests = [];

    // Find the named range associated with this element to protect it.
    const nr = this.shadowDocument.getNamedRange(item.__name);
    if (!nr) {
      throw new Error(`Internal error: Could not find named range for element ${item.__name}`);
    }

    // Delete the content, but not the final newline that defines the paragraph.
    if (item.endIndex - 1 > item.startIndex) {
      requests.push({
        deleteContentRange: {
          range: { startIndex: item.startIndex, endIndex: item.endIndex - 1, segmentId: this.__segmentId }
        }
      });

      // Protect the named range by deleting the old one and recreating it with the same name but the new, smaller range.
      requests.push({ deleteNamedRange: { namedRangeId: nr.namedRangeId } });
      requests.push({
        createNamedRange: { name: nr.name, range: { startIndex: item.startIndex, endIndex: item.startIndex + 1, segmentId: this.__segmentId } },
      });

      Docs.Documents.batchUpdate({ requests }, this.shadowDocument.getId());
      this.shadowDocument.refresh();
    }
    return this;
  }

  setText(text) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ListItem.setText');
    if (nargs !== 1 || !is.string(text)) matchThrow();

    const item = this.__elementMapItem;
    const requests = [];

    // Find the named range associated with this element to protect it.
    const nr = this.shadowDocument.getNamedRange(item.__name);
    if (!nr) {
      throw new Error(`Internal error: Could not find named range for element ${item.__name}`);
    }

    if (item.endIndex - 1 > item.startIndex) {
      requests.push({ deleteContentRange: { range: { startIndex: item.startIndex, endIndex: item.endIndex - 1, segmentId: this.__segmentId } } });
    }
    if (text) {
      requests.push({ insertText: { location: { index: item.startIndex, segmentId: this.__segmentId }, text } });
    }

    // As you correctly pointed out, we must protect the named range.
    // Delete the old one and recreate it with the same name but the new, updated range.
    requests.push({ deleteNamedRange: { namedRangeId: nr.namedRangeId } });
    requests.push({
      createNamedRange: {
        name: nr.name,
        range: { startIndex: item.startIndex, endIndex: item.startIndex + (text ? text.length : 0) + 1, segmentId: this.__segmentId },
      },
    });
 
    Docs.Documents.batchUpdate({ requests }, this.shadowDocument.getId());
    this.shadowDocument.refresh();
  }

  /**
   * Sets the nesting level of the list item.
   * @param {number} nestingLevel The new nesting level, starting from 0.
   * @returns {ListItem} The list item, for chaining.
   * @see https://developers.google.com/apps-script/reference/document/list-item#setNestingLevel(Integer)
   */
  setNestingLevel(nestingLevel) {
    // The public Google Docs API does not currently support modifying the nesting
    // level of a list item directly. While this is achieved in the UI via
    // indentation, replicating this behavior via the API is not reliably possible
    // without an explicit method to set the nesting level.
    // See https://issuetracker.google.com/issues/36761330.
    return notYetImplemented('ListItem.setNestingLevel due to Docs API limitations');
  }

  toString() {
    return 'ListItem';
  }
}

registerElement('LIST_ITEM', newFakeListItem);
