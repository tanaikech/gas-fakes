/**
 * Converts row and column numbers to a spreadsheet-style range (e.g., A1, B3:C5).
 *
 * @param {number} startRow The starting row number (1-based).
 * @param {number} startColumn The starting column number (1-based).
 * @param {number} [endRow] The ending row number (1-based). If not provided, it's a single cell.
 * @param {number} [endColumn] The ending column number (1-based). Required if endRow is provided.
 * @returns {string} The spreadsheet-style range.
 * @throws {Error} If input parameters are invalid.
 */
const toRange = (startRow, startColumn, endRow, endColumn) => {
  console.log(startRow, startColumn, endRow, endColumn)
  if (!Number.isInteger(startRow) || startRow < 1 ||
      !Number.isInteger(startColumn) || startColumn < 1) {
    throw new Error("Start row and column must be positive integers.");
  }

  const startCell = columnToLetter(startColumn) + startRow;

  if (endRow === undefined && endColumn === undefined) {
    return startCell;
  } else if (Number.isInteger(endRow) && endRow >= startRow &&
             Number.isInteger(endColumn) && endColumn >= startColumn) {
    const endCell = columnToLetter(endColumn) + endRow;
    return `${startCell}:${endCell}`;
  } else {
    throw new Error("Invalid end row or column numbers.");
  }
}

/**
 * Helper function to convert a column number to its corresponding letter (e.g., 1 -> A, 26 -> Z, 27 -> AA).
 *
 * @param {number} column The column number (1-based).
 * @returns {string} The column letter.
 */
const columnToLetter = (column) =>  {
  let temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}



/**
 * Extracts the number of rows and columns from a spreadsheet-style range string.
 *
 * @param {string} range The spreadsheet range string (e.g., "A1", "B3:C5", "Sheet1!A1:D10").
 * @returns {object|null} A partial gridrange object (0 based)
 * or null if the range format is invalid.
 */
const fromRange = (range) => {
  try {
    // Remove sheet name if present
    const cleanRange = range.includes('!') ? range.split('!')[1] : range;

    if (!cleanRange) {
      return null;
    }

    const parts = cleanRange.split(':');

    if (parts.length === 1) {
      // Single cell range (e.g., "A1")
      const colMatch = parts[0].match(/^[A-Z]+/i);
      const rowMatch = parts[0].match(/\d+$/);

      if (colMatch && rowMatch) {
        return { numRows: 1, numColumns: 1 };
      } else {
        return null; // Invalid single cell format
      }
    } else if (parts.length === 2) {
      // Range with start and end cells (e.g., "A1:C5")
      const startCell = parts[0];
      const endCell = parts[1];

      const startColMatch = startCell.match(/^[A-Z]+/i);
      const startRowMatch = startCell.match(/\d+$/);
      const endColMatch = endCell.match(/^[A-Z]+/i);
      const endRowMatch = endCell.match(/\d+$/);

      if (startColMatch && startRowMatch && endColMatch && endRowMatch) {
        const startColumn = letterToColumn(startColMatch[0].toUpperCase());
        const startRow = parseInt(startRowMatch[0], 10);
        const endColumn = letterToColumn(endColMatch[0].toUpperCase());
        const endRow = parseInt(endRowMatch[0], 10);

        if (isNaN(startRow) || isNaN(endRow) || startRow < 1 || endRow < startRow || startColumn < 1 || endColumn < startColumn) {
          return null; // Invalid row or column numbers
        }
        return {
          startRowIndex: startRow-1,
          endRowIndex: endColumn - startColumn + 1,
          startColumnIndex: startColumn -1,
          endColumnIndex: endColumn - startColumn + 1
        }

      } else {
        return null; // Invalid range format
      }
    } else {
      return null; // Invalid range format (more than one colon)
    }
  } catch (error) {
    console.error("Error parsing range:", error);
    return null;
  }
}

/**
 * Helper function to convert a column letter (e.g., A, Z, AA) to its corresponding number (e.g., 1, 26, 27).
 *
 * @param {string} letter The column letter (case-insensitive).
 * @returns {number} The column number (1-based).
 */
const letterToColumn = (letter) => {
  let column = 0;
  const normalizedLetter = letter.toUpperCase();
  for (let i = 0; i < normalizedLetter.length; i++) {
    column = column * 26 + (normalizedLetter.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return column;
}



export const SheetUtils = {
  toRange,
  fromRange
}
