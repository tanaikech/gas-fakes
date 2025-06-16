import { Utils } from '../../support/utils.js'
import {
  extractPattern,
  arrMatchesRange,
  isColor,
  isThemeColor,
  updateCells
} from "./sheetrangehelpers.js"
import { signatureArgs } from '../../support/helpers.js'
import { newFakeBorders } from '../commonclasses/fakeborders.js'
import { makeColorFromApi } from '../commonclasses/fakecolorbuilder.js'
import { newFakeWrapStrategy, isWrapped } from '../commonclasses/fakewrapstrategy.js'
import { newFakeTextRotation } from '../commonclasses/faketextrotation.js'
import { makeTextStyleFromApi } from '../commonclasses/faketextstylebuilder.js'
import { newFakeTextDirection } from '../commonclasses/faketextdirection.js'
import { makeDataValidationFromApi } from "./fakedatavalidationbuilder.js"


const { getPlucker, is, robToHex, WHITER, BLACKER } = Utils


// this is a list of all range format setters and how to generate them
export const setterList = [{
  name:'verticalAlignment',
  type: "string",
  nullAllowed: true,
  maker: (_, value) => makeCellData('setVerticalAlignment', value),
  fields: 'userEnteredFormat.verticalAlignment',
  typeChecker: (value) => {
    console.log ('checking', value)
    return is.null(value) || ['top', 'middle', 'bottom'].includes(value.toLowerCase())
  }
},{
  name:'horizontalAlignment',
  type: "string",
  nullAllowed: true,
  // apps script lists left,right,normal and null as possible, but right also works as well
  // also some peculiar nuances to handle if the value in the cell to be aligned is a string
  // The api accept left,right,normal + (start,end,justify which we'll ignore as gas doesnt)
  maker: (_, value) => {
    value = value.toUpperCase()
    // this will clear and set the alignment returned value to 'general'
    if (is.null(value) || value ==="NORMAL") return makeCellData('setHorizontalAlignment', null)
    return makeCellData('setHorizontalAlignment', value)
  },
  fields: 'userEnteredFormat.horizontalAlignment',
  // apps script lists left,right,normal and null as possible, but right also works as well
  typeChecker: (value) => is.null(value) || ['left', 'center', 'right',normal].includes(value.toLowerCase())
},{
  name: 'fontColorObject',
  type: "object",
  typeChecker: isColor,
  maker: (_, value) => makeColorStyle(value),
  fields: 'userEnteredFormat.textFormat.foregroundColorStyle.themeColor,userEnteredFormat.foregroundColorStyle.rgbColor'
}, {
  name: 'fontLine',
  type: "string",
  nullAllowed: true,
  maker: (_, value) => makeCellFontLineData(value),
  fields: 'userEnteredFormat.textFormat.strikethrough,userEnteredFormat.textFormat.underline'
}, {
  name: 'numberFormat',
  type: "string",
  nullAllowed: true,
  maker: (_, value) => makeNumberFormatData(value, "NUMBER"),
  fields: 'userEnteredFormat.numberFormat'
}, {
  name: 'fontWeight',
  type: "string",
  nullAllowed: true,
  maker: (apiSetter, weight) => makeCellTextFormatData(apiSetter, weight === 'bold'),
  fields: 'userEnteredFormat.textFormat.bold',
  apiSetter: 'setBold'
}, {
  name: 'fontStyle',
  type: "string",
  nullAllowed: true,
  maker: (apiSetter, style) => makeCellTextFormatData(apiSetter, style === 'italic'),
  fields: 'userEnteredFormat.textFormat.italic',
  apiSetter: 'setItalic'
}, {
  name: 'fontSize',
  type: "number",
  nullAllowed: true,
}, {
  name: 'fontFamily',
  plural: 'setFontFamilies',
  type: "string",
  nullAllowed: true,
}]

