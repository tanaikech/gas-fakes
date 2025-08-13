import { ElementType } from '../enums/docsenums.js';
import { Utils } from "../../support/utils.js";
const { is } = Utils
import {  insertTableRowRequest, deleteTableRowRequest, reverseUpdateContent  } from './elementblasters.js';


// adding a textless item has some special juggling to do
const handleTextless = (loc, isAppend, self, type, extras = {}) => {

  // the only difference between a body append and para append is that we need to insert 
  // '\n before if its a body
  // if its a pagebreak we need to remove the additional \n that inserting a page break causes
  const reqs = []
  const location = Docs.newLocation()
    .setSegmentId(loc.segmentId)
    .setIndex(loc.index)

  let init = null
  switch (type) {
    case 'PAGE_BREAK':
      init = {
        insertPageBreak: Docs.newInsertPageBreakRequest()
          .setLocation(location)
      }
      break;

    case 'TABLE':
      init = {
        insertTable: Docs.newInsertTableRequest()
          .setLocation(location)
          .setRows(extras.rows)
          .setColumns(extras.columns)
      }
      break;

    default:
      throw new Error(`unknown type ${type} in handleTextless `)
  }

  // the api inserts both a pb and a \n
  reqs.push(init)

  // if an actual append we have to do this stuff
  // if a body insert we don't need to bother
  // a table inserts its own paragraph \n before, so no need to insert a text 
  // I THINK!
  if (isAppend && type !== 'TABLE') {
    // this is where the additional \n inserted by the page request will end up
    // if its an append para
    const range = Docs.newRange()
      .setStartIndex(loc.index + 1)
      .setEndIndex(loc.index + 2)

    if (self.getType() === ElementType.BODY_SECTION) {
      reqs.push({ insertText: { location, text: '\n' } })
      range.setStartIndex(loc.index + 2).setEndIndex(loc.index + 3)
    }
    reqs.push({ deleteContentRange: Docs.newDeleteContentRangeRequest().setRange(range) })
  } 

  return reqs
}
// describes how to handle parargraph elements
export const paragraphOptions = {
  elementType: ElementType.PARAGRAPH,
  insertMethodSignature: 'DocumentApp.Body.insertParagraph',
  canAcceptText: true,
  getMainRequest: (textOrParagraph, location, isAppend, self) => {
    const isDetachedPara = is.object(textOrParagraph) && textOrParagraph.__isDetached;
    let baseText;
    if (isDetachedPara) {
      const item = textOrParagraph.__elementMapItem;
      const fullText = (item.paragraph?.elements || []).map(el => el.textRun?.content || '').join('');
      baseText = fullText.replace(/\n$/, '');
    } else {
      baseText = is.string(textOrParagraph) ? textOrParagraph : textOrParagraph.getText();
    }

    const isBodyAppend = isAppend && self.getType() !== ElementType.PARAGRAPH;
    const textToInsert = isBodyAppend ? '\n' + baseText : baseText + '\n';
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
  getMainRequest: (_pageBreak, loc, isAppend, self) => {
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
  getMainRequest: (elementOrText, location, isAppend, self) => {
    let  rows = 1, cells, columns = 1;
    const isDetached = is.object(elementOrText) && elementOrText.__isDetached;

    // this detached is stuff is gemini hallucination nonsense
    // TODO fix all this
    if (isDetached) {
      // This is an insertTable(index, table.copy()) call.
      // We create a table of the same dimensions. Content/style copy is not yet supported.
      const tableItem = elementOrText.__elementMapItem;
      rows = tableItem.table.rows;
      columns = tableItem.table.tableRows[0].tableCells.length;
      cells = null;
    } else {
      // This is an appendTable() or appendTable(cells) call.
      cells = elementOrText; // Can be null or String[][]
      rows = cells ? cells.length : 1;
      columns = cells && cells[0] ? cells[0].length : 1;
    }

    // Apps script can accept a table with no rows
    // but the api cannnot create a table stub with no rows
    // so we have to add with at least 1 row
    // issue - https://issuetracker.google.com/issues/438038924

    // first request is a table of 1 x n for simplicity
    let requests = handleTextless(location, isAppend, self, 'TABLE', { rows: 1, columns })

    // the tableStartIndex will be different depending if it was a body append or not
    const tableStartIndex = requests[0].insertTable.location.index + (isAppend ? 2 : 1)

    // next requests are to update rows to the table if we got some cells
    if (cells) {

      cells.forEach((_, rowIndex) => {
        requests.push(insertTableRowRequest(tableStartIndex, rowIndex));
      });
      // then delete the additional row that the initial request will have made
      requests.push(deleteTableRowRequest(tableStartIndex, 0));

      // now we need a refresh so we can know where everything is
      const shadow = self.__structure.shadowDocument;
      Docs.Documents.batchUpdate({ requests: requests }, shadow.getId())
      shadow.refresh()

      // a  new set of requests to update the content
      requests = reverseUpdateContent(shadow.resource.body.content, tableStartIndex, cells)
    }

    return requests;
  }

};
