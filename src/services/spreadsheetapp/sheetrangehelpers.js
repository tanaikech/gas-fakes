import { Utils } from '../../support/utils.js'
const { is, hexToRgb } = Utils


export const getGridRange = (range) => {
  if (!isRange(range)) {
    throw new Error(`cant get gridrange - expected a range but got ${typeof range}`)
  }
  if (range.__hasGrid) return range.__apiGridRange

  // in this case we didn't get one, so we need to fake one
  const sheet = range.getSheet()
  return {
    sheetId: sheet.getSheetId(),
    startRowIndex: 0,
    startColumnIndex: 0,
    endRowIndex: sheet.getMaxRows(),
    endColumnIndex: sheet.getMaxColumns()
  }
}

export const updateCells = ({ range, rows, fields, spreadsheetId }) => {
  const ucr = Sheets.newUpdateCellsRequest()
    .setRange(makeSheetsGridRange(range))
    .setFields(fields)
    .setRows(rows)
  const bur = Sheets
    .newBatchUpdateSpreadsheetRequest()
    .setRequests([{ updateCells: ucr }])
  Sheets.Spreadsheets.__batchUpdate(bur, spreadsheetId, null, { ss: true })
  return range
}

export const isRange = (a) => is.object(a) && !is.null(a) && is.function(a.toString) && a.toString() === "Range"
export const isColor = (a) => is.object(a) && !is.null(a) && is.function(a.toString) && a.toString() === "Color"
export const isTextRotation = (a) => is.object(a) && !is.null(a) && is.function(a.getAngle) 

export const isThemeColor = (color) =>{
  if (!isColor(color)) {
    throw new Error `expected a color but got ${is(color)}`
  }
  const type = color.getColorType().toString()
  if (type === 'THEME') return true
  if (type === 'RGB') return false
  throw new Error (`Couldnt estabish color type ${type}`)
}
// Make a gridrange from a range
export const makeGridRange = (range) => {
  if (!isRange(range)) {
    console.log(range)
    throw new Error(`expected a range but got ${typeof range}`)
  }
  return {
    sheetId: range.getSheet().getSheetId(),
    startRowIndex: range.getRowIndex() - 1,
    startColumnIndex: range.getColumnIndex() - 1,
    endRowIndex: range.getRowIndex() + range.getNumRows() - 1,
    endColumnIndex: range.getColumnIndex() + range.getNumColumns() - 1
  }
}
export const makeSheetsGridRange = (range) => {
  const gr = Sheets.newGridRange()
  const mr = makeGridRange(range)
  return gr.setSheetId(mr.sheetId)
    .setStartRowIndex(mr.startRowIndex)
    .setStartColumnIndex(mr.startColumnIndex)
    .setEndRowIndex(mr.endRowIndex)
    .setEndColumnIndex(mr.endColumnIndex)
}

export const makeExtendedValue = (value) => {

  const ev = Sheets.newExtendedValue()
  if (is.string(value)) {
    if (value.substring(0, 1) === '=') return ev.setFormulaValue(value)
    return ev.setStringValue(value)
  } else if (is.boolean(value)) {
    return ev.setBoolValue(value)
  } else if (is.number(value)) {
    return ev.setNumberValue(value)
  } else if (!is.nullOrUndefined(value) && is.object(value) && Reflect.has(value, "type")) {
    /// TODO
    const errorValue = Sheets.newErrorValue().setType('REF').setMessage('Invalid cell reference!');
    extendedValue.setErrorValue(errorValue);
    //
    throw new Error("not implemented yet - setErrorValue")
  } else if (is.date(value)) {
    return ev.setNumberValue(dateToSerial(value))
    // TODO we could consider setting a numberformat to type data as well
  } else {
    throw new Error(`Invalid type ${is(value)}`)
  }
}

const dateToSerial = (date) => {
  if (!is.date(date)) {
    throw new Error(`dateToSerial is expecting a date but got ${is(date)}`)
  }
  // these are held in a serial number like in Excel, rather than JavaScript epoch
  // so the epoch is actually Dec 30 1899 rather than Jan 1 1970
  const epochCorrection = 2209161600000
  const msPerDay = 24 * 60 * 60 * 1000
  const adjustedMs = date.getTime() + epochCorrection
  return adjustedMs / msPerDay
}

export const batchUpdate = ({ spreadsheetId, requests }) => {
  const bur = Sheets.newBatchUpdateSpreadsheetRequest()
  bur.setRequests(requests)
  Sheets.Spreadsheets.__batchUpdate(bur, spreadsheetId, null, { ss: true })
}
export const fillRange = (range, value ) =>{
  return Array.from({ length: range.getNumRows() }).fill(Array.from({ length: range.getNumColumns() }).fill(value))
}

export const  arrMatchesRange = (range, arr, itemType, nullOkay = false) => {
  if (!is.array(arr)) return false
  if (arr.length !== range.getNumRows()) return false
  if (arr.some(r => !is.array(r))) return false
  if (arr.some(r => r.length !== range.getNumColumns())) return false
  if (itemType && !arr.flat().every(f => is[itemType](f) || (nullOkay && is.null(f)))) return false
  return true
}



