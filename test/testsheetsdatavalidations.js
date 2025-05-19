
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { getSheetsPerformance } from '../src/support/sheetscache.js';
import { getPerformance } from '../src/support/filecache.js';
import { trasher } from './testassist.js';

import is from '@sindresorhus/is';

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsDataValidations = (pack) => {

  const { unit, fixes } = pack || initTests()
  const toTrash = []

  const zeroizeTime = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // Month is 0-indexed
    const day = date.getDate();
    return new Date(year, month, day, 0, 0, 0, 0);
  }

  const addDays = (date, daysToAdd = 1) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + daysToAdd);
    return newDate;
  }


  const critty = (t,sb,range, prop, values) => {
    const cr = sb.getRange(range)
    const cb = cr.getDataValidation()
    t.is(cb.getCriteriaType().toString(), prop)
    if (values) t.deepEqual(cb.getCriteriaValues()[0], values.flat()[0])
    const cbs = cr.getDataValidations()
    t.is(cbs.length, cr.getNumRows())
    t.is(cbs[0].length, cr.getNumColumns())
    t.true(cbs.flat().every(f => is.boolean(f.getAllowInvalid())))
    t.true(cbs.flat().every(f => f.getCriteriaType().toString() === prop))
    if (values) cbs.flat().forEach((f,i) => t.deepEqual(f.getCriteriaValues()[0], values.flat()[i]))
  }

  const scritty = (t,sb,range, prop, method, values=[]) => {
    const cr = sb.getRange(range)
    const dv = values.map (row=>row.map(v=>SpreadsheetApp.newDataValidation()[method](v).build()))
    const r = cr.setDataValidations(dv)
    t.is (r.getA1Notation(), cr.getA1Notation())
    console.log (dv.flat().map(f=>f.getCriteriaValues()))
    critty(t, sb, range, prop,values)
  }
    
  unit.section ("setting data validations", t=> {
    const sp = SpreadsheetApp.openById(fixes.TEST_BORDERS_ID)
    const sb = sp.getSheetByName('tempset')
    const vt = [['foo','bar'],['bar','foo']]
    scritty (t,sb,"a1:b2", "TEXT_EQUAL_TO",'requireTextEqualTo',vt)
    scritty (t,sb,"c1:d2", "CHECKBOX",'requireCheckbox')
  })
  unit.cancel()

  unit.section ("test enum selection", t=> {
    t.is(SpreadsheetApp.DataValidationCriteria.DATE_AFTER.toString(), 'DATE_AFTER', "check criteria enum")
    t.is(SpreadsheetApp.RelativeDate.TODAY.toString(), 'TODAY', "check relative dates")
    t.is(SpreadsheetApp.ProtectionType.SHEET.toString(), 'SHEET')
    t.is(SpreadsheetApp.DataValidationCriteria.DATE_BEFORE.toString(), 'DATE_BEFORE', "check criteria enum")
    t.is(SpreadsheetApp.DataValidationCriteria.DATE_AFTER_RELATIVE.toString(), 'DATE_AFTER_RELATIVE', "check relative criteria enum")
  })

  unit.section ("getting relative dates", t => {
    const sp = SpreadsheetApp.openById(fixes.TEST_BORDERS_ID)
    const sb = sp.getSheetByName('dv')
    critty(t,sb,"b29", "DATE_EQUAL_TO_RELATIVE", [SpreadsheetApp.RelativeDate.TODAY])
    critty(t,sb,"h28:i28", "DATE_AFTER_RELATIVE", [SpreadsheetApp.RelativeDate.TOMORROW])
    critty(t,sb,"k28:k29", "DATE_BEFORE_RELATIVE", [SpreadsheetApp.RelativeDate.PAST_YEAR])
  })

  unit.section("data validation from api", t => {

    const sp = SpreadsheetApp.openById(fixes.TEST_BORDERS_ID)
    const sb = sp.getSheetByName('dv')


    // what if value is a formula
    critty(t,sb,"g24", "DATE_EQUAL_TO", ['=I1'])
    critty(t,sb,"f24", "TEXT_CONTAINS", ['=F7'])


    // with no sheet mentioned
    critty(t,sb,"d24", "CUSTOM_FORMULA", ["=F7"])
    // with  sheet mentioned
    critty(t,sb,"e24:e25", "CUSTOM_FORMULA", ["=Sheet1!$F$7:$F$8"])
    // checkbox default has no values
    critty(t,sb,"b24:b25", "CHECKBOX")
    // checkbox with custom values
    critty(t,sb,"c24:c26", "CHECKBOX", ["a", "b"])
    critty(t,sb,"k21", "NUMBER_NOT_BETWEEN", [20, 40])
    critty(t,sb,"J21", "NUMBER_BETWEEN", [20, 40])
    critty(t,sb,"I21:I22", "NUMBER_NOT_EQUAL_TO", [20])
    critty(t,sb,"h21:h23", "NUMBER_EQUAL_TO", [20])
    critty(t,sb,"g21:g22", "NUMBER_LESS_THAN_OR_EQUAL_TO", [20])
    critty(t,sb,"e21:f22", "NUMBER_LESS_THAN", [20])
    critty(t,sb,"d21:d22", "NUMBER_GREATER_THAN_OR_EQUAL_TO", [20])
    critty(t,sb,"c21:c22", "NUMBER_GREATER_THAN", [20])
    critty(t,sb,"b21:b22", "DATE_NOT_BETWEEN", [new Date('1920-11-18'), new Date('2012-12-31')])
    critty(t,sb,"j16:j18", "DATE_BETWEEN", [new Date('1920-11-18'), new Date('2012-12-31')])
    critty(t,sb,"i16:i18", "DATE_ON_OR_AFTER", [new Date('2012-12-31')])
    critty(t,sb,"g16", "DATE_ON_OR_BEFORE", [new Date('2012-12-31')])
    critty(t,sb,"f16:f17", "DATE_BEFORE", [new Date('2012-12-31')])
    critty(t,sb,"e14:e16", "DATE_EQUAL_TO", [new Date('1920-11-18')])
    critty(t,sb,"h16:h17", "DATE_AFTER", [new Date('2012-12-31')])
    critty(t,sb,"f7:g8", "TEXT_CONTAINS", ['abc'])
    critty(t,sb,"b8:b10", "TEXT_DOES_NOT_CONTAIN", ['xyz'])
    critty(t,sb,"c11:d12", "TEXT_EQUAL_TO", ['exactly'])
    critty(t,sb,"f12:g12", "TEXT_IS_VALID_URL")
    critty(t,sb,"a1:b2", "TEXT_IS_VALID_EMAIL")
    critty(t,sb,"h11:h13", "DATE_IS_VALID_DATE")
    critty(t,sb,"b3:c4", "VALUE_IN_LIST", [['a', 'b'], true])
    critty(t,sb,"c21:c22", "NUMBER_GREATER_THAN", [20])



    const cr3 = sb.getRange("d5:e6")
    const cb3 = cr3.getDataValidations()
    cb3.flat().forEach(f => f.getCriteriaValues()[0].toString(), "Range")
    cb3.flat().forEach(f => f.getCriteriaValues()[0].getA1Notation(), cr3.getA1Notation())
    t.true(cb3.flat().every(f => f.getCriteriaType().toString() === 'VALUE_IN_RANGE'))
    t.true(cb3.flat().every(f => f.getHelpText() === 'dropdownrange'))

  })


  unit.section("data validation basics", t => {

    const sp = SpreadsheetApp.openById(fixes.TEST_BORDERS_ID)
    const sv = sp.getSheetByName("dv")

    const builder = SpreadsheetApp.newDataValidation()
    t.is(builder.toString(), "DataValidationBuilder")
    t.is(builder.getCriteriaType(), null)
    t.deepEqual(builder.getCriteriaValues(), [])
    t.is(builder.getHelpText(), null)

    t.is(builder.getAllowInvalid(), true)
    t.is(builder.setAllowInvalid(false).getAllowInvalid(), false)
    t.is(builder.setAllowInvalid(true).getAllowInvalid(), true)

    t.is(builder.requireCheckbox().getCriteriaType().toString(), "CHECKBOX")
    t.deepEqual(builder.getCriteriaValues(), [])
    t.deepEqual(builder.requireCheckbox("A").getCriteriaValues(), ["A"])
    t.is(builder.requireCheckbox().getCriteriaType().toString(), "CHECKBOX")
    t.deepEqual(builder.requireCheckbox("A", "B").getCriteriaValues(), ["A", "B"])
    t.is(builder.getCriteriaType().toString(), "CHECKBOX")

    t.is(builder.setHelpText("foo").getHelpText(), "foo")


    const built = builder.build()
    t.is(built.toString(), "DataValidation")
    t.is(built.getCriteriaType().toString(), "CHECKBOX")
    t.deepEqual(built.getCriteriaValues(), ["A", "B"])
    t.is(built.getAllowInvalid(), true)
    t.is(built.getHelpText(), "foo")

    const dateTests = (method, prop, nargs) => {
      const now = zeroizeTime(new Date())
      const later = zeroizeTime(addDays(now))
      const args = [now, later].slice(0, nargs)
      const builder = SpreadsheetApp.newDataValidation()[method](...args)
      const built = builder.build()
      t.is(built.getCriteriaType().toString(), prop)
      t.deepEqual(built.getCriteriaValues().map(f => f.toISOString()), args.map(f => f.toISOString()))
    }

    dateTests("requireDate", "DATE_IS_VALID_DATE", 0)
    dateTests("requireDateAfter", "DATE_AFTER", 1)
    dateTests("requireDateBefore", "DATE_BEFORE", 1)
    dateTests("requireDateBetween", "DATE_BETWEEN", 2)
    dateTests("requireDateEqualTo", "DATE_EQUAL_TO", 1)
    dateTests("requireDateNotBetween", "DATE_NOT_BETWEEN", 2)
    dateTests("requireDateOnOrBefore", "DATE_ON_OR_BEFORE", 1)
    dateTests("requireDateOnOrAfter", "DATE_ON_OR_AFTER", 1)

    const built2 = SpreadsheetApp.newDataValidation().requireFormulaSatisfied("=ISNUMBER(A1)").build()
    t.is(built2.getCriteriaType().toString(), "CUSTOM_FORMULA")
    t.deepEqual(built2.getCriteriaValues(), ["=ISNUMBER(A1)"])

    const basicTests = (method, prop, nargs, maker) => {
      maker = maker || (() => (Math.random() * 100).toString())
      const args = Array.from({ length: nargs }).map((f, i) => maker(f, i))
      const builder = SpreadsheetApp.newDataValidation()[method](...args)
      const built = builder.build()
      t.is(built.getCriteriaType().toString(), prop)
      t.deepEqual(built.getCriteriaValues(), args)
    }

    const numberTests = (...args) => basicTests(...args, () => Math.random() * 100)


    numberTests("requireNumberBetween", "NUMBER_BETWEEN", 2)
    numberTests("requireNumberEqualTo", "NUMBER_EQUAL_TO", 1)
    numberTests("requireNumberGreaterThan", "NUMBER_GREATER_THAN", 1)
    numberTests("requireNumberGreaterThanOrEqualTo", "NUMBER_GREATER_THAN_OR_EQUAL_TO", 1)
    numberTests("requireNumberLessThan", "NUMBER_LESS_THAN", 1)
    numberTests("requireNumberLessThanOrEqualTo", "NUMBER_LESS_THAN_OR_EQUAL_TO", 1)
    numberTests("requireNumberNotBetween", "NUMBER_NOT_BETWEEN", 2)
    numberTests("requireNumberNotEqualTo", "NUMBER_NOT_EQUAL_TO", 1)


    basicTests("requireTextContains", "TEXT_CONTAINS", 1)
    basicTests("requireTextDoesNotContain", "TEXT_DOES_NOT_CONTAIN", 1)
    basicTests("requireTextEqualTo", "TEXT_EQUAL_TO", 1)
    basicTests("requireTextIsEmail", "TEXT_IS_VALID_EMAIL", 0)
    basicTests("requireTextIsUrl", "TEXT_IS_VALID_URL", 0)
    // note that apps script converts everything to strings in a value list
    basicTests("requireValueInList", "VALUE_IN_LIST", 2, (_, i) => !i ? ["a", "false", "2", "c"] : true)


    // we have to do a special test for this because GAS shoves in a default argument for showDropDown and converts values to strings
    const vl = [9, false, "z"]
    const bv2 = SpreadsheetApp.newDataValidation().requireValueInList(vl)
    t.is(bv2.getCriteriaType().toString(), "VALUE_IN_LIST")
    t.deepEqual(bv2.getCriteriaValues(), [vl.map(f => f.toString()), true])

    const vr = sv.getRange("A2:C4")
    const bv3 = SpreadsheetApp.newDataValidation().requireValueInRange(vr)
    t.is(bv3.getCriteriaType().toString(), "VALUE_IN_RANGE")
    t.deepEqual(bv3.getCriteriaValues()[0].getA1Notation(), vr.getA1Notation())
    t.is(bv3.getCriteriaValues()[1], true)

    const bv4 = SpreadsheetApp.newDataValidation().requireValueInRange(vr, false)
    t.is(bv3.getCriteriaType().toString(), "VALUE_IN_RANGE")
    t.deepEqual(bv4.getCriteriaValues()[0].getA1Notation(), vr.getA1Notation())
    t.is(bv4.getCriteriaValues()[1], false)

    const b2 = builder.copy()
    t.is(b2.toString(), "DataValidationBuilder")

  })




  // running standalone
  if (!pack) {
    if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
    unit.report()

  }

  trasher(toTrash)
  return { unit, fixes }
}

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute" 
// for example node testdrive.js execute
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testSheetsDataValidations()
