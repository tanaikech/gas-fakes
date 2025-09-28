import { ElementType } from '../enums/docsenums.js';
import { Utils } from "../../support/utils.js";
import { notYetImplemented } from '../../support/helpers.js';
const { is, isBlob } = Utils
import { insertTableRowRequest, deleteTableRowRequest, reverseUpdateContent } from './elementblasters.js';
import mime from 'mime';


// adding a textless item has some special juggling to do
const handleTextless = (loc, isAppend, self, type, extras = {}) => {

  // the only difference between a body append and para append is that we need to insert 
  // '\n before if its a body
  // if its a pagebreak we need to remove the additional \n that inserting a page break causes
  const reqs = []
  const location = Docs.newLocation().setIndex(loc.index)
  if (loc.segmentId) location.setSegmentId(loc.segmentId)
  if (loc.tabId) location.setTabId(loc.tabId)


  switch (type) {
    case 'PAGE_BREAK':
      reqs.push({
        insertPageBreak: Docs.newInsertPageBreakRequest()
          .setLocation(location)
      })
      // if its an append we need to fiddle with where the \n is for a pagebreak
      // to emulate apps script behavior
      if (isAppend) {
        const range = Docs.newRange()
          .setStartIndex(loc.index + 1);
        if (loc.segmentId) range.setSegmentId(loc.segmentId)
        if (loc.tabId) range.setTabId(loc.tabId)

        // when appending to the body we need a leading \n and get rid of the trailing one
        if (self.getType() === ElementType.BODY_SECTION) {
          reqs.push({ insertText: { location, text: '\n' } })
          range.setStartIndex(loc.index + 2).setEndIndex(loc.index + 3);
        }

        reqs.push({ deleteContentRange: Docs.newDeleteContentRangeRequest().setRange(range) })
      }
      break;

    case 'TABLE':

      // since the table content is empty, this is how much space it'll need initially
      // since the startindex is actually going to be the leading \n, we need to account for that
      ///const endTableIndex = location.index + extras.rows * extras.columns + 1 + 1

      // for a table the insert request will generate a leading \n
      reqs.push({
        insertTable: Docs.newInsertTableRequest()
          .setLocation(location)
          .setRows(extras.rows)
          .setColumns(extras.columns)
      })

      break;

    default:
      throw new Error(`unknown type ${type} in handleTextless `)
  }




  return reqs
}
// describes how to handle parargraph elements
export const paragraphOptions = {
  elementType: ElementType.PARAGRAPH,
  insertMethodSignature: 'DocumentApp.Body.insertParagraph',
  canAcceptText: true,
  getMainRequest: ({ content: textOrParagraph, location, leading, trailing, structure, self }) => {
    const isDetachedPara = is.object(textOrParagraph) && textOrParagraph.__isDetached;

    // Case 1: Appending/inserting a detached paragraph object.
    if (isDetachedPara) {
      const item = textOrParagraph.__elementMapItem;
      const fullText = (item.paragraph?.elements || []).map(el => el.textRun?.content || '').join('');
      const baseText = fullText.replace(/\n$/, '');
      const textToInsert = leading + baseText + trailing;
      return { insertText: { location, text: textToInsert } };
    }

    // Case 2: Appending/inserting a string.
    if (is.string(textOrParagraph)) {
      const textToInsert = leading + textOrParagraph + trailing;
      const requests = [{ insertText: { location, text: textToInsert } }];

      const { resource, shadowDocument, elementMap } = structure;
      const { namedStyles } = shadowDocument.__unpackDocumentTab(resource);

      // --- Resolve the style for the new paragraph ---
      // Live behavior: A newly appended paragraph always gets its base style from the
      // NORMAL_TEXT definition, and these are applied as inline styles.
      let templateParaStyle = {};
      let templateTextStyle = {};
      const normalTextStyleDef = (namedStyles?.styles || []).find(s => s.namedStyleType === 'NORMAL_TEXT');
      templateParaStyle = normalTextStyleDef?.paragraphStyle || {};
      templateTextStyle = normalTextStyleDef?.textStyle || {};

      const newParaStartIndex = location.index + leading.length;
      const newContentEndIndex = newParaStartIndex + textOrParagraph.length;
      const newParaEndIndex = newContentEndIndex + 1;

      // --- Build style requests from the resolved template styles ---
      const paraStyleToApply = { ...templateParaStyle };
      paraStyleToApply.namedStyleType = 'NORMAL_TEXT'; // appendParagraph always creates a NORMAL_TEXT paragraph
      delete paraStyleToApply.headingId;
      const paraFields = Object.keys(paraStyleToApply).join(',');

      if (paraFields) {
        requests.push({
          updateParagraphStyle: {
            range: { startIndex: newParaStartIndex, endIndex: newParaEndIndex, segmentId: location.segmentId, tabId: location.tabId },
            paragraphStyle: paraStyleToApply,
            fields: paraFields,
          },
        });
      }

      // Live behavior: New paragraphs inherit text styles set by body.setAttributes().
      // We retrieve these from the shadow document.
      const defaultTextAttributes = shadowDocument.__defaultTextAttributes || {};
      const textStyleToApply = { ...templateTextStyle, ...defaultTextAttributes };
      const textFields = Object.keys(textStyleToApply).join(',');

      if (textFields && textOrParagraph.length > 0) {
        requests.push({
          updateTextStyle: {
            range: { startIndex: newParaStartIndex, endIndex: newContentEndIndex, segmentId: location.segmentId, tabId: location.tabId },
            textStyle: textStyleToApply,
            fields: textFields,
          },
        });
      }
      return requests;
    }

    // Fallback for other cases
    const baseText = textOrParagraph.getText();
    const textToInsert = leading + baseText + trailing;
    return { insertText: { location, text: textToInsert } };
  },
  getStyleRequests: (paragraph, startIndex, isAppend, segmentId, tabId) => {
    const requests = [];
    const detachedItem = paragraph.__elementMapItem;
    const paraElements = detachedItem.paragraph?.elements || [];
    const paraStyle = detachedItem.paragraph?.paragraphStyle;

    if (paraStyle && Object.keys(paraStyle).length > 0) {
      // The 'headingId' property is read-only and cannot be part of an update request.
      // We must create a copy of the style object and remove it before building the request.
      const styleToApply = { ...paraStyle };
      delete styleToApply.headingId;

      const fields = Object.keys(styleToApply).join(',');
      if (fields) { // Only send a request if there are fields to update.
        const textLength = (paragraph.getText() || '').length;
        const paraLength = textLength + 1; // Paragraph includes the newline
        requests.push({ updateParagraphStyle: { range: { startIndex, endIndex: startIndex + paraLength, segmentId, tabId }, paragraphStyle: styleToApply, fields } });
      }
    }

    let currentOffset = startIndex;
    paraElements.forEach(el => {
      if (el.textRun && el.textRun.content) {
        const content = el.textRun.content;
        const textStyle = el.textRun.textStyle;
        const styleableContent = content.replace(/\n$/, '');
        const styleableLength = styleableContent.length;

        if (textStyle && Object.keys(textStyle).length > 0 && styleableLength > 0) {
          const fields = Object.keys(textStyle).join(',');
          requests.push({ updateTextStyle: { range: { startIndex: currentOffset, endIndex: currentOffset + styleableLength, segmentId, tabId }, textStyle: textStyle, fields: fields } });
        }
        currentOffset += content.length;
      }
    });
    return requests;
  },
};

