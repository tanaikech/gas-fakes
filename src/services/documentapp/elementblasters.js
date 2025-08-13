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

export const deleteTableRowRequest = (tableStartIndex, rowIndex) => {
  return { deleteTableRow: getTableCellLocaton(tableStartIndex, rowIndex) }
}

export const getTableCellLocaton = (tableStartIndex, rowIndex, columnIndex = 0) => {
  return {
    tableCellLocation: Docs.newTableCellLocation()
      .setTableStartLocation(Docs.newLocation().setIndex(tableStartIndex))
      .setRowIndex(rowIndex)
      .setColumnIndex(columnIndex)
  }
}

export const deleteContentRange = (startIndex, endIndex) => {
  return {
    deleteContentRange: Docs.newDeleteContentRangeRequest().setRange(
      Docs.newRange().setStartIndex(startIndex).setEndIndex(endIndex)
    )
  }
}

export const insertText = (index, text) => {
  return {
    insertText: Docs.newInsertTextRequest()
      .setLocation(Docs.newLocation().setIndex(index))
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
export const reverseUpdateContent = (content, tableStartIndex, newTableData) => {

  // 1. find the current table
  const table = content.find(e => e.startIndex === tableStartIndex).table;

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
        requests.push(deleteContentRange(oldTextStartIndex, oldTextEndIndex - 1));
      }
      // this is only required if the nextText has any length
      if (newText.length > 0){
        requests.push(insertText(oldTextStartIndex, newText));
      }

    }
  }
  return requests
}