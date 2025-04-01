import { Proxies } from '../../support/proxies.js'
import { newFakeSheet } from './fakesheet.js'


/**
 * create a new FakeSpreadsheet instance
 * @param  {...any} args 
 * @returns {FakeSpreadsheet}
 */
export const newFakeSpreadsheet = (...args) => {
  return Proxies.guard(new FakeSpreadsheet(...args))
}


/**
 * basic fake FakeSpreadsheet
 * TODO add lots more methods
 * @class FakeSpreadsheet
 * @returns {FakeSpreadsheet}
 */
export class FakeSpreadsheet {

  constructor(file) {
    this.__meta = file
  }

  /**
   *  @return {string} the spreadsheet id
   */
  getId() {
    return this.__meta.spreadsheetId
  }
  /**
   *  @return {string} the spreadsheet name
   */
  getName() {
    return this.__meta.properties.title
  }
  /**
   * @return {number} number of sheets in the spreadsheet
   */
  getNumSheets () {
    return this.__meta.sheets.length
  }
  /**
   * @return {FakeSheets[]} the sheets in the spreadsheet
   */
  getSheets () {
    return this.__meta.sheets.map(f=>newFakeSheet(f))
  }
}