export const textOptions = {
  elementType: ElementType.TEXT,
  insertMethodSignature: 'DocumentApp.Paragraph.appendText',
  canAcceptText: true,
  findChildType: ElementType.TEXT.toString(),
  getMainRequest: ({ content: textOrTextElement, location }) => {
    const isDetachedText = is.object(textOrTextElement) && textOrTextElement.__isDetached;
    let baseText;
    if (isDetachedText) {
      const item = textOrTextElement.__elementMapItem;
      // TODO - check what a text element looks like here
      const fullText = item.getText()
      // TODO dont think this is required
      // baseText = fullText.replace(/\n$/, '');
      baseText = fullText
    } else {
      baseText = is.string(textOrTextElement) ? textOrTextElement : textOrTextElement.getText();
    }
    // no leading/trailing in append text
    const textToInsert = baseText
    return { insertText: { location, text: textToInsert } };
  },
  getStyleRequests: (paragraph, startIndex, isAppend, segmentId, tabId) => {
    const requests = [];
    const detachedItem = paragraph.__elementMapItem;
    const paraElements = detachedItem.paragraph?.elements || [];
    const paraStyle = detachedItem.paragraph?.paragraphStyle;

    if (paraStyle && Object.keys(paraStyle).length > 0) {
      // The 'headingId' property is read-only and cannot be part of an update request.
      // We must create a copy of the style object and remove it before building the request.
      const styleToApply = { ...paraStyle };
      delete styleToApply.headingId;

      const fields = Object.keys(styleToApply).join(',');
      if (fields) { // Only send a request if there are fields to update.
        const textLength = (paragraph.getText() || '').length;
        requests.push({ updateParagraphStyle: { range: { startIndex, endIndex: startIndex + textLength, segmentId, tabId }, paragraphStyle: styleToApply, fields } });
      }
    }

    let currentOffset = startIndex;
    paraElements.forEach(el => {
      if (el.textRun && el.textRun.content) {
        const content = el.textRun.content;
        const textStyle = el.textRun.textStyle;
        const styleableContent = content.replace(/\n$/, '');
        const styleableLength = styleableContent.length;

        if (textStyle && Object.keys(textStyle).length > 0 && styleableLength > 0) {
          const fields = Object.keys(textStyle).join(',');
          requests.push({ updateTextStyle: { range: { startIndex: currentOffset, endIndex: currentOffset + styleableLength, segmentId, tabId }, textStyle: textStyle, fields: fields } });
        }
        currentOffset += content.length;
      }
    });
    return requests;
  },
};

