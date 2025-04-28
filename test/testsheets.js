
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { getSheetsPerformance } from '../src/support/sheetscache.js';

const BLACK = '#000000'
const RED = '#ff0000'


const toHex = (c) => {
  if (!c) return '00';
  const val = Math.round(c * 255);
  const hex = val.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

const rgbToHex = ({ red: r, green: g, blue: b }) => {

  const red = toHex(r);
  const green = toHex(g);
  const blue = toHex(b);
  return `#${red}${green}${blue}`;
}
const getRandomRgb = () => ({ red: Math.random(), green: Math.random(), blue: Math.random() })
const getRandomHex = () => rgbToHex(getRandomRgb())
const getStuff = (range) => Array.from({ length: range.getNumRows() }, _ => Array.from({ length: range.getNumColumns() }, () => Utilities.getUuid()))

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheets = (pack) => {
  const { unit, fixes } = pack || initTests()
  const toTrash = []


  unit.section("range borders", t => {

    const aname = fixes.PREFIX + "border-sheet"
    const ss = SpreadsheetApp.create(aname)
    const sheets = ss.getSheets()
    const [sheet] = sheets
    const range = sheet.getRange("c2:i4")

    // newly created sheet has all null borders
    t.is(range.getBorders().length, range.getNumRows())
    t.is(range.getBorders()[0].length, range.getNumColumns())
    t.is(range.getBorder(), null)
    t.is(range.getBorders().flat().every(is.null), true)

    // this sheet temporarily has some borders in it - once I have setborders working, I'll eliminate
    const sp = SpreadsheetApp.openById(fixes.TEST_BORDERS_ID)
    const sb = sp.getSheets()[0]
    const rb = sb.getRange("a6:b10")
    const b = rb.getBorders()
    t.is(b.length, rb.getNumRows())
    t.is(b[0].length, rb.getNumColumns())
    const points = ['getTop', 'getLeft', 'getBottom', 'getRight']
    points.forEach(f => {
      const ps = b.flat().map(g => g[f]())
      t.true(ps.every(g => g.getColor().asRgbColor().asHexString(), BLACK))
      t.true(ps.every(g => g.getBorderStyle().toString(), "SOLID"))
      t.is(rb.getBorder()[f]().getColor().asRgbColor().asHexString(), BLACK)
      t.is(rb.getBorder()[f]().getBorderStyle().toString(), "SOLID")
    })

    const rr = sb.getRange("a19:b21")
    const bb = rr.getBorders()
    t.is(bb.length, rr.getNumRows())
    t.is(bb[0].length, rr.getNumColumns())
    points.forEach(f => {
      const ps = bb.flat().map(g => g[f]())
      t.true(ps.every(g => g.getColor().asRgbColor().asHexString(), RED))
      t.true(ps.every(g => g.getBorderStyle().toString(), "SOLID_THICK"))
      t.is(rr.getBorder()[f]().getColor().asRgbColor().asHexString(), RED)
      t.is(rr.getBorder()[f]().getBorderStyle().toString(), "SOLID_THICK")
    })

    const rt = sb.getRange("a26:b28")
    const bt = rt.getBorders()
    t.is(bt.length, rt.getNumRows())
    t.is(bt[0].length, rt.getNumColumns())

    // the top of of the first row should be null
    // the bottom of the last row should be null
    // the left of the first column should be null
    // the right of last column should be null
    const topRow = bt[0]
    const bottomRow = bt[bt.length - 1]
    const leftCol = bt.map(f => f[0])
    const rightCol = bt.map(f => f[f.length - 1])
    t.true (topRow.every(f => f.getTop() === null))
    t.true (bottomRow.every(f => f.getBottom() === null))
    t.true (leftCol.every(f => f.getLeft() === null))
    t.true (rightCol.every(f=>f.getRight() === null ))


    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
    if (fixes.CLEAN) {
      toTrash.push(DriveApp.getFileById(ss.getId()))
    }

  })

  unit.section("user entered formats", t => {
    const aname = fixes.PREFIX + "ue-sheet"
    const ss = SpreadsheetApp.create(aname)
    const sheets = ss.getSheets()
    const [sheet] = sheets
    const range = sheet.getRange("c2:i4")
    const stuff = getStuff(range)
    range.setValues(stuff)
    t.deepEqual(range.getValues(), stuff)
    const nfs = range.getNumberFormats()
    const nf = range.getNumberFormat()
    t.is(nf, nfs[0][0])
    t.is(nfs.length, range.getNumRows())
    t.is(nfs[0].length, range.getNumColumns())
    // see issue https://github.com/brucemcpherson/gas-fakes/issues/27
    const dfv = "0.###############"
    t.true(nfs.flat().every(f => f === dfv))
    t.is(nf, dfv)


    const fws = range.getFontWeight()
    const fw = range.getFontWeights()
    t.is(fw.length, range.getNumRows())
    t.is(fw[0].length, range.getNumColumns())
    t.true(fw.flat().every(f => is.nonEmptyString(f)))
    t.is(fws, fw[0][0])
    t.is(fws, 'normal')

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
    if (fixes.CLEAN) {
      toTrash.push(DriveApp.getFileById(ss.getId()))
    }

  })

  unit.section("cell formatting options", t => {

    const aname = fixes.PREFIX + "a-sheet"
    const ss = SpreadsheetApp.create(aname)
    const sheets = ss.getSheets()
    const [sheet] = sheets
    const range = sheet.getRange("a1:b3")

    // backgrounds
    const backgrounds = range.getBackgrounds()
    const background = range.getBackground()
    t.true(is.nonEmptyString(background))
    t.true(is.array(backgrounds))

    t.is(backgrounds.length, range.getNumRows())
    t.is(backgrounds[0].length, range.getNumColumns())
    t.is(backgrounds[0][0], background)
    t.true(backgrounds.flat().every(f => is.nonEmptyString(f)))
    t.is(background.substring(0, 1), '#')
    t.is(background.length, 7)
    t.is(background, '#ffffff', 'newly created sheet will have white background')

    const color = getRandomHex()
    range.setBackground(color)
    t.is(range.getBackground(), color)
    t.true(range.getBackgrounds().flat().every(f => f === color))

    const colorRgb = getRandomRgb()
    const color255 = [Math.round(colorRgb.red * 255), Math.round(colorRgb.green * 255), Math.round(colorRgb.blue * 255)]
    range.setBackgroundRGB(...color255)
    t.is(range.getBackground(), rgbToHex(colorRgb))

    // some random colorsas
    const colors = Array.from({
      length: range.getNumRows()
    }, () => Array.from({ length: range.getNumColumns() }, () => getRandomHex()))

    const fontColors = Array.from({
      length: range.getNumRows()
    }, () => Array.from({ length: range.getNumColumns() }, () => getRandomHex()))


    range.setBackgrounds(colors)
    t.deepEqual(range.getBackgrounds(), colors)

    range.setFontColors(fontColors)
    // TODO getFontColors is deprec - how to equivalent

    range.setFontColor(getRandomHex())

    // now with rangelists
    const range2 = range.offset(3, 3, 2, 2)
    const rangeList = range.getSheet().getRangeList([range, range2].map(r => r.getA1Notation()))
    rangeList.setBackground(color)
    rangeList.getRanges().forEach(range => t.true(range.getBackgrounds().flat().every(f => f === color)))
    rangeList.getRanges().forEach(range => {
      range.setBackgroundRGB(...color255)
      t.is(range.getBackground(), rgbToHex(colorRgb))
    })

    // now alignments
    const verticalAlignments = range.getVerticalAlignments()
    const verticalAlignment = range.getVerticalAlignment()
    t.is(verticalAlignments.length, range.getNumRows())
    t.is(verticalAlignments[0].length, range.getNumColumns())
    t.true(verticalAlignments.flat().every(f => is.nonEmptyString(f)))
    t.is(verticalAlignments[0][0], verticalAlignment)
    // sometimes this is upper sometimes lower - havent figured out rule yet
    t.is(verticalAlignment.toUpperCase(), 'BOTTOM', 'newly created sheet will have bottom')

    const horizontalAlignments = range.getHorizontalAlignments()
    const horizontalAlignment = range.getHorizontalAlignment()
    t.is(horizontalAlignments.length, range.getNumRows())
    t.is(horizontalAlignments[0].length, range.getNumColumns())
    t.true(horizontalAlignments.flat().every(f => is.nonEmptyString(f)))
    t.is(horizontalAlignments[0][0], horizontalAlignment)
    t.is(horizontalAlignment, 'general', 'newly created sheet will have general')

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
    if (fixes.CLEAN) {
      toTrash.push(DriveApp.getFileById(ss.getId()))
    }

  })

  unit.section("color objects and builders", t => {

    const builder = SpreadsheetApp.newColor()
    t.is(builder.toString(), "ColorBuilder")
    t.is(t.threw(() => builder.asThemeColor()).message, "Object is not of type ThemeColor.")
    t.is(t.threw(() => builder.asRgbColor()).message, "Object is not of type RgbColor.")
    t.is(builder.getColorType().toString(), "UNSUPPORTED")
    const rgbColor = getRandomHex()

    builder.setRgbColor(rgbColor)
    t.is(t.threw(() => builder.asThemeColor()).message, "Object is not of type ThemeColor.")
    t.is(builder.getColorType().toString(), "RGB")
    t.is(builder.asRgbColor().toString(), "RgbColor")
    t.is(builder.asRgbColor().asHexString(), rgbColor)
    t.is(builder.asRgbColor().getRed(), parseInt(rgbColor.substring(1, 3), 16))

    const builtRgb = builder.build()
    t.is(builtRgb.toString(), "Color")
    t.is(builtRgb.getColorType().toString(), "RGB")
    t.is(builtRgb.asRgbColor().toString(), "RgbColor")
    t.is(builtRgb.asRgbColor().getGreen(), parseInt(rgbColor.substring(3, 5), 16))
    t.is(builtRgb.asRgbColor().getBlue(), parseInt(rgbColor.substring(5, 7), 16))
    t.is(builtRgb.asRgbColor().getRed(), parseInt(rgbColor.substring(1, 3), 16))
    t.is(t.threw(() => builtRgb.asThemeColor()).message, "Object is not of type ThemeColor.")

    const themeBuilder = SpreadsheetApp.newColor()
    themeBuilder.setThemeColor(SpreadsheetApp.ThemeColorType.ACCENT1)
    t.is(themeBuilder.getColorType().toString(), "THEME")
    t.is(themeBuilder.asThemeColor().getColorType().toString(), "THEME")
    t.is(themeBuilder.asThemeColor().getThemeColorType().toString(), "ACCENT1")
    t.is(t.threw(() => themeBuilder.asRgbColor()).message, "Object is not of type RgbColor.")

    const builtTheme = themeBuilder.build()
    t.is(builtTheme.toString(), "Color")
    t.is(builtTheme.getColorType().toString(), "THEME")
    t.is(builtTheme.asThemeColor().getColorType().toString(), "THEME")
    t.is(t.threw(() => builtTheme.asRgbColor()).message, "Object is not of type RgbColor.")

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })

  unit.section("setting and getting color objects}", t => {
    const aname = fixes.PREFIX + "ob-sheet"
    const ss = SpreadsheetApp.create(aname)
    const sheets = ss.getSheets()
    const [sheet] = sheets
    const range = sheet.getRange("c6:i12")

    // so we can see the colors better if necessary add some random values
    const stuff = getStuff(range)
    range.setValues(stuff)
    t.deepEqual(range.getValues(), stuff)

    const cts = [
      "TEXT",
      "BACKGROUND",
      "ACCENT1",
      "ACCENT2",
      "ACCENT3",
      "ACCENT4",
      "ACCENT5",
      "ACCENT6",
      "LINK"
    ]

    const colorObjects = Array.from({
      length: range.getNumRows()
    },
      _ => Array.from({
        length: range.getNumColumns()
      }, (_, i) => SpreadsheetApp.newColor().setThemeColor(SpreadsheetApp.ThemeColorType[cts[i % cts.length]]).build()))

    t.true(colorObjects.flat().every(f => f.asThemeColor().getColorType().toString() === "THEME"))
    t.true(colorObjects.flat().every(f => f.getColorType().toString() === "THEME"))

    range.setBackgroundObjects(colorObjects)

    // color objects can be rgb too
    const rgbObjects = Array.from({
      length: range.getNumRows()
    },
      _ => Array.from({
        length: range.getNumColumns()
      }, (_, i) => SpreadsheetApp.newColor().setRgbColor(getRandomHex()).build()))

    const rgbRange = range.offset(range.getNumRows() + 1, 0)
    rgbRange.setBackgroundObjects(rgbObjects)

    // and they can be mixed
    const mixedRange = rgbRange.offset(rgbRange.getNumRows() + 1, 0)
    const half = Math.floor(mixedRange.getNumRows() / 2)
    const mixed = colorObjects.slice(0, half).concat(rgbObjects.slice(0, mixedRange.getNumRows() - half))
    mixedRange.setBackgroundObjects(mixed)

    const singleColor = getRandomHex()
    const singleColorObj = SpreadsheetApp.newColor().setRgbColor(singleColor).build()
    const singleRange = mixedRange.offset(mixedRange.getNumRows() + 1, 0)
    singleRange.setBackgroundObject(singleColorObj)
    const back1 = singleRange.getBackgrounds()
    t.true(back1.flat().every(f => f === singleColor))

    const singleRgbRange = singleRange.offset(singleRange.getNumRows() + 1, 0)
    const singleColorRgbObj = SpreadsheetApp.newColor().setRgbColor(singleColor).build()
    singleRgbRange.setBackgroundObject(singleColorRgbObj)
    const back2 = singleRgbRange.getBackgrounds()
    t.true(back2.flat().every(f => f === singleColor))

    t.deepEqual(back1, back2)

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
    if (fixes.CLEAN) {
      toTrash.push(DriveApp.getFileById(ss.getId()))
    }

  })




  unit.section("basic adv sheets cell formatting fetch fix", t => {
    // this section will work with the testsheet where we have some horizonatl alignment (as opposed to the default which returns nothing)
    const spreadsheetId = fixes.TEST_SHEET_ID
    const ss = Sheets.Spreadsheets.get(spreadsheetId)
    const sheets = ss.sheets
    const sheet = sheets[0]
    const range = `'${sheet.properties.title}'!a1:b3`
    const props = 'effectiveFormat.horizontalAlignment'

    const x = Sheets.Spreadsheets.get(spreadsheetId, {
      ranges: [range],
      fields: `sheets.data.rowData.values.${props}`,
    })
    const { rowData } = x.sheets[0].data[0]

    t.is(rowData.length, 3)
    t.is(rowData[0].values.length, 2)
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())

  })

  unit.section("creating and updating sheets", t => {

    const aname = fixes.PREFIX + "a-sheet"
    const ss = SpreadsheetApp.create(aname)
    t.is(ss.getName(), aname)

    const bname = fixes.PREFIX + "b-sheet"
    const bs = Sheets.Spreadsheets.create({
      properties: {
        title: bname
      }
    })
    t.is(bs.properties.title, bname)

    const cname = fixes.PREFIX + "c-sheet"
    const prows = 25
    const pcols = 10
    const cs = SpreadsheetApp.create(cname, prows, pcols)
    t.is(cs.getName(), cname)
    t.is(cs.getNumSheets(), 1)
    t.is(cs.getSheets()[0].getMaxRows(), prows)
    t.is(cs.getSheets()[0].getMaxColumns(), pcols)

    // insert some sheets and test that index is properly updated
    // the sheets get reordered and the sheetIndex gets updated
    const s1 = cs.insertSheet('s1') // sheet1,s1
    const s2 = cs.insertSheet('s2') // sheet1,s1,s2
    const s3 = cs.insertSheet('s3', 1) // sheet1,s3,s1,s2
    const s4 = cs.insertSheet('s4', 0) // s4,sheet1,s3,s1,s2
    const act = cs.getSheets().map(f => [f.getName(), f.getIndex()])
    const exs = [[s4.getName(), 1], ['Sheet1', 2], [s3.getName(), 3], [s1.getName(), 4], [s2.getName(), 5]]
    t.deepEqual(act, exs)


    t.is(cs.getSheetByName('s1').getIndex(), cs.getSheetById(s1.getSheetId()).getIndex())
    cs.getSheets().forEach((f, i) => t.is(f.getIndex(), i + 1))


    const sheet = cs.getSheets()[1]
    const col = 2
    const row = 3
    const cw = sheet.getColumnWidth(2)
    const rh = sheet.getRowHeight(3)
    const cx = 200
    const rx = 31

    let requests = [{
      updateDimensionProperties: {
        range: {
          sheetId: sheet.getSheetId(),
          dimension: 'ROWS',
          startIndex: row - 1,
          endIndex: row,
        },
        properties: {
          pixelSize: rx,
        },
        fields: 'pixelSize',
      }
    }, {
      updateDimensionProperties: {
        range: {
          sheetId: sheet.getSheetId(),
          dimension: 'COLUMNS',
          startIndex: col - 1,
          endIndex: col,
        },
        properties: {
          pixelSize: cx,
        },
        fields: 'pixelSize',
      }
    }]
    t.true(is.nonEmptyObject(Sheets.Spreadsheets.batchUpdate({ requests }, cs.getId())))
    t.is(sheet.getColumnWidth(col), cx)
    t.is(sheet.getRowHeight(row), rx)

    // reset
    requests[1].updateDimensionProperties.properties.pixelSize = cw
    requests[0].updateDimensionProperties.properties.pixelSize = rh
    const reset = Sheets.Spreadsheets.batchUpdate({ requests }, cs.getId())
    t.is(reset.spreadsheetId, cs.getId())
    t.is(reset.replies.length, requests.length)
    t.true(reset.replies.every(f => is.emptyObject(f)))
    t.is(sheet.getColumnWidth(col), cw)
    t.is(sheet.getRowHeight(row), rh)

    // lets try that with spreadsheet app
    sheet.setColumnWidth(col, cx).setRowHeight(row, rx)
    t.is(sheet.getColumnWidth(col), cx)
    t.is(sheet.getRowHeight(row), rx)

    const ncols = 3
    const nrows = 4

    // now try with a few columns/rows
    sheet.setColumnWidths(col, ncols, cx).setRowHeights(row, nrows, rx)

    for (let r = row; r < nrows + row; r++) {
      t.is(sheet.getRowHeight(r), rx)
    }
    for (let c = col; c < ncols + col; c++) {
      t.is(sheet.getColumnWidth(c), cx)
    }

    t.is(sheet.getColumnWidth(col), cx)
    t.is(sheet.getRowHeight(row), rx)

    // reset everything
    sheet.setColumnWidths(col, ncols, cw).setRowHeights(row, nrows, rh)
    t.is(sheet.getColumnWidth(col), cw)
    t.is(sheet.getRowHeight(row), rh)

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())


    if (fixes.CLEAN) {
      toTrash.push(DriveApp.getFileById(cs.getId()))
      toTrash.push(DriveApp.getFileById(ss.getId()))
      toTrash.push(DriveApp.getFileById(bs.spreadsheetId))
    }

  })


  unit.section("spreadsheet values", t => {

    // TODO - fails on gas if the fields are dates or numbers because gas automayically detects and converts types
    // whereas advanced sheets/node api does not
    // - see https://github.com/brucemcpherson/gas-fakes/issues/15

    // lets make some test data
    const fooName = fixes.PREFIX + "foo"

    const cs = SpreadsheetApp.create(fooName)
    if (fixes.CLEAN) toTrash.push(DriveApp.getFileById(cs.getId()))
    const fooSheet = cs.insertSheet('foosheet')
    const fooValues = Array.from({ length: 10 }, (_, i) => Array.from({ length: 6 }, (_, j) => i + j))
    const fooRange = fooSheet.getRange(1, 1, fooValues.length, fooValues[0].length).getA1Notation()
    /**
     * Note:
     * the Google Sheets API doesn't guarantee that the data type will be strictly preserved 
     * but valueInputoption "RAW" has a better success rate then "USER_ENTERED"
     * need to use in conjunction with valueRenderOption: 'UNFORMATTED_VALUE' on the get
     * howver it's not clear what behavior to expect from gas
     */
    const fooRequest = {
      valueInputOption: "RAW",
      data: [{
        majorDimension: "ROWS",
        range: `'${fooSheet.getName()}'!${fooRange}`,
        values: fooValues,
      }]
    }
    const foosh = Sheets.Spreadsheets.Values.batchUpdate(fooRequest, cs.getId())

    t.is(foosh.totalUpdatedCells, fooValues.length * fooValues[0].length)
    t.is(foosh.totalUpdatedRows, fooValues.length)
    t.is(foosh.totalUpdatedColumns, fooValues[0].length)
    t.is(foosh.totalUpdatedSheets, 1)

    const barSheet = cs.insertSheet('barsheet')
    const barRange = barSheet.getRange(1, 1, fooValues.length, fooValues[0].length)
    barRange.setValues(fooValues)

    const barValues = barRange.getValues()
    t.deepEqual(barSheet.getDataRange().getValues(), fooValues)

    t.deepEqual(fooSheet.getRange(fooRange).getValues(), barValues)
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })






  unit.section("spreadsheet ranges", t => {
    // careful with confusion of combining 0 (offset,array indices) and 1 start (range methods)
    const ss = SpreadsheetApp.openById(fixes.TEST_SHEET_ID)
    const sheet = ss.getSheets()[1]
    const range = sheet.getRange("c2:$d$4")
    t.false(sheet.isSheetHidden())
    t.is(range.toString(), "Range")
    t.is(range.getGridId(), sheet.getSheetId())
    t.is(range.getA1Notation(), "C2:D4")
    t.is(range.getRow(), 2)
    t.is(range.getColumn(), 3)
    t.is(range.getLastRow(), 4)
    t.is(range.getLastColumn(), 4)
    t.is(range.getCell(1, 1).getA1Notation(), range.offset(0, 0, 1, 1).getA1Notation())
    t.is(range.getCell(2, 2).getColumn(), range.getColumn() + 1)
    t.is(range.getCell(2, 2).getRow(), range.getRow() + 1)
    t.is(range.getWidth(), range.getNumColumns())
    t.is(range.getHeight(), range.getNumRows())
    t.is(range.getNumColumns(), range.getLastColumn() - range.getColumn() + 1)
    t.is(range.getNumRows(), range.getLastRow() - range.getRow() + 1)


    const { values } = Sheets.Spreadsheets.Values.get(sheet.getParent().getId(), sheet.getName())
    const target = values.slice(range.getRow() - 1, range.getLastRow()).map(row => row.slice(range.getColumn() - 1, range.getLastColumn()))
    t.true(is.array(target))
    t.is(target.length, range.getNumRows())
    t.is(target[0].length, range.getNumColumns())
    const tr = `${sheet.getName()}!${range.getA1Notation()}`
    const { values: atv, range: atr } = Sheets.Spreadsheets.Values.get(fixes.TEST_SHEET_ID, tr)
    t.is(atv.length, target.length)
    t.is(atv[0].length, target[0].length)
    t.is(atr, tr)


    const rv = range.getValues()
    const dr = sheet.getDataRange()
    t.is(dr.offset(0, 0).getA1Notation(), dr.getA1Notation())
    t.is(dr.offset(0, 0, 1, 1).getA1Notation(), "A1")
    t.is(dr.offset(1, 1, 1, 1).getA1Notation(), "B2")
    t.is(dr.offset(2, 1).getColumn(), 2)
    t.is(dr.offset(3, 5).getRow(), 4)
    t.is(dr.offset(0, 1).getLastColumn(), dr.getLastColumn() + 1)
    t.is(dr.offset(1, 1).getNumRows(), dr.getNumRows())
    t.is(dr.offset(1, 1).getNumColumns(), dr.getNumColumns())
    t.is(dr.offset(1, 1, 2, 2).getNumRows(), 2)
    t.is(dr.offset(1, 1, 2, 2).getNumColumns(), 2)
    t.is(dr.offset(1, 1, 3).getNumRows(), 3)
    t.is(dr.offset(1, 1, 3, 4).getNumColumns(), 4)

    t.is(range.getValue(), atv[0][0])
    t.is(range.getValue(), atv[0][0])
    t.is(range.offset(1, 1, 1, 1).getValue(), atv[1][1])
    t.is(range.offset(0, 2, 1, 1).getValue(), values[1][2])

    t.is(range.getDisplayValue(), atv[0][0].toString())

    // TODO check when we have some formulas in place
    t.true(is.string(range.getFormula()))
    t.true(range.getFormulas().every(r => r.map(f => is.string(f))))
    t.is(range.getFormulas().length, atv.length)
    t.is(range.getFormulas()[0].length, atv[0].length)

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })




  unit.section("spreadsheetapp rangelists", t => {
    const ss = SpreadsheetApp.openById(fixes.TEST_SHEET_ID)
    const sheet = ss.getSheets()[1]
    const rltests = ["a2:c3", "bb4:be12"]
    const rl = sheet.getRangeList(rltests)
    t.is(rl.getRanges().length, rltests.length)
    rl.getRanges().forEach((f, i) => t.is(f.getA1Notation(), rltests[i].toUpperCase()))
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })

  unit.section("spreadsheet exotics", t => {
    const ss = SpreadsheetApp.openById(fixes.TEST_SHEET_ID)
    const sheet = ss.getSheets()[0]

    t.is(sheet.getColumnWidth(2), ss.getColumnWidth(2))
    t.is(sheet.getRowHeight(1), ss.getRowHeight(1))
    t.true(sheet.getRowHeight(1) > 10)
    t.true(sheet.getColumnWidth(2) > 20)
    t.true(is.nonEmptyString(ss.getRecalculationInterval().toString()))

    const owner = ss.getOwner()
    t.is(owner.getEmail(), fixes.EMAIL)

    const viewers = ss.getViewers()
    t.truthy(viewers.length)
    viewers.forEach(f => t.true(is.nonEmptyString(f.getEmail())))

    const editors = ss.getEditors()
    t.truthy(editors.length)
    editors.forEach(f => t.true(is.nonEmptyString(f.getEmail())))


    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })




  unit.section("advanced & spreadsheetapp values and ranges", t => {
    t.is(Sheets.Spreadsheets.Values.toString(), Sheets.toString())
    const ss = Sheets.Spreadsheets.get(fixes.TEST_SHEET_ID)
    t.is(ss.spreadsheetId, fixes.TEST_SHEET_ID)
    const result = Sheets.Spreadsheets.Values.get(ss.spreadsheetId, ss.sheets[0].properties.title)
    const { range, majorDimension, values } = result
    t.true(is.nonEmptyString(range))
    t.is(majorDimension, 'ROWS')
    t.true(is.array(values))
    t.true(is.array(values[0]))
    t.true(values.length > 0)

    const sa = SpreadsheetApp.openById(fixes.TEST_SHEET_ID)
    const sr = sa.getRange("A1:B2")
    t.is(sr.getA1Notation(), "A1:B2")
    const st = sa.getRange(`${sa.getSheets()[0].getName()}!${sr.getA1Notation()}`)
    t.is(st.getA1Notation(), sr.getA1Notation())

    const sheet = sa.getSheetByName(ss.sheets[0].properties.title)
    const dr = sheet.getDataRange()
    const lr = sheet.getLastRow()
    const lc = sheet.getLastColumn()
    const ar = dr.getA1Notation()
    t.true(is.object(dr))
    t.true(is.nonEmptyString(ar))
    t.is(lr, values.length)
    t.is(lc, values[0].length)

    t.is(parseInt(ar.replace(/[^\d]+(\d+).*/, '$1'), 10), 1)
    t.is(parseInt(ar.replace(/.*:[^\d]+(\d+)/, '$1'), 10), lr)
    t.is(ar.replace(/([^\d]).*/, '$1'), 'A')
    t.is(sheet.getRange(1, 1, lr, lc).getA1Notation(), ar)
    const art = "C11:AB20"
    const tr = sheet.getRange(art)
    t.is(tr.getA1Notation(), art)
    t.is(tr.getRow(), 11)
    t.is(tr.getColumn(), 3)
    t.is(tr.getLastRow(), 20)
    t.is(tr.getLastColumn(), 28)
    t.is(tr.getRowIndex(), tr.getRow())
    t.is(tr.getColumnIndex(), tr.getColumn())
    t.is(tr.getNumRows(), tr.getLastRow() - tr.getRow() + 1)
    t.is(tr.getNumColumns(), tr.getLastColumn() - tr.getColumn() + 1)
    t.is(sheet.getRange(tr.getRow(), tr.getColumn(), tr.getNumRows(), tr.getNumColumns()).getA1Notation(), art)
    const aa = sheet.getRange("$aa$11")
    const aaex = "AA11"
    t.is(aa.getA1Notation(), aaex)
    t.is(aa.getRow(), 11)
    t.is(aa.getColumn(), 27)
    t.is(aa.getLastRow(), aa.getRow())
    t.is(aa.getLastColumn(), aa.getColumn())
    t.is(aa.getRowIndex(), aa.getRow())
    t.is(aa.getColumnIndex(), aa.getColumn())
    t.is(aa.getNumRows(), aa.getLastRow() - aa.getRow() + 1)
    t.is(aa.getNumColumns(), aa.getLastColumn() - aa.getColumn() + 1)
    t.is(sheet.getRange(aa.getRow(), aa.getColumn(), aa.getNumRows(), aa.getNumColumns()).getA1Notation(), aaex)
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })


  unit.section("advanced sheet basics", t => {
    t.true(is.nonEmptyString(Sheets.toString()))
    t.is(Sheets.getVersion(), 'v4')
    t.is(Drive.isFake, Sheets.isFake, {
      neverUndefined: false
    })
    t.is(Sheets.toString(), Sheets.Spreadsheets.toString())
    const ss = Sheets.Spreadsheets.get(fixes.TEST_SHEET_ID)
    t.is(ss.spreadsheetId, fixes.TEST_SHEET_ID)
    t.true(is.nonEmptyObject(ss.properties))
    t.is(ss.properties.title, fixes.TEST_SHEET_NAME)
    t.is(ss.properties.autoRecalc, "ON_CHANGE")
    t.true(is.nonEmptyObject(ss.properties.defaultFormat))
    t.true(is.nonEmptyObject(ss.properties.spreadsheetTheme))
    t.true(is.array(ss.sheets))
    t.truthy(ss.sheets.length)
    t.true(is.nonEmptyString(ss.spreadsheetUrl))
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })

  unit.section("spreadsheetapp basics", t => {
    const ass = Sheets.Spreadsheets.get(fixes.TEST_SHEET_ID)
    const ss = SpreadsheetApp.openById(fixes.TEST_SHEET_ID)
    t.is(ss.getId(), fixes.TEST_SHEET_ID)
    t.is(ss.getName(), fixes.TEST_SHEET_NAME)
    t.is(ss.getNumSheets(), ass.sheets.length)
    const sheets = ss.getSheets()
    t.is(sheets.length, ass.sheets.length)

    sheets.forEach((s, i) => {
      t.is(s.getName(), ass.sheets[i].properties.title)
      t.is(s.getSheetId(), ass.sheets[i].properties.sheetId)
      t.is(s.getIndex(), i + 1)
      t.true(is.number(s.getSheetId()))
      t.is(s.getName(), s.getSheetName())
      t.is(s.getMaxColumns(), ass.sheets[i].properties.gridProperties.columnCount)
      t.is(s.getMaxRows(), ass.sheets[i].properties.gridProperties.rowCount)
      t.is(s.getType().toString(), ass.sheets[i].properties.sheetType)
      t.is(ss.getSheetById(s.getSheetId()).getName(), s.getName())
      t.is(ss.getSheetByName(s.getName()).getSheetId(), s.getSheetId())

    })


    t.is(ss.getId(), ss.getKey())
    t.is(ss.getSheetId(), sheets[0].getSheetId())
    t.is(ss.getSheetName(), sheets[0].getName())

    const file = DriveApp.getFileById(ss.getId())
    t.is(file.getName(), ss.getName())
    t.is(file.getMimeType(), "application/vnd.google-apps.spreadsheet")
    t.is(file.getOwner().getEmail(), ss.getOwner().getEmail())
    t.is(file.getOwner().getEmail(), fixes.EMAIL)

    t.is(SpreadsheetApp.openByUrl(ss.getUrl()).getId(), ss.getId())
    t.is(SpreadsheetApp.openByKey(ss.getId()).getId(), ss.getId())
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())


  })


  if (!pack) {
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
    unit.report()
  }

  // clean up if necessary
  toTrash.forEach(f => f.setTrashed(true))

  return { unit, fixes }
}

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute" 
// for example node testdrive.js execute
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testSheets()
