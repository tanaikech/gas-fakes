/**
 * @file Provides a fake implementation of the ListItem class.
 */
import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { registerElement } from './elementRegistry.js';
import { getText, updateParagraphStyle } from './elementhelpers.js';
import { appendText } from './appenderhelpers.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;

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
 * @extends {FakeContainerElement}
 * @implements {GoogleAppsScript.Document.ListItem}
 * @see https://developers.google.com/apps-script/reference/document/list-item
 */
export class FakeListItem extends FakeContainerElement {
  /**
   * @param {object} structure The document structure manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(structure, nameOrItem) {
    super(structure, nameOrItem);
  }

  /**
   * Gets the text content of the list item, flattening all child text elements.
   * @returns {string} The text content.
   * @see https://developers.google.com/apps-script/reference/document/list-item#getText()
   */
  getText() {
    return getText(this);
  }

  /**
   * Appends text to the list item.
   * @param {string|GoogleAppsScript.Document.Text} textOrTextElement The text to append.
   * @returns {GoogleAppsScript.Document.ListItem} The list item, for chaining.
   */
  appendText(textOrTextElement) {
    appendText(this, textOrTextElement);
    return this;
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
    const list = docResource.lists?.[listId];
    if (!list) return null;

    const levelProps = list.listProperties?.nestingLevels?.[nestingLevel];
    // For a default list, the API might not return explicit level properties.
    // If we have a list item, it's safe to assume a default glyph if not specified.
    if (!levelProps) {
      return DocumentApp.GlyphType.BULLET;
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