// this is a list of all the range format getters and how to generate them
export const attrGetList = [{
  name: 'getNumberFormat',
  props: '.userEnteredFormat.numberFormat',
  defaultValue: "0.###############",
  cleaner: extractPattern
}, {
  name: 'getVerticalAlignment',
  props: '.userEnteredFormat.verticalAlignment',
  defaultValue: "bottom"
}, {
  name: 'getHorizontalAlignment',
  props: '.userEnteredFormat.horizontalAlignment',
  defaultValue: "general"
}, {
  name: 'getBackground',
  props: '.userEnteredFormat.backgroundColor',
  defaultValue: WHITER,
  cleaner: robToHex
}, {
  name: 'getFontWeight',
  props: '.userEnteredFormat.textFormat.bold',
  defaultValue: false,
  cleaner: (f) => f ? 'bold' : 'normal'
}, {
  name: 'getFontStyle',
  props: '.userEnteredFormat.textFormat.italic',
  defaultValue: false,
  cleaner: (f) => f ? 'italic' : 'normal'
}, {
  name: 'getBorder',
  props: '.userEnteredFormat.borders',
  defaultValue: null,
  cleaner: (f => {
    return is.null(f) ? null : newFakeBorders(f)
  })
}, {
  name: 'getBackgroundObject',
  props: '.userEnteredFormat.backgroundColorStyle',
  defaultValue: { rgbColor: WHITER },
  cleaner: makeColorFromApi
}, {
  name: 'getFontColor',
  props: '.userEnteredFormat.textFormat.foregroundColor',
  defaultValue: BLACKER,
  cleaner: robToHex
}, {
  name: 'getFontColorObject',
  props: '.userEnteredFormat.textFormat.foregroundColorStyle',
  defaultValue: { rgbColor: BLACKER },
  cleaner: makeColorFromApi
}, {
  name: 'getFontFamily',
  props: '.userEnteredFormat.textFormat.fontFamily',
  defaultValue: 'Arial',
  plural: 'getFontFamilies'
}, {
  name: 'getFontSize',
  props: '.userEnteredFormat.textFormat.fontSize',
  defaultValue: 10
}, {
  name: 'getWrapStrategy',
  props: '.userEnteredFormat.wrapStrategy',
  defaultValue: 'OVERFLOW_CELL',
  cleaner: newFakeWrapStrategy,
  plural: 'getWrapStrategies'
}, {
  name: 'getWrap',
  props: '.userEnteredFormat.wrapStrategy',
  defaultValue: 'OVERFLOW_CELL',
  cleaner: f => isWrapped(newFakeWrapStrategy(f))
}, {
  name: 'getTextRotation',
  props: '.userEnteredFormat.textRotation',
  defaultValue: { angle: 0, vertical: "NONE" },
  cleaner: f => newFakeTextRotation(f || { angle: 0, vertical: "NONE" })
}, {
  name: 'getTextStyle',
  props: '.userEnteredFormat.textFormat',
  defaultValue: { foregroundColor: { rgbColor: BLACKER } },
  cleaner: makeTextStyleFromApi
}, {
  name: 'getFontLine',
  props: '.userEnteredFormat.textFormat',
  defaultValue: { strikeThrough: false, underline: false },
  cleaner: f => {
    const s = makeTextStyleFromApi(f)
    if (s.isStrikethrough()) return 'line-through'
    if (s.isUnderline()) return 'underline'
    return 'none'
  }
}, {
  name: 'isChecked',
  props: '(dataValidation,effectiveValue)',
  defaultValue: null,
  skipSingle: true,
  plural: 'isChecked',
  cleaner: (cell => {
    // its a checkbox?
    if (is.nonEmptyObject(cell) &&
      is.nonEmptyObject(cell.dataValidation) &&
      is.nonEmptyObject(cell.dataValidation.condition) &&
      cell.dataValidation.condition.type === "BOOLEAN"
    ) {
      return cell.effectiveValue.boolValue
    } else {
      return null
    }
  }),
  // Returns whether all cells in the range have their checkbox state as 'checked'. Returns null if some cells are checked and the rest unchecked, or if some cells do not have checkbox data validation.
  // so that means 
  // - true -> all checkboxes + all true
  // - false -> all checkboxes + all false
  // - null -> any other combination
  reducer: (cells => {
    const allBoxes = cells.every(cell => !is.null(cell))
    const allTrue = allBoxes && cells.every(cell => cell)
    const allFalse = allBoxes && !allTrue && !cells.some(cell => cell)
    return allTrue ? true : (allFalse ? false : null)

  })
}, {
  // TODO this one needs testing on a R-L language sheet
  name: 'getTextDirection',
  props: '.userEnteredFormat.textDirection',
  defaultValue: null,
  cleaner: (f) => is.null(f) ? null : new newFakeTextDirection(f)
}, {
  name: 'getNote',
  props: '.note',
  defaultValue: "",
}, {
  name: "getDataValidation",
  props: '.dataValidation',
  defaultValue: null,
  // there's an optional argument to cleaner, which is the range requesting
  // this will allow make from api to have access to spreadsheet requesting if it needs to make its own ranges
  cleaner: ((f, range) => {
    // TODO check what happens if some of the parts of the range have no validation?
    return is.null(f) ? null : makeDataValidationFromApi(f, range)
  })/*,
  finalizer: (a) => {
    // this is probably not required - delete when finsihed all this
    // this one allows a null to be returned of there's nothing
    // but it's not what happens in the case of getDataValidations
    return (is.array(a) && a.flat(Infinity).every(f => is.null(f))) ? null : a
  }
    */
}]

