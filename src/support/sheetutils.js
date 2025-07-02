import is from '@sindresorhus/is';

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

  if (!is.positiveNumber(startRow) || startRow < 1 ||
    !is.positiveNumber(startColumn) || startColumn < 1) {
    throw new Error("Start row and column must be positive integers.");
  }
  // starts are 1 based - make A1
  const startCell = columnToLetter(startColumn) + startRow;

  if (endRow === startRow && endColumn === startColumn) {
    // Single cell range
    return startCell;
  } else if (is.positiveNumber(endRow) && endRow >= startRow &&
    is.positiveNumber(endColumn) && endColumn >= startColumn) {
    const endCell = columnToLetter(endColumn) + endRow;
    const r = `${startCell}:${endCell}`;

    return r
  } else {
    throw new Error(`Invalid end row or column numbers.${JSON.stringify({ startRow, startColumn, endRow, endColumn })}`);
  }
}

/**
 * Helper function to convert a column number to its corresponding letter (e.g., 1 -> A, 26 -> Z, 27 -> AA).
 *
 * @param {number} column The column number (1-based).
 * @returns {string} The column letter.
 */
const columnToLetter = (column) => {
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

  // Remove sheet name if present
  let cleanRange = range.includes('!') ? range.split('!')[1] : range;

  // todo handle error format
  if (!cleanRange) {
    throw new Error("Invalid range format " + range);
  }

  /// remove $ from $A$1 style
  cleanRange = cleanRange.replace(/\$/g, "")
  const parts = cleanRange.split(':');

  // Check for row-only range (e.g., "1:3" or "2")
  if (/^\d+$/.test(parts[0]) && (parts.length === 1 || (parts.length === 2 && /^\d+$/.test(parts[1])))) {
    const startRow = parseInt(parts[0], 10);
    const endRow = parts.length > 1 ? parseInt(parts[1], 10) : startRow;
    // Apps Script silently corrects inverted ranges
    return {
      startRowIndex: Math.min(startRow, endRow) - 1,
      endRowIndex: Math.max(startRow, endRow),
      // startColumnIndex and endColumnIndex are omitted for unbounded
    };
  }

  // Check for column-only range (e.g., "A:C" or "B")
  if (/^[A-Z]+$/i.test(parts[0]) && (parts.length === 1 || (parts.length === 2 && /^[A-Z]+$/i.test(parts[1])))) {
    const startColumn = letterToColumn(parts[0].toUpperCase());
    const endColumn = parts.length > 1 ? letterToColumn(parts[1].toUpperCase()) : startColumn;
    // Apps Script silently corrects inverted ranges
    return {
      startColumnIndex: Math.min(startColumn, endColumn) - 1,
      endColumnIndex: Math.max(startColumn, endColumn),
      // startRowIndex and endRowIndex are omitted for unbounded
    };
  }

  if (!parts.length || parts.length > 2) {
    throw new Error("Invalid range format " + range);
  }

  const [startCell, endCell] = parts;

  const startColMatch = startCell.match(/^[A-Z]+/i);
  const startRowMatch = startCell.match(/\d+$/);

  if (!startColMatch || !startRowMatch) {
    throw new Error("Invalid range format " + range);
  }

  const startColumn = letterToColumn(startColMatch[0].toUpperCase());
  const startRow = parseInt(startRowMatch[0], 10);
  if (!is.positiveNumber(startRow) || !is.positiveNumber(startColumn)) {
    throw new Error("Invalid range format " + range);
  }

  if (parts.length === 1) {
    // Single cell range (e.g., "A1")
    return {
      startRowIndex: startRow - 1,
      endRowIndex: startRow,
      startColumnIndex: startColumn - 1,
      endColumnIndex: startColumn
    }
  }

  const endColMatch = endCell.match(/^[A-Z]+/i);
  const endRowMatch = endCell.match(/\d+$/);

  if (!endColMatch || !endRowMatch) {
    throw new Error("Invalid range format " + range);
  }

  const endColumn = letterToColumn(endColMatch[0].toUpperCase());
  const endRow = parseInt(endRowMatch[0], 10);
  if (!is.positiveNumber(endRow) || !is.positiveNumber(endColumn)) {
    throw new Error("Invalid range format " + range);
  }

  // at this point the end and start values are indexed 1, so we need to index as 0
  // also endIndex works like slice - so .slice(3,5) selects 0 based columns 4,5  
  // say start = 5 and end = 9 : 1 based (5,6,7,8,9) 
  // startindex = 4 , endindex = 9 : 0 based (4,5,6,7,8)  
  // Apps Script silently corrects inverted ranges
  const r = {
    startRowIndex: Math.min(startRow, endRow) - 1,
    endRowIndex: Math.max(startRow, endRow),
    startColumnIndex: Math.min(startColumn, endColumn) - 1,
    endColumnIndex: Math.max(startColumn, endColumn)
  }

  return r



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
