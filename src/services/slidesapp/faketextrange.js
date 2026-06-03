import { Proxies } from '../../support/proxies.js';
import { newFakeParagraph } from './fakeparagraph.js';
import { newFakeAutoText } from './fakeautotext.js';
import { newFakeTextStyle } from './faketextstyle.js';
import { newFakeParagraphStyle } from './fakeparagraphstyle.js';
import { newFakeListStyle } from './fakeliststyle.js';
import { AutofitType } from '../enums/slidesenums.js';

export const newFakeTextRange = (...args) => {
  return Proxies.guard(new FakeTextRange(...args));
};

export class FakeTextRange {
  constructor(shape, startIndex = null, endIndex = null) {
    this.__shape = shape;
    this.__startIndex = startIndex;
    this.__endIndex = endIndex;
  }

  get __resource() {
    const shapeResource = this.__shape.__resource;
    if (shapeResource && shapeResource.shape && shapeResource.shape.text) {
      return shapeResource.shape.text;
    }
    if (shapeResource && shapeResource.table) {
        return shapeResource.table.tableRows?.[this.__shape.__cellLocation?.rowIndex]?.tableCells?.[this.__shape.__cellLocation?.columnIndex]?.text || {};
    }
    return {};
  }

  getStartIndex() {
    return this.__startIndex !== null ? this.__startIndex : 0;
  }

  getEndIndex() {
    if (this.__endIndex !== null) return this.__endIndex;
    return this.getLength();
  }

  appendParagraph(text) {
    this.appendText(text + '\n');
    const paragraphs = this.getParagraphs();
    return paragraphs[paragraphs.length - 1];
  }

  appendRange(range) {
    this.appendText(range.asString());
    return this;
  }

  appendText(text) {
      // In Google Slides API, if the text ends in a newline, the insertion index
      // should be length - 1 to be inside the text.
      // But actually, for appending, length is correct if we want to add after.
      // The issue is likely that asString() is NOT matching API length.
      return this.insertText(this.asString().length, text);
  }

  getLength() {
    const textElements = this.__resource?.textElements || [];
    if (textElements.length === 0) return 0;
    
    const lastElement = textElements[textElements.length - 1];
    let totalLength = lastElement.endIndex || 0;

    if (this.__startIndex !== null && this.__endIndex !== null) {
      return Math.max(0, this.__endIndex - this.__startIndex);
    }
    if (this.__startIndex !== null) {
      return Math.max(0, totalLength - this.__startIndex);
    }
    return totalLength;
  }

  getLinks() {
    return this.getTextStyle().hasLink() ? [this] : [];
  }

  getListParagraphs() {
    return this.getParagraphs().filter(p => p.getRange().getListStyle().isInList());
  }

  getListStyle() {
    return newFakeListStyle(this);
  }

  getParagraphStyle() {
    return newFakeParagraphStyle(this);
  }

  getRange(start, end) {
    return newFakeTextRange(this.__shape, this.getStartIndex() + start, this.getStartIndex() + end);
  }

  getRuns() {
    return [this];
  }

  getTextStyle() {
    return newFakeTextStyle(this);
  }

  insertParagraph(offset, text) {
    this.insertText(offset, text + '\n');
    return this.getParagraphs().find(p => p.getRange().getStartIndex() === this.getStartIndex() + offset);
  }

  insertRange(offset, range) {
    return this.insertText(offset, range.asString());
  }

  replaceAllText(findText, replaceText, matchCase) {
    const presentationId = this.__shape.__presentation.getId();
    const requests = [{
      replaceAllText: {
        replaceText: replaceText,
        containsText: {
          text: findText,
          matchCase: matchCase
        },
        pageObjectIds: [this.__shape.getParentPage().getObjectId()]
      }
    }];

    const response = Slides.Presentations.batchUpdate({ requests }, presentationId);
    return response.replies[0].replaceAllText.occurrencesChanged || 0;
  }

  select() {
    return this;
  }

