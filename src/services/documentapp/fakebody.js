import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { shadowPrefix } from './nrhelpers.js'
import { newFakeFootnoteSection } from './fakefootnotesection.js';
import { appendParagraph, insertParagraph, appendPageBreak, insertPageBreak, appendTable, insertTable, appendListItem, insertListItem, appendImage, insertImage } from './appenderhelpers.js'
import { registerElement } from './elementRegistry.js';
const { is } = Utils

class FakeBody extends FakeContainerElement {

  constructor(shadowDocument, name) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body');
    if ((nargs < 1 || nargs > 2) || !is.object(shadowDocument)) {
      matchThrow();
    }
    // The name from getBody() will be undefined, so we default it. The name from __cast() will be defined.
    super(shadowDocument, name || shadowPrefix + 'BODY_SECTION_')
  }

  getText() {
    // getChildren() is not a standard method on Body. We build the array of children
    // using getNumChildren() and getChild(i).
    const children = [];
    for (let i = 0; i < this.getNumChildren(); i++) {
      children.push(this.getChild(i));
    }
    // The live environment joins the text of each child paragraph with a newline.
    // An empty paragraph's text is '', so an empty doc's body text is '',
    // and a doc with an empty para and a 'p1' para has body text '\np1'.
    return children.map(c => c.getText()).join('\n');
  }

  clear() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.clear');
    if (nargs !== 0) matchThrow();
    // Live behavior: clear() deletes body content AND resets all named styles to their defaults.
    // The shadowDocument.clear() method handles both of these actions.
    this.__shadowDocument.clear();
    return this;
  }

  __updateDocumentStyle(style, fields) {
    const shadow = this.__shadowDocument;
    const requests = [{
      updateDocumentStyle: {
        documentStyle: style,
        fields: fields,
      },
    }];
    Docs.Documents.batchUpdate({ requests }, shadow.getId());
    shadow.refresh();
    return this;
  }

  __buildStyleUpdateRequests(namedStyleType, attributes) {
    const paraStyle = {};
    const textStyle = {};
    const paraFields = [];
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
      if (value === null) continue;

      switch (String(key)) {
        // Paragraph Styles
        case String(Attribute.HORIZONTAL_ALIGNMENT):
          const alignmentMap = {
            [DocumentApp.HorizontalAlignment.LEFT]: 'START',
            [DocumentApp.HorizontalAlignment.CENTER]: 'CENTER',
            [DocumentApp.HorizontalAlignment.RIGHT]: 'END',
            [DocumentApp.HorizontalAlignment.JUSTIFY]: 'JUSTIFY',
          };
          paraStyle.alignment = alignmentMap[value];
          paraFields.push('alignment');
          break;
        case String(Attribute.INDENT_FIRST_LINE): paraStyle.indentFirstLine = { magnitude: value, unit: 'PT' }; paraFields.push('indentFirstLine'); break;
        case String(Attribute.INDENT_START): paraStyle.indentStart = { magnitude: value, unit: 'PT' }; paraFields.push('indentStart'); break;
        case String(Attribute.INDENT_END): paraStyle.indentEnd = { magnitude: value, unit: 'PT' }; paraFields.push('indentEnd'); break;
        case String(Attribute.LINE_SPACING): paraStyle.lineSpacing = value * 100; paraFields.push('lineSpacing'); break;
        case String(Attribute.SPACING_AFTER): paraStyle.spaceBelow = { magnitude: value, unit: 'PT' }; paraFields.push('spaceBelow'); break;
        case String(Attribute.SPACING_BEFORE): paraStyle.spaceAbove = { magnitude: value, unit: 'PT' }; paraFields.push('spaceAbove'); break;
        case String(Attribute.LEFT_TO_RIGHT): paraStyle.direction = value ? 'LEFT_TO_RIGHT' : 'RIGHT_TO_LEFT'; paraFields.push('direction'); break;

        // Text Styles
        case String(Attribute.BACKGROUND_COLOR): textStyle.backgroundColor = { color: { rgbColor: colorToRgb(value) } }; textFields.push('backgroundColor'); break;
        case String(Attribute.BOLD): textStyle.bold = value; textFields.push('bold'); break;
        case String(Attribute.FONT_FAMILY): textStyle.weightedFontFamily = { fontFamily: value }; textFields.push('weightedFontFamily'); break;
        case String(Attribute.FONT_SIZE): textStyle.fontSize = { magnitude: value, unit: 'PT' }; textFields.push('fontSize'); break;
        case String(Attribute.FOREGROUND_COLOR): textStyle.foregroundColor = { color: { rgbColor: colorToRgb(value) } }; textFields.push('foregroundColor'); break;
        case String(Attribute.ITALIC): textStyle.italic = value; textFields.push('italic'); break;
        case String(Attribute.LINK_URL): textStyle.link = { url: value }; textFields.push('link'); break;
        case String(Attribute.STRIKETHROUGH): textStyle.strikethrough = value; textFields.push('strikethrough'); break;
        case String(Attribute.UNDERLINE): textStyle.underline = value; textFields.push('underline'); break;
        default:
          // This should not happen if all attributes are handled.
          throw new Error(`Unhandled attribute key in __buildStyleUpdateRequests: ${key}`);
      }
    }

    const requests = [];

    // To update a named style, we must target a range that uses that style. The API then updates the style definition.
    // For NORMAL_TEXT, the first paragraph `[1, 2)` is a reliable anchor.
    // A more robust solution for other heading types would search the document for a paragraph with the given heading.
    const anchorRange = { startIndex: 1, endIndex: 2 };

    if (paraFields.length > 0) {
      // For paragraph attributes, we also need to tell the API which named style
      // is being applied to the range. This is done by including namedStyleType
      // in the paragraphStyle object and the fields mask.
      paraStyle.namedStyleType = namedStyleType;
      paraFields.push('namedStyleType');
      requests.push({
        updateParagraphStyle: {
          range: anchorRange,
          paragraphStyle: paraStyle,
          fields: paraFields.join(','),
        },
      });
    }

    if (textFields.length > 0) {
      // For text attributes, we use a separate updateTextStyle request.
      // The API infers the named style update from the range.
      requests.push({
        updateTextStyle: {
          range: anchorRange,
          textStyle: textStyle,
          fields: textFields.join(','),
        },
      });
    }

    return requests;
  }

  appendParagraph(textOrParagraph) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.appendParagraph');
    if (nargs !== 1) matchThrow();
    return appendParagraph(this, textOrParagraph);
  }

  insertParagraph(childIndex, paragraph) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.insertParagraph');
    if (nargs !== 2) matchThrow();

    // Per the docs, inserting at an index equal to the number of children
    // is equivalent to an append operation.
    if (childIndex === this.getNumChildren()) {
      return this.appendParagraph(paragraph);
    }
    return insertParagraph(this, childIndex, paragraph);
  }

  appendPageBreak(pageBreak) {
    return appendPageBreak(this, pageBreak || null);
  }

  insertPageBreak(childIndex, pageBreak) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.insertPageBreak');
    if (nargs < 1 || nargs > 2) matchThrow();

    // Per the docs, inserting at an index equal to the number of children
    // is equivalent to an append operation.
    if (childIndex === this.getNumChildren()) {
      return this.appendPageBreak(pageBreak);
    }
    return insertPageBreak(this, childIndex, pageBreak);
  }

  appendTable(tableOrCells) {
    return appendTable(this, tableOrCells);
  }

  insertTable(childIndex, tableOrCells) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.insertTable');
    if (nargs !== 2) matchThrow();

    // Per the docs, inserting at an index equal to the number of children
    // is equivalent to an append operation.
    if (childIndex === this.getNumChildren()) {
      return this.appendTable(tableOrCells);
    }
    const t =  insertTable(this, childIndex, tableOrCells);
    return t
  }

  appendListItem(listItemOrText) {
    return appendListItem(this, listItemOrText);
  }

  insertListItem(childIndex, listItemOrText) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.insertListItem');
    if (nargs !== 2) matchThrow();

    // Per the docs, inserting at an index equal to the number of children
    // is equivalent to an append operation.
    if (childIndex === this.getNumChildren()) {
      return this.appendListItem(listItemOrText);
    }
    return insertListItem(this, childIndex, listItemOrText);
  }

  appendImage(image) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.appendImage');
    if (nargs !== 1) matchThrow();
    return appendImage(this, image);
  }

  insertImage(childIndex, image) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.insertImage');
    if (nargs !== 2) matchThrow();

    if (childIndex === this.getNumChildren()) {
      return this.appendImage(image);
    }
    return insertImage(this, childIndex, image);
  }

  setAttributes(attributes) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.setAttributes');
    if (nargs !== 1 || !is.object(attributes)) matchThrow();

    // Live behavior is strange:
    // 1. It applies TEXT attributes (e.g. FONT_FAMILY, ITALIC) to all paragraphs (existing and new).
    // 2. It does NOT apply PARAGRAPH attributes (e.g. HORIZONTAL_ALIGNMENT) to any paragraphs.
    // To emulate this, we need to do two things in a batch update:
    // a) Update the text style for the entire range of the body.
    // b) Update the text style for the 'NORMAL_TEXT' named style so new paragraphs inherit it.

    const shadow = this.__shadowDocument;
    const requests = [];

    // Step 1: Build the text style update object from the given attributes.
    // We only care about text attributes for this method.
    const textStyle = {};
    const textFields = [];
    const Attribute = DocumentApp.Attribute;

    // Re-implementing the text style part of __buildStyleUpdateRequests's switch statement
    // to avoid applying paragraph attributes.
    const colorToRgb = (hex) => {
      if (!hex || !hex.startsWith('#') || hex.length !== 7) return null;
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return { red: r, green: g, blue: b };
    };

    for (const key in attributes) {
      const value = attributes[key];
      if (value === null) continue;
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

    if (textFields.length === 0) {
      return this;
    }

    const fields = textFields.join(',');

    // Step 2: Create a request to update the style for all existing content in the body.
    const { body } = shadow.__unpackDocumentTab(shadow.resource);
    const bodyContent = body.content;
    const lastElement = bodyContent[bodyContent.length - 1];

    // Only update if there's content beyond the initial newline of an empty doc.
    if (lastElement.endIndex > 1) {
      requests.push({
        updateTextStyle: {
          range: { startIndex: 1, endIndex: lastElement.endIndex, segmentId: body.segmentId || '' },
          textStyle,
          fields,
        },
      });
    }

    // Step 3: Create a request to update the 'NORMAL_TEXT' named style for future paragraphs.
    // This is done via an updateTextStyle request, targeting the anchor range of the first paragraph.
    // The API infers that the named style definition for that range ('NORMAL_TEXT') should be updated.
    requests.push({
      updateTextStyle: {
        range: { startIndex: 1, endIndex: 2 }, // Anchor range for named style update
        textStyle: textStyle,
        fields: fields,
      },
    });

    // Step 4: Execute the batch update.
    if (requests.length > 0) {
      Docs.Documents.batchUpdate({ requests }, shadow.getId());
      shadow.refresh();
    }
    return this;
  }

  setHeadingAttributes(paragraphHeading, attributes) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.setHeadingAttributes');
    if (nargs !== 2 || !is.object(paragraphHeading) || !is.object(attributes)) matchThrow();

    const headingMap = {
      [DocumentApp.ParagraphHeading.NORMAL]: 'NORMAL_TEXT',
      [DocumentApp.ParagraphHeading.HEADING1]: 'HEADING_1',
      [DocumentApp.ParagraphHeading.HEADING2]: 'HEADING_2',
      [DocumentApp.ParagraphHeading.HEADING3]: 'HEADING_3',
      [DocumentApp.ParagraphHeading.HEADING4]: 'HEADING_4',
      [DocumentApp.ParagraphHeading.HEADING5]: 'HEADING_5',
      [DocumentApp.ParagraphHeading.HEADING6]: 'HEADING_6',
      [DocumentApp.ParagraphHeading.TITLE]: 'TITLE',
      [DocumentApp.ParagraphHeading.SUBTITLE]: 'SUBTITLE',
    };
    const namedStyleType = headingMap[paragraphHeading.toString()];
    if (!namedStyleType) {
      throw new Error(`Invalid paragraph heading: ${paragraphHeading}`);
    }

    const requests = this.__buildStyleUpdateRequests(namedStyleType, attributes);
    if (requests.length > 0) {
      const shadow = this.__shadowDocument;
      Docs.Documents.batchUpdate({ requests }, shadow.getId());
      shadow.refresh();
    }
    return this;
  }

  setMarginBottom(marginBottom) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.setMarginBottom');
    if (nargs !== 1 || !is.number(marginBottom)) matchThrow();
    return this.__updateDocumentStyle({ marginBottom: { magnitude: marginBottom, unit: 'PT' } }, 'marginBottom');
  }

  setMarginLeft(marginLeft) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.setMarginLeft');
    if (nargs !== 1 || !is.number(marginLeft)) matchThrow();
    return this.__updateDocumentStyle({ marginLeft: { magnitude: marginLeft, unit: 'PT' } }, 'marginLeft');
  }

  setMarginRight(marginRight) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.setMarginRight');
    if (nargs !== 1 || !is.number(marginRight)) matchThrow();
    return this.__updateDocumentStyle({ marginRight: { magnitude: marginRight, unit: 'PT' } }, 'marginRight');
  }

  setMarginTop(marginTop) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.setMarginTop');
    if (nargs !== 1 || !is.number(marginTop)) matchThrow();
    return this.__updateDocumentStyle({ marginTop: { magnitude: marginTop, unit: 'PT' } }, 'marginTop');
  }

  setPageHeight(pageHeight) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.setPageHeight');
    if (nargs !== 1 || !is.number(pageHeight)) matchThrow();
    return this.__updateDocumentStyle({ pageSize: { height: { magnitude: pageHeight, unit: 'PT' } } }, 'pageSize.height');
  }

  setPageWidth(pageWidth) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.setPageWidth');
    if (nargs !== 1 || !is.number(pageWidth)) matchThrow();
    return this.__updateDocumentStyle({ pageSize: { width: { magnitude: pageWidth, unit: 'PT' } } }, 'pageSize.width');
  }

  setText(text) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.setText');
    if (nargs !== 1 || !is.string(text)) matchThrow();
    // clear() leaves one empty paragraph, which is what we want to replace.
    this.clear();
    if (text) {
      // Instead of appending a new paragraph (which would create a leading newline in getText()),
      // we insert the text into the existing empty paragraph that clear() leaves behind.
      // The location is index 1, which is right after the initial section break.
      const requests = [{
        insertText: { location: { index: 1 }, text }
      }];
      const shadow = this.__shadowDocument;
      Docs.Documents.batchUpdate({ requests }, shadow.getId());
      shadow.refresh();
    }
    return this;
  }

  setTextAlignment(textAlignment) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.setTextAlignment');
    // This method takes a TextAlignment enum, not a HorizontalAlignment enum.
    const validEnums = [DocumentApp.TextAlignment.NORMAL, DocumentApp.TextAlignment.SUPERSCRIPT, DocumentApp.TextAlignment.SUBSCRIPT];
    if (nargs !== 1 || !is.object(textAlignment) || !validEnums.includes(textAlignment)) {
      matchThrow();
    }
    // The corresponding attribute is `baselineOffset`, which is not exposed via DocumentApp.Attribute.
    // Therefore, we cannot implement this by calling setAttributes.
    // For now, we validate the signature and treat it as a no-op, which is better than the
    // previous incorrect implementation that accepted the wrong enum.
    return this;
  }

  /**
   * Gets the footnote section of the document.
   * @returns {GoogleAppsScript.Document.FootnoteSection} The footnote section.
   * @see https://developers.google.com/apps-script/reference/document/body#getFootnoteSection()
   */
  getFootnoteSection() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.getFootnoteSection');
    if (nargs !== 0) matchThrow();
    return newFakeFootnoteSection(this.__shadowDocument, shadowPrefix + 'FOOTNOTE_SECTION_');
  }

  toString() {
    return 'Body';
  }
}

export const newFakeBody = (...args) => Proxies.guard(new FakeBody(...args));

registerElement('BODY_SECTION', newFakeBody);
