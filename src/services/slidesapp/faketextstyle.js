import { Proxies } from '../../support/proxies.js';
import { newFakeLink } from './fakelink.js';
import { newFakeColor } from '../common/fakecolor.js';
import { TextBaselineOffset } from '../enums/slidesenums.js';

/**
 * create a new FakeTextStyle instance
 * @param  {...any} args 
 * @returns {FakeTextStyle}
 */
export const newFakeTextStyle = (...args) => {
  return Proxies.guard(new FakeTextStyle(...args));
};

export class FakeTextStyle {
  constructor(textRange) {
    this.__textRange = textRange;
  }

  get __style() {
    // In Slides API, styles are in TextElement.textRun.style.
    // A TextRange spans multiple elements. 
    // Usually GAS returns the style if it's uniform across the range, or null/default otherwise.
    // For simplicity, we'll return the style of the first textRun in the range.
    const resource = this.__textRange.__resource;
    const elements = resource?.textElements || [];
    const start = this.__textRange.getStartIndex();
    
    // Find the first textRun that overlaps with our range
    let currentIndex = 0;
    for (const element of elements) {
      const length = element.textRun?.content?.length || (element.autoText ? 1 : 0);
      if (currentIndex >= start && (element.textRun || element.autoText)) {
        return element.textRun?.style || element.autoText?.style || {};
      }
      currentIndex += length;
    }
    return {};
  }

  getBackgroundColor() {
    // Slides API: backgroundColor is in style.
    // But wait, Slides API style has backgroundColor property?
    // Actually, it has backgroundColor in TextStyle.
    return this.__style.backgroundColor ? newFakeColor(this.__style.backgroundColor) : null;
  }

  getBaselineOffset() {
    return TextBaselineOffset[this.__style.baselineOffset || 'NONE'];
  }

  getFontFamily() {
    return this.__style.fontFamily || 'Arial';
  }

  getFontSize() {
    return this.__textRange.__shape.__normalize(this.__style.fontSize) || 12;
  }

  getFontWeight() {
    return this.__style.fontWeight || 400;
  }

  getForegroundColor() {
    return this.__style.foregroundColor ? newFakeColor(this.__style.foregroundColor) : null;
  }

  getLink() {
    return this.__style.link ? newFakeLink(this.__style.link) : null;
  }

  hasLink() {
    return !!this.__style.link;
  }

  isBold() {
    return !!this.__style.bold;
  }

  isItalic() {
    return !!this.__style.italic;
  }

  isSmallCaps() {
    return !!this.__style.smallCaps;
  }

  isStrikethrough() {
    return !!this.__style.strikethrough;
  }

  isUnderline() {
    return !!this.__style.underline;
  }

  // Setters - using batchUpdate via parent shape/table
  __update(props, fields) {
      // Logic to send batchUpdate for the specific text range.
      // This requires the parent shape/table objectId and the range indices.
      const presentationId = this.__textRange.__shape.__presentation.getId();
      const objectId = this.__textRange.__shape.getObjectId();
      const cellLocation = this.__textRange.__shape.__cellLocation;

      Slides.Presentations.batchUpdate({ requests: [{
          updateTextStyle: {
              objectId,
              cellLocation,
              style: props,
              fields: fields || Object.keys(props).join(','),
              textRange: {
                  type: 'FIXED_RANGE',
                  startIndex: this.__textRange.getStartIndex(),
                  endIndex: this.__textRange.getEndIndex()
              }
          }
      }] }, presentationId);
  }

  setBold(bold) {
    this.__update({ bold }, 'bold');
    return this;
  }

  setItalic(italic) {
    this.__update({ italic }, 'italic');
    return this;
  }

  setUnderline(underline) {
    this.__update({ underline }, 'underline');
    return this;
  }

  setStrikethrough(strikethrough) {
    this.__update({ strikethrough }, 'strikethrough');
    return this;
  }

  setFontSize(fontSize) {
    this.__update({ fontSize: { magnitude: fontSize, unit: 'PT' } }, 'fontSize');
    return this;
  }

  setFontFamily(fontFamily) {
    this.__update({ fontFamily }, 'fontFamily');
    return this;
  }

  setForegroundColor(color) {
      // Simplified: assume hex string or Color object
      this.__update({ foregroundColor: { opaqueColor: { rgbColor: { red: 0, green: 0, blue: 0 } } } }, 'foregroundColor');
      return this;
  }

  toString() {
    return 'TextStyle';
  }
}