// THE API has no way of inserting a horizontal rule
// parking this for now - it'll need to be resurrected if this issue ever gets resolved
// https://issuetracker.google.com/issues/437825936


export const pageBreakOptions = {
  elementType: ElementType.PAGE_BREAK,
  insertMethodSignature: 'DocumentApp.Body.pageBreak',
  packCanBeNull: true,
  canAcceptText: false,
  getMainRequest: ({ location: loc, isAppend, self, leading }) => {
    return handleTextless(loc, isAppend, self, 'PAGE_BREAK')
  },
  getStyleRequests: null, // PageBreak styling on copy not supported yet.
  findType: ElementType.PARAGRAPH.toString(),
  findChildType: ElementType.PAGE_BREAK.toString()


};

export const tableOptions = {
  elementType: ElementType.TABLE,
  packCanBeNull: true,
  insertMethodSignature: 'DocumentApp.Body.insertTable',
  canAcceptArray: true,
  canAcceptText: false, // It accepts an array of arrays of strings, not a simple string.
  getMainRequest: ({ content: elementOrText, location, isAppend, self, leading }) => {
    let rows, columns;
    const isDetached = is.object(elementOrText) && elementOrText.__isDetached;

    if (isDetached) {
      // This is an insertTable(index, table.copy()) call.
      const table = elementOrText;
      rows = table.getNumRows();
      columns = rows > 0 ? table.getRow(0).getNumCells() : 1;
    } else {
      // This is an appendTable() or appendTable(cells) call.
      const cells = elementOrText; // Can be null or String[][]
      rows = !cells || cells.length === 0 ? (DocumentApp.isFake ? 1 : 0) : cells.length;
      columns = !cells || cells.length === 0 || cells[0].length === 0 ? (DocumentApp.isFake ? 1 : 0) : (cells[0].length || 1);
    }

    const initialRows = rows > 0 ? rows : 1;
    const initialColumns = columns > 0 ? columns : 1;

    let requests = handleTextless(location, isAppend, self, 'TABLE', { rows: initialRows, columns: initialColumns });

    if (rows === 0) {
      // we need to know where the table will be to delete its row
      const tableStartIndex = location.index + 1;
      requests.push(deleteTableRowRequest(tableStartIndex, 0, loc.segmentId, loc.tabId));
    }

    return requests;
  }
};

