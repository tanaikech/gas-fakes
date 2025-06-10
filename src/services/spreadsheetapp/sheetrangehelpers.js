import { Utils } from '../../support/utils.js'
const { getPlucker, is } = Utils

/**
 * see if the result matches the range size - if it doesnt it's a jagged array - some api methods return that
 * @param {object} p
 * @param {FakeSheetRange} p.range the range to check against 
 * @param {*[][]} p.cleaned the 2 dim array to check of dimensions match range 
 * @returns  {boolean}
 */
const isJagged = ({ range, cleaned }) => {
  const nr = range.getNumRows()
  const nc = range.getNumColumns()
  // a jagged doesnt have an array of arrays that matches the range size
  return cleaned.length !== nr || cleaned.some(row => row.length !== nc)
}

/**
 * if the result is jagged/wrongly dimensioned, we need to fill in the blanks with the default values from a template
 * @param {object} p
 * @param {*[][]} p.template 2 dim array of the correct dimensions
 * @param {*[][]} p.cleaned the 2 dim array with actual values in it
 * @returns  {boolean}
 */
const fixJagged = ({ template, cleaned }) => {
  return template.map((row, i) => {
    // use the template values if we've run out of data 
    if (i >= cleaned.length) return row

    // use the template if we're out of cols
    return row.map((col, j) => j < cleaned[i].length ? cleaned[i][j] : col)

  })
}

/**
 * make a template full of default values
 * @param {object} p
 * @param {FakeSheetRange} p.range the ramge we are targetting
 * @param {*} p.defaultValue the default value for the api results
 * @param {function} p.cleaner the cleaner function that decorates the default value - same as the one used to clean api results
 * @returns  {*[][]}
 */
const makeTemplate = ({ range, defaultValue, cleaner = (f) => f }) =>
  Array.from({ length: range.getNumRows() })
    .fill(Array.from({ length: range.getNumColumns() })
      .fill(defaultValue).map(cleaner))


// insert a method to get the required attributes, bith single and array version
// many methods can be genereated automatically
export const attrGens = (self, target) => {

  // shared function to get attributes that use spreadsheets.get
  const getRowDataAttribs = ({ range = self, props, defaultValue, cleaner }) => {

    // get the collection of rows with data for the required properties
    const { sheets } = Sheets.Spreadsheets.get(self.__getSpreadsheetId(), {
      ranges: [self.__getRangeWithSheet(range)],
      fields: `sheets.data.rowData.values${props}`
    })

    const { rowData } = sheets[0]?.data[0]

    // sometimes we get a jagged array that needs to be padded to the right length with default values
    // if we got nothing, return the template of defaults
    if (!rowData) return makeTemplate({ range, defaultValue, cleaner })


    // pluck each cell
    // extract the required props to an array
    const plucker = getPlucker(props, defaultValue)

    // clean what we did get
    const cleaned = rowData.map(row => row.values.map(col => cleaner(plucker(col), range)))

    // if it's not jagged, we dont need to fill any missing values
    if (!isJagged({ cleaned, range })) return cleaned

    // fill in missing values from template shaped results
    const template = makeTemplate({ range, defaultValue, cleaner })
    return fixJagged({ template, cleaned })

  }



  // default is just copy api result with no cleaning
  const cleaner = target.cleaner || (f => f)

  // curry a getter
  const getters = (range) => getRowDataAttribs({
    cleaner,
    range,
    defaultValue: target.defaultValue,
    props: target.props,
    reducer: target.reducer
  })



  // both a single and collection version
  // also some queries return a consolidated/reduced version
  if (!target.skipPlural) {

    const plural = target.plural || (target.name + 's')

    self[plural] = () => {
      // get all the values in the range
      const values = getters(self)
      // some gets would like a single result
      const reduced = target.reducer ? target.reducer(values.flat()) : values
      // some allow a null response for example
      return target.finalizer ? target.finalizer(reduced) : reduced
    }

  }

  if (!target.skipSingle) {
    self[target.name] = () => {
      // just get the 1st value in the range
      const values = getters(self.__getTopLeft())
      // some gets would like a single result
      const reduced = target.reducer ? target.reducer(values.flat()) : (values && values[0] && values[0][0])
      // some allow a null response for example
      return target.finalizer ? target.finalizer(reduced) : reduced
    }
  }

  return self
}

export const valueGens = (self, target) => {

  const getData = ({ range, options }) => {
    const result = Sheets.Spreadsheets.Values.get(
      self.__getSpreadsheetId(),
      self.__getRangeWithSheet(range),
      options
    )
    return result.values || []
  }

  // make a template to handle jagged arrays

  // both a single and collection version
  const plural = target.plural || (target.name + 's')
  const getters = (range) => {
    const values = getData({ range, options: target.options })
    /// TODO check if we ever get a jagged array back for values as we sometimes do for formats 
    // - if we do, we'll need to populate with the template
    let v = !values.length ? makeTemplate({ range, defaultValue: target.defaultValue }) : values
    if (target.cleaner) v = v.map(target.cleaner)
    if (target.reducer) v = target.reducer(v)
    return v
  }

  // normally we need both plural and single version - but this allows skipping if required
  if (!target.skipPlural) self[plural] = () => getters(self)
  if (!target.skipSingle) {
    self[target.name] = () => {
      // just get a single cell
      const r = getters(self.__getTopLeft())
      const v = target.reducer ? r : r[0][0]
      return v
    }
  }

  return self
}

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


/**
 * for use with updateCells
 * @returns {object}
 */
const getRequestUc = (range, rows, fields) => {
  return {
    updateCells: {
      start: getStartUc(range),
      rows,
      fields
    }
  }
}

/**
* for use with updateCells
* @returns {object}
*/
const getStartUc = (range) => {
  const gridRange = makeGridRange(range)
  const start = {
    sheetId: gridRange.sheetId,
    rowIndex: gridRange.startRowIndex,
    columnIndex: gridRange.startColumnIndex
  }
  return start
}

export const updateCells = ({ range, rows, fields, spreadsheetId }) => {
  const request = getRequestUc(range, rows, fields)
  Sheets.Spreadsheets.batchUpdate({ requests: [request] }, spreadsheetId, { ss: true })
  return this
}

export const isRange = (a) => is.object(a) && !is.null(a) && is.function(a.toString) && a.toString() === "Range"

// Make a gridrange from a range
export const makeGridRange = (range) => {
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