  asString() {
    const textElements = this.__resource?.textElements || [];
    if (textElements.length === 0) return '';
    
    // We need the full length of the underlying text resource to use API indices.
    const lastElement = textElements[textElements.length - 1];
    const fullLength = lastElement.endIndex || 0;

    // Reconstruct the full string based on API indices to ensure parity.
    const chars = new Array(fullLength).fill(null);
    for (const te of textElements) {
      const start = te.startIndex || 0;
      const end = te.endIndex;

      if (te.textRun) {
        const content = te.textRun.content;
        for (let i = 0; i < content.length; i++) {
          if (start + i < fullLength) chars[start + i] = content[i];
        }
      } else if (te.autoText) {
        if (start < fullLength) chars[start] = te.autoText.content || ' ';
      } else if (te.paragraphMarker) {
        if (end > 0 && end <= fullLength) chars[end - 1] = '\n';
      }
    }

    let fullText = chars.map(c => c === null ? '\n' : c).join('');

    if (this.__startIndex !== null && this.__endIndex !== null) {
      fullText = fullText.slice(this.__startIndex, this.__endIndex);
    } else if (this.__startIndex !== null) {
      fullText = fullText.slice(this.__startIndex);
    }

    return fullText;
  }

  asRenderedString() {
    return this.asString();
  }

  setText(newText) {
    this.clear();
    if (newText) {
      if (newText.endsWith('\n')) {
        newText = newText.slice(0, -1);
      }
      this.appendText(newText);
    }
    return this;
  }

  insertText(offset, text) {
    const objectId = this.__shape.getObjectId();
    const presentationId = this.__shape.__presentation.getId();

    const totalLen = this.getLength();
    let insertionIndex = this.getStartIndex() + offset;
    
    // In Slides API, insertionIndex cannot be after the final paragraph marker.
    // If the shape has length 12 (0-11 text, 11-12 marker), max insertionIndex is 11.
    if (insertionIndex >= totalLen && totalLen > 0) {
        insertionIndex = totalLen - 1;
    }

    Slides.Presentations.batchUpdate({ requests: [{
      insertText: {
        objectId: objectId,
        cellLocation: this.__shape.__cellLocation,
        insertionIndex: insertionIndex,
        text: text
      }
    }] }, presentationId);
    return this;
  }

  clear() {
    if (this.getLength() === 0) return this;
    const objectId = this.__shape.getObjectId();
    const presentationId = this.__shape.__presentation.getId();
    
    const type = (this.__startIndex === null && this.__endIndex === null) ? 'ALL' : 'FIXED_RANGE';
    const deleteRange = { type };
    if (type === 'FIXED_RANGE') {
      deleteRange.startIndex = this.getStartIndex();
      deleteRange.endIndex = this.getEndIndex();
    }
    
    Slides.Presentations.batchUpdate({ requests: [{
      deleteText: {
        objectId: objectId,
        cellLocation: this.__shape.__cellLocation,
        textRange: deleteRange
      }
    }] }, presentationId);
    return this;
  }

  getParagraphs() {
    const fullText = this.asString();
    if (fullText.length === 0) return [];

    const paragraphs = [];
    let currentIndex = 0;
    let paragraphIndex = 0;

    while (currentIndex < fullText.length) {
      const nextNewline = fullText.indexOf('\n', currentIndex);
      let endIndex;

      if (nextNewline === -1) {
        endIndex = fullText.length;
      } else {
        endIndex = nextNewline + 1;
      }

      const range = newFakeTextRange(this.__shape, this.getStartIndex() + currentIndex, this.getStartIndex() + endIndex);
      paragraphs.push(newFakeParagraph(range, paragraphIndex++));

      currentIndex = endIndex;
    }

    return paragraphs;
  }

  getAutoTexts() {
    const textElements = this.__resource?.textElements || [];
    const autoTexts = [];
    let charIndex = 0;
    let autoTextIndex = 0;

    const rangeStart = this.getStartIndex();
    const rangeEnd = this.getEndIndex();

    for (const element of textElements) {
      const elementLength = (element.textRun ? element.textRun.content.length : 0) +
        (element.autoText ? 1 : 0); 

      if (element.autoText) {
        if (charIndex >= rangeStart && charIndex < rangeEnd) {
            const autoText = newFakeAutoText(
              newFakeTextRange(this.__shape, charIndex, charIndex + 1), 
              element.autoText.type,
              autoTextIndex++
            );
            autoTexts.push(autoText);
        }
      }

      charIndex += elementLength;
    }
    return autoTexts;
  }

  isEmpty() {
    return this.asString().length === 0;
  }

  toString() {
    return 'TextRange';
  }
}
