/**
 * Adds a new row with data to a table in a Google Doc.
 *
 * @param {number} tableStartIndex The start index of the table to update.
 * @param {number} rowIndex The index where the new row should be inserted (0-based).
 */
export const insertTableRowRequest = (tableStartIndex, rowIndex, insertBelow = true) => {
  return {
    insertTableRow: {
      ...getTableCellLocaton(tableStartIndex, rowIndex),
      insertBelow
    }
  }
}

export const deleteParagraphBullets = (startIndex, segmentId, tabId) => {
  const range = Docs.newRange().setStartIndex(startIndex).setEndIndex(startIndex);
  if (segmentId) {
    range.setSegmentId(segmentId);
  }
  if (tabId) {
    range.setTabId(tabId);
  }
  return {
    deleteParagraphBullets: Docs.newDeleteParagraphBulletsRequest().setRange(range)
  }
}


export const createParagraphBullets = (startIndex, bulletPreset = "NUMBERED_DECIMAL_ALPHA_ROMAN", segmentId, tabId) => {
  const range = Docs.newRange().setStartIndex(startIndex).setEndIndex(startIndex);
  if (segmentId) {
    range.setSegmentId(segmentId);
  }
  if (tabId) {
    range.setTabId(tabId);
  }
  return {
    createParagraphBullets: Docs.newCreateParagraphBulletsRequest()
      .setRange(range)
      .setBulletPreset(bulletPreset)
  }
}

export const deleteTableRowRequest = (tableStartIndex, rowIndex, segmentId, tabId) => {
  return { deleteTableRow: getTableCellLocaton(tableStartIndex, rowIndex, 0, segmentId, tabId) }
}

export const getTableCellLocaton = (tableStartIndex, rowIndex, columnIndex = 0, segmentId, tabId) => {
  const location = Docs.newLocation().setIndex(tableStartIndex);
  if (segmentId) {
    location.setSegmentId(segmentId);
  }
  if (tabId) {
    location.setTabId(tabId);
  }
  return {
    tableCellLocation: Docs.newTableCellLocation()
      .setTableStartLocation(location)
      .setRowIndex(rowIndex)
      .setColumnIndex(columnIndex)
  }
}

export const deleteContentRange = (startIndex, endIndex, segmentId, tabId) => {
  const range = Docs.newRange().setStartIndex(startIndex).setEndIndex(endIndex);
  if (segmentId) {
    range.setSegmentId(segmentId);
  }
  if (tabId) {
    range.setTabId(tabId);
  }
  return {
    deleteContentRange: Docs.newDeleteContentRangeRequest().setRange(range)
  }
}

export const insertText = (index, text, segmentId, tabId) => {
  const location = Docs.newLocation().setIndex(index);
  if (segmentId) {
    location.setSegmentId(segmentId);
  }
  if (tabId) {
    location.setTabId(tabId);
  }
  return {
    insertText: Docs.newInsertTextRequest()
      .setLocation(location)
      // When inserting into a cell, we are replacing content. The paragraph's
      // structural newline should already exist. We just insert the text.
      .setText(text)
  }
}


/**
 * Updates a table's content, iterating in reverse to handle index shifts.
 * * @param {string} docId The ID of the Google Doc.
 * @param {number} tableStartIndex The start index of the table.
 * @param {Array<Array<string>>} newTableData A 2D array of strings with the new data.
 */
export const reverseUpdateContent = (content, tableStartIndex, newTableData, segmentId, tabId) => {
  // 1. find the current table
  const tableElement = content.find(e => e.startIndex === tableStartIndex);
  if (!tableElement) {
    // This can happen if the tableStartIndex is calculated incorrectly.
    throw new Error(`Could not find any element at startIndex ${tableStartIndex}. This is likely an internal error.`);
  }
  const table = tableElement.table;
  if (!table) {
    throw new Error(`Element at startIndex ${tableStartIndex} is not a table. Found type: ${Object.keys(tableElement).join(', ')}`);
  }

  // batch up the requests
  const requests = [];

  // 2. Iterate through rows and cells in reverse order.
  for (let rowIndex = table.tableRows.length - 1; rowIndex >= 0; rowIndex--) {
    const row = table.tableRows[rowIndex];

    for (let cellIndex = row.tableCells.length - 1; cellIndex >= 0; cellIndex--) {
      const cell = row.tableCells[cellIndex];

      // A cell's content is a paragraph. We want to replace the text within it.
      const paragraph = cell.content[0];
      const oldTextStartIndex = paragraph.startIndex;
      const oldTextEndIndex = paragraph.endIndex;

      // Get the new data for the cell.
      const newText = newTableData[rowIndex][cellIndex];

      // 3. Create the delete and insert requests.
      // The range to delete is from the start of the paragraph up to, but not including,
      // the structural newline at the end.
      if (oldTextEndIndex - 1 > oldTextStartIndex) {
        requests.push(deleteContentRange(oldTextStartIndex, oldTextEndIndex - 1, segmentId, tabId));
      }
      // this is only required if the nextText has any length
      if (newText.length > 0){
        requests.push(insertText(oldTextStartIndex, newText, segmentId, tabId));
      }

    }
  }
  return requests
}