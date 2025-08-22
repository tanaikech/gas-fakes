import { ElementType } from '../enums/docsenums.js';
import { Utils } from "../../support/utils.js";
const { is } = Utils
import { insertTableRowRequest, deleteTableRowRequest, reverseUpdateContent } from './elementblasters.js';


// adding a textless item has some special juggling to do
const handleTextless = (loc, isAppend, self, type, extras = {}) => {

  // the only difference between a body append and para append is that we need to insert 
  // '\n before if its a body
  // if its a pagebreak we need to remove the additional \n that inserting a page break causes
  const reqs = []
  const location = Docs.newLocation()
    .setSegmentId(loc.segmentId)
    .setIndex(loc.index)


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
          .setStartIndex(loc.index + 1)
          .setEndIndex(loc.index + 2)

        // when appending to the body we need a leading \n and get rid of the trailing one
        if (self.getType() === ElementType.BODY_SECTION) {
          reqs.push({ insertText: { location, text: '\n' } })
          range.setStartIndex(loc.index + 2).setEndIndex(loc.index + 3)
        }

        reqs.push({ deleteContentRange: Docs.newDeleteContentRangeRequest().setRange(range) })
      }
      break;

    case 'TABLE':

      // since the table content is empty, this is how much space it'll need initially
      // since the startindex is actually going to be the leading \n, we need to accoutn for that
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
  getMainRequest: ({ content: textOrParagraph, location, isAppend, self, leading, trailing }) => {
    const isDetachedPara = is.object(textOrParagraph) && textOrParagraph.__isDetached;
    let baseText;
    if (isDetachedPara) {
      const item = textOrParagraph.__elementMapItem;
      const fullText = (item.paragraph?.elements || []).map(el => el.textRun?.content || '').join('');
      baseText = fullText.replace(/\n$/, '');
    } else {
      baseText = is.string(textOrParagraph) ? textOrParagraph : textOrParagraph.getText();
    }

    const textToInsert = leading + baseText + trailing
    return { insertText: { location, text: textToInsert } };
  },
  getStyleRequests: (paragraph, startIndex, length, isAppend) => {
    const requests = [];
    const detachedItem = paragraph.__elementMapItem;
    const paraElements = detachedItem.paragraph?.elements || [];
    const paraStyle = detachedItem.paragraph?.paragraphStyle;

    if (paraStyle && Object.keys(paraStyle).length > 0) {
      const fields = Object.keys(paraStyle).join(',');
      requests.push({
        updateParagraphStyle: { range: { startIndex, endIndex: startIndex + length }, paragraphStyle: paraStyle, fields: fields },
      });
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
          requests.push({ updateTextStyle: { range: { startIndex: currentOffset, endIndex: currentOffset + styleableLength }, textStyle: textStyle, fields: fields } });
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
  getStyleRequests: (paragraph, startIndex, length, isAppend) => {
    const requests = [];
    const detachedItem = paragraph.__elementMapItem;
    const paraElements = detachedItem.paragraph?.elements || [];
    const paraStyle = detachedItem.paragraph?.paragraphStyle;

    if (paraStyle && Object.keys(paraStyle).length > 0) {
      const fields = Object.keys(paraStyle).join(',');
      requests.push({
        updateParagraphStyle: { range: { startIndex, endIndex: startIndex + length }, paragraphStyle: paraStyle, fields: fields },
      });
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
          requests.push({ updateTextStyle: { range: { startIndex: currentOffset, endIndex: currentOffset + styleableLength }, textStyle: textStyle, fields: fields } });
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
    let rows, cells, columns;
    const isDetached = is.object(elementOrText) && elementOrText.__isDetached;

    if (isDetached) {
      // This is an insertTable(index, table.copy()) call.
      const table = elementOrText;
      rows = table.getNumRows();
      columns = rows > 0 ? table.getRow(0).getNumCells() : 0;

      if (rows > 0 && columns > 0) {
        cells = Array.from({ length: rows }, (_, r) => {
          const row = table.getRow(r);
          return Array.from({ length: columns }, (_, c) => {
            return row.getCell(c).getText();
          });
        });
      } else {
        cells = []; // Handle empty copied table
      }
    } else {
      // This is an appendTable() or appendTable(cells) call.
      cells = elementOrText; // Can be null or String[][]
    }

    const isEmptyRequest = !cells || cells.length === 0;
    rows = isEmptyRequest ? (DocumentApp.isFake ? 1 : 0) : cells.length;
    columns = isEmptyRequest ? (DocumentApp.isFake ? 1 : 0) : (cells[0].length || 1);

    const initialRows = rows > 0 ? rows : 1;

    let requests = handleTextless(location, isAppend, self, 'TABLE', { rows: initialRows, columns });
    // The insertTable API call always creates a paragraph before the table,
    // so the table's start index will be 1 greater than the insertion location index.
    // The `leading` variable is for other element types and not applicable here.
    const tableStartIndex = location.index + 1;

    if (rows === 0) {
      requests.push(deleteTableRowRequest(tableStartIndex, 0));
    } else if (cells) {
      const shadow = self.__structure.shadowDocument;
      Docs.Documents.batchUpdate({ requests }, shadow.getId());
      shadow.refresh();
      requests = reverseUpdateContent(shadow.resource.body.content, tableStartIndex, cells);
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
  getStyleRequests: (listItem, startIndex, length, isAppend) => {
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
          },
          // Using a default. API will handle list creation/joining.
          bulletPreset: 'NUMBERED_DECIMAL_ALPHA_ROMAN',
        },
      });
    }

    if (paraStyle && Object.keys(paraStyle).length > 0) {
      const fields = Object.keys(paraStyle).join(',');
      requests.push({
        updateParagraphStyle: { range: { startIndex, endIndex: startIndex + length }, paragraphStyle: paraStyle, fields: fields },
      });
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
          requests.push({ updateTextStyle: { range: { startIndex: currentOffset, endIndex: currentOffset + styleableLength }, textStyle: textStyle, fields: fields } });
        }
        currentOffset += content.length;
      }
    });
    return requests;
  },
  findType: 'PARAGRAPH',
};
