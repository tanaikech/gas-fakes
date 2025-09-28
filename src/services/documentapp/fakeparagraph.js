import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { imageOptions } from './elementoptions.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { registerElement } from './elementRegistry.js';
import { appendText, addPositionedImage, appendImage, insertImage } from './appenderhelpers.js';
import { getText as getTextHelper, getAttributes as getAttributesHelper, updateParagraphStyle } from './elementhelpers.js';

const { is } = Utils;

/**
 * @implements {GoogleAppsScript.Document.Paragraph}
 */
export class FakeParagraph extends FakeContainerElement {
  constructor(shadowDocument, name) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph');
    // An attached element has a shadowDocument and a string name (its ID).
    // A detached element (from .copy()) has a null shadowDocument and an object for its 'name' (which is actually its data).
    const isAttached = is.object(shadowDocument) && is.string(name);
    const isDetached = is.null(shadowDocument) && is.object(name);

    if (nargs !== 2 || (!isAttached && !isDetached)) {
      matchThrow();
    }
    super(shadowDocument, name);
  }

  getText() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.getText');
    if (nargs !== 0) matchThrow();
    return getTextHelper(this);
  }

  appendText(text) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.appendText');
    if (nargs !== 1) matchThrow();
    return appendText(this, text);
  }

  addPositionedImage(image) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.addPositionedImage');
    if (nargs !== 1) matchThrow();
    return addPositionedImage(this, image);
  }

  getAttributes() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.getAttributes');
    if (nargs !== 0) matchThrow();
    return getAttributesHelper(this);
  }

  appendInlineImage(image) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.appendInlineImage');
    if (nargs !== 1) matchThrow();

    // The generic appendImage helper creates a new paragraph. We need to insert into the existing one.
    // We can use the insertImage helper, which inserts at a specific child index.
    return this.insertInlineImage(this.getNumChildren(), image);
  }

  insertInlineImage(childIndex, image) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.insertInlineImage');
    if (nargs !== 2) matchThrow();

    // The generic insertImage helper is for top-level containers. We need a specific implementation.
    const children = [];
    for (let i = 0; i < this.getNumChildren(); i++) {
      children.push(this.getChild(i));
    }

    if (childIndex < 0 || childIndex > children.length) {
      throw new Error(`Child index (${childIndex}) must be between 0 and the number of child elements (${children.length}).`);
    }

    // Determine the character index for insertion.
    const insertIndex = (childIndex === children.length)
      ? this.__elementMapItem.endIndex - 1 // Append before the final newline
      : children[childIndex].__elementMapItem.startIndex; // Insert before the specified child

    return this.__insertImageAtIndex(image, insertIndex);
  }

  setHeading(heading) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.setHeading');
    if (nargs !== 1) matchThrow();

    // The enum values are strings, so we just need to map them to the API format.
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
      // Apps Script throws a specific error for invalid enum values.
      throw new Error(`Invalid argument: ${heading}`);
    }

    const item = this.__elementMapItem;
    const requests = [{
      updateParagraphStyle: {
        range: {
          startIndex: item.startIndex,
          endIndex: item.endIndex,
          segmentId: this.__segmentId,
          tabId: this.__tabId
        },
        paragraphStyle: {
          namedStyleType: apiHeading
        },
        fields: 'namedStyleType'
      }
    }];

    Docs.Documents.batchUpdate({ requests }, this.__shadowDocument.getId());
    this.__shadowDocument.refresh();
    return this;
  }

  getHeading() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.getHeading');
    if (nargs !== 0) matchThrow();

    const item = this.__elementMapItem;
    const namedStyleType = item.paragraph?.paragraphStyle?.namedStyleType;

    // The enum values are just strings, so we can reverse the map.
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

    // If the style is not a named style, it's considered NORMAL.
    return apiToEnumMap[namedStyleType] || DocumentApp.ParagraphHeading.NORMAL;
  }

  getAlignment() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.getAlignment');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT];
  }

  setAlignment(alignment) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.setAlignment');
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
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.getIndentEnd');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.INDENT_END];
  }

  setIndentEnd(indentEnd) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.setIndentEnd');
    if (nargs !== 1 || !is.number(indentEnd)) matchThrow();
    return updateParagraphStyle(this, { indentEnd: { magnitude: indentEnd, unit: 'PT' } }, 'indentEnd');
  }

  getIndentFirstLine() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.getIndentFirstLine');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.INDENT_FIRST_LINE];
  }

  setIndentFirstLine(indentFirstLine) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.setIndentFirstLine');
    if (nargs !== 1 || !is.number(indentFirstLine)) matchThrow();
    return updateParagraphStyle(this, { indentFirstLine: { magnitude: indentFirstLine, unit: 'PT' } }, 'indentFirstLine');
  }

  getIndentStart() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.getIndentStart');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.INDENT_START];
  }

  setIndentStart(indentStart) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.setIndentStart');
    if (nargs !== 1 || !is.number(indentStart)) matchThrow();
    return updateParagraphStyle(this, { indentStart: { magnitude: indentStart, unit: 'PT' } }, 'indentStart');
  }

  getLineSpacing() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.getLineSpacing');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.LINE_SPACING];
  }

  setLineSpacing(multiplier) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.setLineSpacing');
    if (nargs !== 1 || !is.number(multiplier)) matchThrow();
    return updateParagraphStyle(this, { lineSpacing: multiplier * 100 }, 'lineSpacing');
  }

  getSpacingAfter() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.getSpacingAfter');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.SPACING_AFTER];
  }

  setSpacingAfter(spacingAfter) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.setSpacingAfter');
    if (nargs !== 1 || !is.number(spacingAfter)) matchThrow();
    return updateParagraphStyle(this, { spaceBelow: { magnitude: spacingAfter, unit: 'PT' } }, 'spaceBelow');
  }

  getSpacingBefore() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.getSpacingBefore');
    if (nargs !== 0) matchThrow();
    return this.getAttributes()[DocumentApp.Attribute.SPACING_BEFORE];
  }

  setSpacingBefore(spacingBefore) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.setSpacingBefore');
    if (nargs !== 1 || !is.number(spacingBefore)) matchThrow();
    return updateParagraphStyle(this, { spaceAbove: { magnitude: spacingBefore, unit: 'PT' } }, 'spaceAbove');
  }

  isLeftToRight() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.isLeftToRight');
    if (nargs !== 0) matchThrow();
    // The getAttributes helper will return true/false/null.
    const ltr = this.getAttributes()[DocumentApp.Attribute.LEFT_TO_RIGHT];
    // Default to true if null, which matches live behavior for new paragraphs.
    return ltr === null ? true : ltr;
  }

  setLeftToRight(leftToRight) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Paragraph.setLeftToRight');
    if (nargs !== 1 || !is.boolean(leftToRight)) matchThrow();
    const direction = leftToRight ? 'LEFT_TO_RIGHT' : 'RIGHT_TO_LEFT';
    return updateParagraphStyle(this, { direction }, 'direction');
  }

  toString() {
    return 'Paragraph';
  }

  /**
   * Helper to insert an image at a specific character index.
   * @param {GoogleAppsScript.Base.BlobSource} image The image to insert.
   * @param {number} index The character index.
   * @returns {GoogleAppsScript.Document.InlineImage} The new image.
   * @private
   */
  __insertImageAtIndex(image, index) {
    // As you correctly pointed out, we must protect the named range of the parent paragraph.
    const item = this.__elementMapItem;
    const nr = this.shadowDocument.getNamedRange(item.__name);
    if (!nr) {
      throw new Error(`Internal error: Could not find named range for element ${item.__name}`);
    }
    // This is a simplified and corrected version of the logic in imageOptions.getMainRequest.
    // It directly creates the insertInlineImage request without the complex logic
    // for adding new paragraphs, which was causing the empty request array.
    const { uri, size, cleanup } = imageOptions.__getImageUriAndSize(image);

    const requests = [{
      insertInlineImage: {
        uri,
        location: { index, segmentId: this.__segmentId },
        objectSize: size,
      },
    }];

    // Add the protection requests to the batch update.
    // This tells the API to preserve the identity of the paragraph being modified.
    requests.push({ deleteNamedRange: { namedRangeId: nr.namedRangeId } });
    requests.push({
      createNamedRange: {
        name: nr.name,
        // The new range will be expanded by 1 character for the inserted image.
        range: { startIndex: item.startIndex, endIndex: item.endIndex + 1, segmentId: this.__segmentId },
      },
    });
    try {
      Docs.Documents.batchUpdate({ requests }, this.shadowDocument.getId());
      this.shadowDocument.refresh();
      // After refresh, find the newly created image element to return it.
      // This is a simplification; a more robust solution would find the image
      // based on its new objectId from the batchUpdate response.
      const children = [];
      for (let i = 0; i < this.getNumChildren(); i++) {
        children.push(this.getChild(i));
      }
      // The source 'image' can be a Blob or a detached InlineImage.
      // We need to get the name from the underlying blob in either case.
      const sourceImageName = image.getName ? image.getName() : image.getBlob().getName();
      return children.find(c => c.getType() === DocumentApp.ElementType.INLINE_IMAGE && c.getBlob().getName() === sourceImageName);
    } finally {
      if (cleanup) cleanup();
    }
  }
}

export const newFakeParagraph = (...args) => Proxies.guard(new FakeParagraph(...args));

registerElement('PARAGRAPH', newFakeParagraph);
registerElement('LIST_ITEM', newFakeParagraph); // ListItems are also paragraphs
