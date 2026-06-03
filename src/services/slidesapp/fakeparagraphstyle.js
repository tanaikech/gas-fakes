import { Proxies } from '../../support/proxies.js';
import { ParagraphAlignment, SpacingMode, TextDirection } from '../enums/slidesenums.js';

/**
 * create a new FakeParagraphStyle instance
 * @param  {...any} args 
 * @returns {FakeParagraphStyle}
 */
export const newFakeParagraphStyle = (...args) => {
  return Proxies.guard(new FakeParagraphStyle(...args));
};

export class FakeParagraphStyle {
  constructor(textRange) {
    this.__textRange = textRange;
  }

  get __style() {
    // Similar to TextStyle, find first paragraph marker in range
    const resource = this.__textRange.__resource;
    const elements = resource?.textElements || [];
    const start = this.__textRange.getStartIndex();

    let currentIndex = 0;
    for (const element of elements) {
      const length = element.textRun?.content?.length || (element.autoText ? 1 : 0);
      if (currentIndex >= start && element.paragraphMarker) {
        return element.paragraphMarker.style || {};
      }
      currentIndex += length;
    }
    return {};
  }

  getIndentEnd() {
    return this.__textRange.__shape.__normalize(this.__style.indentEnd) || 0;
  }

  getIndentFirstLine() {
    return this.__textRange.__shape.__normalize(this.__style.indentFirstLine) || 0;
  }

  getIndentStart() {
    return this.__textRange.__shape.__normalize(this.__style.indentStart) || 0;
  }

  getLineSpacing() {
    return this.__style.lineSpacing || 100;
  }

  getParagraphAlignment() {
    return ParagraphAlignment[this.__style.alignment || 'START'];
  }

  getSpaceAbove() {
    return this.__textRange.__shape.__normalize(this.__style.spaceAbove) || 0;
  }

  getSpaceBelow() {
    return this.__textRange.__shape.__normalize(this.__style.spaceBelow) || 0;
  }

  getSpacingMode() {
    return SpacingMode[this.__style.spacingMode || 'NEVER_COLLAPSE'];
  }

  getTextDirection() {
    return TextDirection[this.__style.direction || 'LEFT_TO_RIGHT'];
  }

  __update(props, fields) {
    const presentationId = this.__textRange.__shape.__presentation.getId();
    const objectId = this.__textRange.__shape.getObjectId();
    const cellLocation = this.__textRange.__shape.__cellLocation;

    Slides.Presentations.batchUpdate({ requests: [{
        updateParagraphStyle: {
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

  setIndentEnd(indent) {
    this.__update({ indentEnd: { magnitude: indent, unit: 'PT' } }, 'indentEnd');
    return this;
  }

  setIndentFirstLine(indent) {
    this.__update({ indentFirstLine: { magnitude: indent, unit: 'PT' } }, 'indentFirstLine');
    return this;
  }

  setIndentStart(indent) {
    this.__update({ indentStart: { magnitude: indent, unit: 'PT' } }, 'indentStart');
    return this;
  }

  setLineSpacing(spacing) {
    this.__update({ lineSpacing: spacing }, 'lineSpacing');
    return this;
  }

  setParagraphAlignment(alignment) {
    this.__update({ alignment: alignment.toString() }, 'alignment');
    return this;
  }

  setSpaceAbove(space) {
    this.__update({ spaceAbove: { magnitude: space, unit: 'PT' } }, 'spaceAbove');
    return this;
  }

  setSpaceBelow(space) {
    this.__update({ spaceBelow: { magnitude: space, unit: 'PT' } }, 'spaceBelow');
    return this;
  }

  setSpacingMode(mode) {
    this.__update({ spacingMode: mode.toString() }, 'spacingMode');
    return this;
  }

  setTextDirection(direction) {
    this.__update({ direction: direction.toString() }, 'direction');
    return this;
  }

  toString() {
    return 'ParagraphStyle';
  }
}
