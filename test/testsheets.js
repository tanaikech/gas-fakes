
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests }  from  './testinit.js'

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheets = (pack) => {
  const {unit, fixes} = pack || initTests()

  unit.section ("spreadsheetapp range dive", t => {
    const ss = SpreadsheetApp.openById(fixes.TEST_SHEET_ID)
    const sheet = ss.getSheets()[0]
    const range = sheet.getRange ("a2:$b$4")
    t.is (range.toString(), "Range")
    t.is (range.getA1Notation(), "A2:B4")
    t.is(range.getRow(),2)
    t.is(range.getColumn(),1)
    t.is(range.getLastRow(),4)
    t.is(range.getLastColumn(),2)
    const {values} = Sheets.Spreadsheets.Values.get(sheet.getParent().getId(),sheet.getName())
    const target = values.slice (range.getRow()-1, range.getLastRow()).map(row=>row.slice(range.getColumn()-1,range.getLastColumn()))
    t.true(is.array(target))
    t.is (target.length, range.getNumRows())
    t.is (target[0].length, range.getNumColumns())
    const tr = `${sheet.getName()}!${range.getA1Notation()}`
    const {values:atv, range: atr}  = Sheets.Spreadsheets.Values.get(fixes.TEST_SHEET_ID, tr)
    t.is (atv.length, target.length)
    t.is (atv[0].length, target[0].length)
    t.is (atr, tr)
    t.deepEqual (atv, target)
    // TODO - this fails on gas if the fields are dates- see https://github.com/brucemcpherson/gas-fakes/issues/15
    const rv= range.getValues()
    t.deepEqual (rv, target)
 
    
  })

  unit.section("advanced & spreadsheetapp values and ranges", t => {
    t.is(Sheets.Spreadsheets.Values.toString(),Sheets.toString())
    const ss = Sheets.Spreadsheets.get(fixes.TEST_SHEET_ID)
    t.is(ss.spreadsheetId, fixes.TEST_SHEET_ID)
    const result = Sheets.Spreadsheets.Values.get(ss.spreadsheetId,ss.sheets[0].properties.title)
    const {range, majorDimension, values} = result
    t.true(is.nonEmptyString(range))
    t.is(majorDimension, 'ROWS')
    t.true(is.array(values))
    t.true(is.array(values[0]))
    t.true(values.length>0)

    const sa = SpreadsheetApp.openById(fixes.TEST_SHEET_ID)
    const sr= sa.getRange("A1:B2")
    t.is(sr.getA1Notation(),"A1:B2")
    const st= sa.getRange(`${sa.getSheets()[0].getName()}!${sr.getA1Notation()}`)
    t.is(st.getA1Notation(),sr.getA1Notation())
    
    const sheet = sa.getSheetByName(ss.sheets[0].properties.title)
    const dr = sheet.getDataRange()
    const lr = sheet.getLastRow()
    const lc = sheet.getLastColumn()
    const ar = dr.getA1Notation()
    t.true(is.object(dr))
    t.true(is.nonEmptyString(ar))
    t.is(lr,values.length)
    t.is(lc,values[0].length)

    t.is(parseInt(ar.replace (/[^\d]+(\d+).*/,'$1'),10),1)
    t.is(parseInt(ar.replace (/.*:[^\d]+(\d+)/,'$1'),10),lr)
    t.is(ar.replace (/([^\d]).*/,'$1'),'A')
    t.is(sheet.getRange(1,1,lr,lc ).getA1Notation(),ar)
    const art = "C11:AB20"
    const tr = sheet.getRange(art)
    t.is(tr.getA1Notation(),art)
    t.is(tr.getRow(),11)
    t.is(tr.getColumn(),3)
    t.is(tr.getLastRow(),20)
    t.is(tr.getLastColumn(),28)
    t.is(tr.getRowIndex(),tr.getRow())
    t.is(tr.getColumnIndex(),tr.getColumn())
    t.is(tr.getNumRows(),tr.getLastRow() - tr.getRow()+ 1)
    t.is(tr.getNumColumns(),tr.getLastColumn() - tr.getColumn()+ 1)
    t.is(sheet.getRange(tr.getRow(),tr.getColumn(),tr.getNumRows(),tr.getNumColumns()).getA1Notation(),art)
    const aa= sheet.getRange("$aa$11")
    const aaex = "AA11"
    t.is(aa.getA1Notation(),aaex)
    t.is(aa.getRow(),11)
    t.is(aa.getColumn(),27)
    t.is(aa.getLastRow(),aa.getRow())
    t.is(aa.getLastColumn(),aa.getColumn())
    t.is(aa.getRowIndex(),aa.getRow())
    t.is(aa.getColumnIndex(),aa.getColumn())
    t.is(aa.getNumRows(),aa.getLastRow()  - aa.getRow()+ 1)
    t.is(aa.getNumColumns(),aa.getLastColumn() - aa.getColumn() +1)
    t.is(sheet.getRange(aa.getRow(),aa.getColumn(),aa.getNumRows(),aa.getNumColumns()).getA1Notation(),aaex)
  
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

  })

  if (!pack) {
    unit.report()
  }
  return { unit, fixes }
}

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute" 
// for example node testdrive.js execute
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testSheets()