export const listItemOptions = {
  elementType: ElementType.LIST_ITEM,
  insertMethodSignature: 'DocumentApp.Body.insertListItem',
  canAcceptText: true,
  getMainRequest: ({ content: textOrListItem, location, isAppend, self, leading, trailing }) => {
    const isDetached = is.object(textOrListItem) && textOrListItem.__isDetached;
    let baseText;

    if (isDetached) {
      const item = textOrListItem.__elementMapItem;
      const fullText = (item.paragraph?.elements || []).map(el => el.textRun?.content || '').join('');
      baseText = fullText.replace(/\n$/, '');
    } else {
      baseText = is.string(textOrListItem) ? textOrListItem : textOrListItem.getText();
    }

    const textToInsert = leading + baseText + trailing;
    // The bulleting is handled separately in elementInserter to ensure it targets the correct, new paragraph.
    return { insertText: { location, text: textToInsert } };
  },
  getStyleRequests: (listItem, startIndex, isAppend, segmentId, tabId) => {
    const requests = [];
    const detachedItem = listItem.__elementMapItem;
    const paraElements = detachedItem.paragraph?.elements || [];
    const paraStyle = detachedItem.paragraph?.paragraphStyle;
    const bullet = detachedItem.paragraph?.bullet;

    // For a copied item, we must also apply the bullet to make it a list item.
    if (bullet) {
      requests.push({
        createParagraphBullets: {
          range: {
            startIndex: startIndex,
            endIndex: startIndex,
            segmentId,
            tabId
          },
          // Using a default. API will handle list creation/joining.
          bulletPreset: 'NUMBERED_DECIMAL_ALPHA_ROMAN',
        },
      });
    }

    if (paraStyle && Object.keys(paraStyle).length > 0) {
      // The 'headingId' property is read-only and cannot be part of an update request.
      // We must create a copy of the style object and remove it before building the request.
      const styleToApply = { ...paraStyle };
      delete styleToApply.headingId;

      const fields = Object.keys(styleToApply).join(',');
      if (fields) { // Only send a request if there are fields to update.
        const textLength = (listItem.getText() || '').length;
        const paraLength = textLength + 1; // Paragraph includes the newline
        requests.push({ updateParagraphStyle: { range: { startIndex, endIndex: startIndex + paraLength, segmentId, tabId }, paragraphStyle: styleToApply, fields } });
      }
    }

    let currentOffset = startIndex;
    paraElements.forEach(el => {
      if (el.textRun && el.textRun.content) {
        const content = el.textRun.content;
        const textStyle = el.textRun.textStyle;
        const styleableContent = content.replace(/\n$/, '');
        const styleableLength = styleableContent.length;

        if (textStyle && Object.keys(textStyle).length > 0 && styleableLength > 0) {
          const fields = Object.keys(textStyle).join(',');
          requests.push({ updateTextStyle: { range: { startIndex: currentOffset, endIndex: currentOffset + styleableLength, segmentId, tabId }, textStyle: textStyle, fields: fields } });
        }
        currentOffset += content.length;
      }
    });
    return requests;
  },
  findType: 'PARAGRAPH',
};

