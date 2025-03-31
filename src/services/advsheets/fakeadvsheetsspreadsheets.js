/**
 * Advanced sheets service
 */
import { Proxies } from '../../support/proxies.js'
import { notYetImplemented } from '../../support/helpers.js'

/**
 * the advanced Sheets Apps Script service faked - Spreadsheets class
 * @class FakeAdvSheetsSpreadsheets
 */



class FakeAdvSheetsSpreadsheets {
  constructor(sheets) {

    const props = [
      'getByDataFilter',
      'get',
      'batchUpdate',
      'create',
      'DeveloperMetadata',
      'Sheets',
      'Values']

    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented()
      }
    })
    this.__sheets = sheets

  }
  toString() {
    return this.__sheets.toString()
  }



}

export const newFakeAdvSheetsSpreadsheets = (...args) => Proxies.guard(new FakeAdvSheetsSpreadsheets(...args))