export const valuesGetList = [{
  name: 'getValue',
  options: { valueRenderOption: 'UNFORMATTED_VALUE' },
  defaultValue: ''
}, {
  name: 'getDisplayValue',
  options: { valueRenderOption: 'FORMATTED_VALUE' },
  defaultValue: ''
}, {
  name: 'getFormula',
  options: { valueRenderOption: 'FORMULA' },
  defaultValue: ''
}, {
  name: 'isBlank',
  options: { valueRenderOption: 'FORMATTED_VALUE' },
  defaultValue: '',
  reducer: (a) => a.flat().every(f => f === ''),
  skipSingle: true,
  plural: 'isBlank'
}, {
}]


export const setterMaker = ({ self, fields, maker, single, plural, type, nullAllowed, apiSetter, typeChecker }) => {

  self[single] = (...args) => {
    const { matchThrow, nargs } = signatureArgs(args, `Range.${single}`)
    if (nargs !== 1) matchThrow()
    const [value] = args
    if (type && !is(value) === type) matchThrow()
    if (typeChecker && !typeChecker(value)) matchThrow()
    return self.__repeatRequest(maker(apiSetter, value), fields)
  }

  self[plural] = (...args) => {
    const { matchThrow, nargs } = signatureArgs(args, `Range.${single}`)
    if (nargs !== 1) matchThrow()
    const [values] = args
    if (!arrMatchesRange(self, values, type, nullAllowed)) matchThrow()
    if (typeChecker && !values.flat().every(typeChecker)) matchThrow()
    const rows = values.map(row => {
      return Sheets.newRowData().setValues(row.map(value => maker(apiSetter, value)))
    })
    return  updateCells({ range: self, rows, fields, spreadsheetId: self.__getSpreadsheetId() })
  }
}

// insert a method to get the required attributes, bith single and array version
// many methods can be genereated automatically
export const attrGens = (self, target) => {

  const spreadsheetId = self.__getSpreadsheetId()

  // shared function to get attributes that use spreadsheets.get
  const getRowDataAttribs = ({ range = self, props, defaultValue, cleaner }) => {

    // get the collection of rows with data for the required properties
    const { sheets } = Sheets.Spreadsheets.get(spreadsheetId, {
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

    if (!target.skipSingle) {

      self[target.name] = () => {
        const tl = self.__getTopLeft()
        // just get the 1st value in the range
        const values = getters(tl)
        // some gets would like a single result
        const reduced = target.reducer ? target.reducer(values.flat()) : (values && values[0] && values[0][0])
        // some allow a null response for example
        return target.finalizer ? target.finalizer(reduced) : reduced
      }
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

const makeCellData = (method, value) => {
  const cellFormat = Sheets.newCellFormat()[method](value)
  const cellData = Sheets.newCellData().setUserEnteredFormat(cellFormat)
  return cellData
}

const makeColorStyle = (color) => {
  const colorStyle = Sheets.newColorStyle()
  const isTheme = isThemeColor(color)

  if (isTheme) {
    const s = color.asThemeColor().getThemeColorType().toString()
    // API doesnt use hyperlink
    colorStyle.setThemeColor(s === "HYPERLINK" ? "LINK" : s)

  } else {
    const r = color.asRgbColor()
    colorStyle.setRgbColor(hexToRgb(r.asHexString()))

  }
  const textFormat = Sheets.newTextFormat().setForegroundColorStyle(colorStyle)
  return makeCellData('setTextFormat', textFormat)

}

const makeCellTextFormatData = ( prop, value) => {
  const textFormat = Sheets.newTextFormat()
  // to unset you have to do is mention the field but don't set value on the prop
  if (!is.function (textFormat[prop])) {
    throw new Error (`tied to call ${prop} method on textFormat but it's not a function}`)
  }
  if (!is.null(value))textFormat[prop](value)
  return makeCellData ('setTextFormat', textFormat)
}

const makeCellFontLineData = ( value) => {
  const textFormat = Sheets.newTextFormat()
    .setStrikethrough(value === 'line-through')
    .setUnderline(value === 'underline')
  if (value !== 'none' && value !== 'line-through' && value !== 'underline' && !is.null(value)) {
    throw `invalid font line value ${value}`
  }
  return makeCellData ('setTextFormat', textFormat)
}


const makeNumberFormatData = (value, type ="NUMBER") => {
  const numberFormat = Sheets.newNumberFormat()
  if (!is.null (value)) {
    numberFormat.setPattern(value).setType(type)
  }
  return makeCellData ('setNumberFormat', numberFormat)
}