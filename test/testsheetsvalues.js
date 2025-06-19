
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { getSheetsPerformance } from '../src/support/sheetscache.js';
import {  maketss, trasher} from './testassist.js';

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsValues = (pack) => {

  const { unit, fixes } = pack || initTests()
  const toTrash = []

  unit.section("data manipulation", t=> {
    const {sheet} = maketss ('datamanip',toTrash, fixes)
    const startAt = sheet.getRange("a1:b4")
  
    // remove duplicates
    let prop = "removeDuplicates"
    const rdRange = startAt.offset(0,0)
    const rdValues = [['foo','bar'],['bar','foo'],['foo','foo'],['bar','foo']]
    // expect after
    const xRdValues = rdValues.filter((row,i,a)=> !a.slice(0,i).find(f=>unit.deepEquals(f,row)))
    rdRange.setValues(rdValues)
    const xRdRange = rdRange.removeDuplicates()
    const rdAfter = xRdRange.getValues()
    t.deepEqual(rdAfter, xRdValues, prop)
    t.is (xRdRange.getA1Notation(), rdRange.offset(0,0,xRdValues.length,xRdValues[0].length).getA1Notation(),prop)

    // now try if removing nothing
    const rd1Range = startAt.offset(5,1,xRdValues.length,xRdValues[0].length)
    rd1Range.setValues(xRdValues)
    const xRd1Range = rd1Range.removeDuplicates()
    const rd1After = xRd1Range.getValues()
    t.deepEqual(rd1After, xRdValues, prop)
    t.is(xRd1Range.getA1Notation(), rd1Range.getA1Notation(),prop)

    // now lets have some comparison columns
    const rd2Range = startAt.offset(10,2)
    // should give same results as without any comparison columns
    const comparisonColumns = rdValues[0].map((_,i)=>i+1)
    rd2Range.setValues(rdValues)
    const xRd2Range = rd2Range.removeDuplicates(comparisonColumns)
    const rd2After = xRd2Range.getValues()
    t.deepEqual(rd2After, xRdValues, prop)
    t.is (xRd2Range.getA1Notation(), rd2Range.offset(0,0,xRdValues.length,xRdValues[0].length).getA1Notation(),prop)


    // now a real comparison column
    const rd3Range = startAt.offset(15,3)
    const comparisonColumns3 = [2]
    const xRd3Values = rdValues.filter((row,i,a)=> !a.slice(0,i).find(f=>comparisonColumns3.every(c=>unit.deepEquals(f[c-1],row[c-1]))))
    rd3Range.setValues(rdValues)
    const xRd3Range = rd3Range.removeDuplicates(comparisonColumns3)
    const rd3After = xRd3Range.getValues()
    t.deepEqual(rd3After, xRd3Values, prop)
    t.is (xRd3Range.getA1Notation(), rd3Range.offset(0,0,xRd3Values.length,xRd3Values[0].length).getA1Notation(),prop)

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })
  unit.section("spreadsheet values - both advanced and app", t => {

    // TODO - fails on gas if the fields are dates or numbers because gas automayically detects and converts types
    // whereas advanced sheets/node api does not
    // - see https://github.com/brucemcpherson/gas-fakes/issues/15

    const {sheet: fooSheet} = maketss ('foosheet',toTrash, fixes)
    const fooValues = Array.from({ length: 10 }, (_, i) => Array.from({ length: 6 }, (_, j) => i + j))
    const fooRange = fooSheet.getRange(1, 1, fooValues.length, fooValues[0].length).getA1Notation()
    const cs = fooSheet.getParent()

    t.true(fooSheet.getRange(fooRange).isBlank())
    t.true(fooSheet.getRange(fooRange).offset(1,1,1,1).isBlank())

    /**
     * Note:
     * the Google Sheets API doesn't guarantee that the data type will be strictly preserved 
     * but valueInputoption "RAW" has a better success rate then "USER_ENTERED"
     * need to use in conjunction with valueRenderOption: 'UNFORMATTED_VALUE' on the get
     * howver it's not clear yet  what behavior to expect from gas
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
    t.false (barRange.isBlank())
    t.false (barRange.offset(1,1,1,1).isBlank())
    t.false (barRange.offset(1,0).isBlank())

    const barValues = barRange.getValues()
    t.deepEqual(barSheet.getDataRange().getValues(), fooValues)

    t.deepEqual(fooSheet.getRange(fooRange).getValues(), barValues)
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })

  unit.section("creating and updating sheets", t => {

    // create ss with advanced service
    const bname = fixes.PREFIX + "b-sheet"
    const bs = Sheets.Spreadsheets.create({
      properties: {
        title: bname
      }
    })
    t.is(bs.properties.title, bname)

    // ceate a sheet with specific dimensions
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
      toTrash.push(DriveApp.getFileById(bs.spreadsheetId))
    }

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
  trasher(toTrash)

  return { unit, fixes }
}

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute" 
// for example node testdrive.js execute
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testSheetsValues()