export const imageOptions = {
  elementType: ElementType.INLINE_IMAGE,
  insertMethodSignature: 'DocumentApp.Body.insertImage',
  canAcceptText: false,
  // This internal helper is extracted so it can be used by Paragraph.appendInlineImage
  // without invoking the complex request-building logic of getMainRequest.
  __getImageUriAndSize: (image) => {
    const isDetachedImage = is.object(image) && is.function(image.getType) && image.getType() === ElementType.INLINE_IMAGE;
    const isBlobSource = isBlob(image);

    let uri, size, fileId, cleanup = null;

    if (isDetachedImage) {
      if (!image.__isDetached) throw new Error('Element must be detached.');
      // The copy() method stores the full inline object properties, which we can retrieve.
      const { object: inlineObject } = image.__getInlineObject();
      if (!inlineObject) {
        // This should be caught by __getInlineObject, but as a safeguard:
        throw new Error('Detached image is missing its properties. Was it created with .copy()?');
      }

      const embeddedObject = inlineObject.inlineObjectProperties.embeddedObject;
      const imageProperties = embeddedObject.imageProperties;
      size = embeddedObject.size;
      uri = imageProperties.contentUri;
    } else if (isBlobSource) {
      // For blobs, we must upload them to Drive to get a public URI for the Docs API.
      const blob = image;

      // Validate the blob against Docs API limitations before uploading.
      const MAX_IMAGE_BYTES = 50 * 1024 * 1024; // 50 MB
      const SUPPORTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif'];

      const contentType = blob.getContentType();
      if (!SUPPORTED_MIME_TYPES.includes(contentType)) {
        throw new Error(`Unsupported image type: ${contentType}. Only PNG, JPEG, and GIF are supported.`);
      }

      const sizeInBytes = blob.getBytes().length;
      if (sizeInBytes > MAX_IMAGE_BYTES) {
        throw new Error(`Image size (${(sizeInBytes / 1024 / 1024).toFixed(2)} MB) exceeds the 50 MB limit.`);
      }
      // Note: Pixel limit (25 megapixels) check is not implemented as it would require a full image processing library.

      let extension = mime.getExtension(contentType);
      const tempFileName = `gas-fakes-temp-image-${Utilities.getUuid()}${extension ? '.' + extension : ''}`;

      // 1. Upload to Drive
      blob.setName(tempFileName)
      const file = DriveApp.createFile(blob)
      fileId = file.getId()

      try {
        // 2. Make public so the Docs API can access it. This may take a moment to propagate.
        Drive.Permissions.create({
          type: 'anyone',
          role: 'reader',
        }, fileId);

        // Give permissions a moment to propagate before the Docs API tries to access the URI.
        // This is a known issue; a delay is often needed.
        Utilities.sleep(2000);

        // 3. Construct a direct download link. The webContentLink can be unreliable for API access.
        // The webContentLink is the most reliable way for another Google service to access the content.
        const fileWithLink = Drive.Files.get(fileId, { fields: 'webContentLink' });
        if (!fileWithLink || !fileWithLink.webContentLink) {
          throw new Error('Failed to get public link for temporary image.');
        }
        uri = fileWithLink.webContentLink;

        size = {
          height: { magnitude: image.getHeight ? image.getHeight() : 100, unit: 'PT' },
          width: { magnitude: image.getWidth ? image.getWidth() : 100, unit: 'PT' },
        };

        cleanup = () => {
          try { Drive.Files.update({ trashed: true }, fileId); }
          catch (e) { console.warn(`Failed to cleanup temporary image file ${fileId}:`, e.message); }
        };
      } catch (e) {
        // if something fails during setup, trash the file immediately
        try {
          Drive.Files.update({ trashed: true }, fileId);
        } catch (trashError) {
          console.warn(`Failed to cleanup temp file ${fileId} after setup error.`, trashError);
        }
        throw e;
      }
    } else {
      throw new Error('Only inserting a copied (detached) InlineImage or a Blob is supported at this time.');
    }
    return { uri, size, cleanup };
  },
  getMainRequest: ({ content: image, location, isAppend, self, leading, trailing }) => {
    const { uri, size, cleanup } = imageOptions.__getImageUriAndSize(image);

    if (!uri) {
      throw new Error('Could not determine image URI for insertion.');
    }

    const imageRequest = {
      insertInlineImage: {
        uri,
        location,
      },
    };

    if (size) {
      imageRequest.insertInlineImage.objectSize = size;
    }

    const textRequest = (leading || trailing) ? { insertText: { text: leading || trailing, location } } : null;
    const imageLocation = (leading) ? { ...location, index: location.index + 1 } : location;
    const imageRequestWithCorrectedLocation = { ...imageRequest, insertInlineImage: { ...imageRequest.insertInlineImage, location: imageLocation } };

    const finalRequests = textRequest ? [textRequest, imageRequestWithCorrectedLocation] : [imageRequestWithCorrectedLocation];

    return { requests: finalRequests, cleanup };
  },
  getStyleRequests: null, // Styling is part of the image object itself.
  findType: 'PARAGRAPH', // We are creating a paragraph to hold the image.
  findChildType: 'INLINE_IMAGE', // The element we want to return is the image.
};

