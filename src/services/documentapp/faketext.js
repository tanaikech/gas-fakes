import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { FakeElement } from './fakeelement.js';
import { registerElement } from './elementRegistry.js';
import { getAttributes as getAttributesHelper, updateTextStyle, getText as getTextHelper } from './elementhelpers.js';

const { is } = Utils;

/**
 * A fake implementation of the Text class for DocumentApp.
 * @implements {GoogleAppsScript.Document.Text}
 * @see https://developers.google.com/apps-script/reference/document/text
 */
class FakeText extends FakeElement {
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Gets the text contents of the element.
   * @returns {string} The text contents.
   */
  getText() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.getText');
    if (nargs !== 0) matchThrow();
    return getTextHelper(this);
  }

  getAttributes() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.getAttributes');
    if (nargs !== 0) matchThrow();
    return getAttributesHelper(this);
  }

  setAttributes(attributes) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.setAttributes');
    if (nargs !== 1 || !is.object(attributes)) matchThrow();

    const textStyle = {};
    const textFields = [];
    const Attribute = DocumentApp.Attribute;

    const colorToRgb = (hex) => {
      if (!hex || !hex.startsWith('#') || hex.length !== 7) return null;
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return { red: r, green: g, blue: b };
    };

    for (const key in attributes) {
      const value = attributes[key];
      // Note: GAS allows null to clear some attributes, but let's handle the basics first.
      switch (String(key)) {
        case String(Attribute.BACKGROUND_COLOR): textStyle.backgroundColor = { color: { rgbColor: colorToRgb(value) } }; textFields.push('backgroundColor'); break;
        case String(Attribute.BOLD): textStyle.bold = value; textFields.push('bold'); break;
        case String(Attribute.FONT_FAMILY): textStyle.weightedFontFamily = { fontFamily: value }; textFields.push('weightedFontFamily'); break;
        case String(Attribute.FONT_SIZE): textStyle.fontSize = { magnitude: value, unit: 'PT' }; textFields.push('fontSize'); break;
        case String(Attribute.FOREGROUND_COLOR): textStyle.foregroundColor = { color: { rgbColor: colorToRgb(value) } }; textFields.push('foregroundColor'); break;
        case String(Attribute.ITALIC): textStyle.italic = value; textFields.push('italic'); break;
        case String(Attribute.LINK_URL): textStyle.link = { url: value }; textFields.push('link'); break;
        case String(Attribute.STRIKETHROUGH): textStyle.strikethrough = value; textFields.push('strikethrough'); break;
        case String(Attribute.UNDERLINE): textStyle.underline = value; textFields.push('underline'); break;
      }
    }

    if (textFields.length === 0) return this;
    return updateTextStyle(this, textStyle, textFields.join(','));
  }

  setBold(bold) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.setBold');
    if (nargs !== 1 || !is.boolean(bold)) matchThrow();
    return updateTextStyle(this, { bold }, 'bold');
  }

  isBold() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.isBold');
    if (nargs !== 0) matchThrow();
    return !!this.getAttributes()[DocumentApp.Attribute.BOLD];
  }

  setItalic(italic) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.setItalic');
    if (nargs !== 1 || !is.boolean(italic)) matchThrow();
    return updateTextStyle(this, { italic }, 'italic');
  }

  isItalic() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.isItalic');
    if (nargs !== 0) matchThrow();
    return !!this.getAttributes()[DocumentApp.Attribute.ITALIC];
  }

  setUnderline(underline) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.setUnderline');
    if (nargs !== 1 || !is.boolean(underline)) matchThrow();
    return updateTextStyle(this, { underline }, 'underline');
  }

  isUnderline() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.isUnderline');
    if (nargs !== 0) matchThrow();
    return !!this.getAttributes()[DocumentApp.Attribute.UNDERLINE];
  }

  setFontFamily(fontFamily) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.setFontFamily');
    if (nargs !== 1 || !is.string(fontFamily)) matchThrow();
    return updateTextStyle(this, { weightedFontFamily: { fontFamily } }, 'weightedFontFamily');
  }

  getFontFamily() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.getFontFamily');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.FONT_FAMILY];
  }

  setFontSize(fontSize) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.setFontSize');
    if (nargs !== 1 || !is.number(fontSize)) matchThrow();
    return updateTextStyle(this, { fontSize: { magnitude: fontSize, unit: 'PT' } }, 'fontSize');
  }

  getFontSize() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.getFontSize');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.FONT_SIZE];
  }

  setForegroundColor(color) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.setForegroundColor');
    if (nargs !== 1 || !is.string(color)) matchThrow();
    const colorToRgb = (hex) => {
      if (!hex || !hex.startsWith('#') || hex.length !== 7) return null;
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return { red: r, green: g, blue: b };
    };
    return updateTextStyle(this, { foregroundColor: { color: { rgbColor: colorToRgb(color) } } }, 'foregroundColor');
  }

  getForegroundColor() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.getForegroundColor');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.FOREGROUND_COLOR];
  }

  setBackgroundColor(color) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.setBackgroundColor');
    if (nargs !== 1 || !is.string(color)) matchThrow();
    const colorToRgb = (hex) => {
      if (!hex || !hex.startsWith('#') || hex.length !== 7) return null;
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return { red: r, green: g, blue: b };
    };
    return updateTextStyle(this, { backgroundColor: { color: { rgbColor: colorToRgb(color) } } }, 'backgroundColor');
  }

  getBackgroundColor() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.getBackgroundColor');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.BACKGROUND_COLOR];
  }

  setLinkUrl(url) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.setLinkUrl');
    if (nargs !== 1 || (!is.string(url) && !is.null(url))) matchThrow();
    return updateTextStyle(this, { link: { url: url } }, 'link');
  }

  getLinkUrl() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.getLinkUrl');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.LINK_URL];
  }

  setStrikethrough(strikethrough) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.setStrikethrough');
    if (nargs !== 1 || !is.boolean(strikethrough)) matchThrow();
    return updateTextStyle(this, { strikethrough }, 'strikethrough');
  }

  isStrikethrough() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Text.isStrikethrough');
    if (nargs !== 0) matchThrow();
    return !!this.getAttributes()[DocumentApp.Attribute.STRIKETHROUGH];
  }

  toString() {
    return 'Text';
  }
}

export const newFakeText = (...args) => Proxies.guard(new FakeText(...args));

registerElement('TEXT', newFakeText);
