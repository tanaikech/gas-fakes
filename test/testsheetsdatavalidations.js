
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { getSheetsPerformance } from '../src/support/sheetscache.js';
import { getPerformance } from '../src/support/filecache.js';
import { trasher } from './testassist.js';



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


  unit.section("data validation from api", t => {

    const sp = SpreadsheetApp.openById(fixes.TEST_BORDERS_ID)
    t.is(SpreadsheetApp.DataValidationCriteria.DATE_AFTER.toString(), 'DATE_AFTER', "check criteria enum")


    const sb = sp.getSheetByName('dv')
    const sr = sb.getRange("a1:b2")
    const cbs = sr.getDataValidations()
    t.is (cbs.length, sr.getNumRows())
    t.is(cbs[0].length, sr.getNumColumns())
    t.true(cbs.flat().every(f => f.getAllowInvalid()))
    t.true(cbs.flat().every(f => f.getCriteriaType().toString() === 'TEXT_IS_VALID_EMAIL'))
    t.true(cbs.flat().every(f => f.getHelpText() === 'email'))

    const cb2 = sb.getRange("b3:c4").getDataValidations()
    t.true(cb2.flat().every(f => !f.getAllowInvalid()))
    cb2.flat().forEach(f => t.deepEqual (f.getCriteriaValues(),[['a','b'],true]))
    t.true(cb2.flat().every(f => f.getCriteriaType().toString() === 'VALUE_IN_LIST'))
    t.true(cb2.flat().every(f => f.getHelpText() === 'multipledropchip'))
  })
  unit.cancel()

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
    t.deepEqual(bv2.getCriteriaValues(), [vl.map(f=>f.toString()), true])

    const vr = sv.getRange("A2:C4")
    const bv3 = SpreadsheetApp.newDataValidation().requireValueInRange(vr)
    t.is(bv3.getCriteriaType().toString(), "VALUE_IN_RANGE")
    t.deepEqual(bv3.getCriteriaValues()[0].getA1Notation(), vr.getA1Notation())
    t.is(bv3.getCriteriaValues()[1], true )

    const bv4 = SpreadsheetApp.newDataValidation().requireValueInRange(vr, false)
    t.is(bv3.getCriteriaType().toString(), "VALUE_IN_RANGE")
    t.deepEqual(bv4.getCriteriaValues()[0].getA1Notation(), vr.getA1Notation())
    t.is(bv4.getCriteriaValues()[1], false )

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