export const positionedImageOptions = {
  elementType: ElementType.POSITIONED_IMAGE,
  insertMethodSignature: 'DocumentApp.Paragraph.addPositionedImage',
  canAcceptText: false,
  getMainRequest: ({ content: image, location, isAppend, self }) => {
    // There is no public API to create a positioned image.
    // This method is not emulatable.
    if (DocumentApp.isFake) {
      notYetImplemented('Paragraph.addPositionedImage');
    }

    // Positioned images can only be inserted into paragraphs.
    if (self.getType() !== ElementType.PARAGRAPH) {
      throw new Error('Positioned images can only be added to a Paragraph.');
    }

    const isBlobSource = isBlob(image);

    let uri, size, fileId, positionedObjectProperties;

    if (isBlobSource) {
      // For blobs, we must upload them to Drive to get a public URI for the Docs API.
      const blob = image;
      const MAX_IMAGE_BYTES = 50 * 1024 * 1024; // 50 MB
      const SUPPORTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif'];
      const contentType = blob.getContentType();
      if (!SUPPORTED_MIME_TYPES.includes(contentType)) {
        throw new Error(`Unsupported image type: ${contentType}. Only PNG, JPEG, and GIF are supported.`);
      }
      const sizeInBytes = blob.getBytes().length;
      if (sizeInBytes > MAX_IMAGE_BYTES) {
        throw new Error(`Image size (${(sizeInBytes / 1024 / 1024).toFixed(2)} MB) exceeds the 50 MB limit.`);
      }
      const extension = mime.getExtension(contentType);
      const tempFileName = `gas-fakes-temp-image-${Utilities.getUuid()}${extension ? '.' + extension : ''}`;

      blob.setName(tempFileName);
      const file = DriveApp.createFile(blob);
      fileId = file.getId();

      try {
        Drive.Permissions.create({ type: 'anyone', role: 'reader' }, fileId);
        Utilities.sleep(2000);
        const fileWithLink = Drive.Files.get(fileId, { fields: 'webContentLink' });
        if (!fileWithLink || !fileWithLink.webContentLink) {
          throw new Error('Failed to get public link for temporary image.');
        }
        uri = fileWithLink.webContentLink;

        size = {
          height: { magnitude: 100, unit: 'PT' },
          width: { magnitude: 100, unit: 'PT' },
        };
        // Set default properties for new blobs
        positionedObjectProperties = {
          positioning: {
            layout: 'WRAP_TEXT',
            leftOffset: { magnitude: 36, unit: 'PT' },
            topOffset: { magnitude: 36, unit: 'PT' },
          },
          embeddedObject: {
            imageProperties: {
              contentUri: uri,
            },
            size: size,
          }
        };
      } catch (e) {
        try { Drive.Files.update({ trashed: true }, fileId); } catch (trashError) { console.warn(`Failed to cleanup temp file ${fileId} after setup error.`, trashError); }
        throw e;
      }
    } else {
      throw new Error('Only inserting a Blob is supported for PositionedImage at this time.');
    }

    if (!uri) throw new Error('Could not determine image URI for insertion.');

    const imageRequest = {
      createPositionedObject: {
        location,
        positionedObjectProperties, // Use the copied or default properties
      },
    };

    const finalRequests = [imageRequest];

    if (isBlobSource) {
      const cleanup = () => { try { Drive.Files.update({ trashed: true }, fileId); } catch (e) { console.warn(`Failed to cleanup temporary image file ${fileId}:`, e.message); } };
      return { requests: finalRequests, cleanup };
    }

    return finalRequests;
  },
  getStyleRequests: null,
  findType: 'PARAGRAPH',
  findChildType: 'POSITIONED_IMAGE',
};
