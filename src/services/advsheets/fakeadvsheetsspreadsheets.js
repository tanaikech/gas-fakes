/**
 * Advanced sheets service
 */
/// <reference path="../typedefs.js"

import { Proxies } from '../../support/proxies.js'
import { Syncit } from '../../support/syncit.js'
import { notYetImplemented, isGood, throwResponse, is404 } from '../../support/helpers.js'

/**
 * the advanced Sheets Apps Script service faked - Spreadsheets class
 * @class FakeAdvSheetsSpreadsheets
 */
class FakeAdvSheetsSpreadsheets {
  constructor(sheets) {

    const props = [
      'getByDataFilter',
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

  /**
   * get a spreadsheet
   * @param {string} id 
   * @param {object} options 
   */
  get(id, options, { ss = false } ={}) {

    const { response, data } = Syncit.fxSheets({
      prop: "spreadsheets",
      method: "get",
      params: {
        spreadsheetId: id,
        ...options
      }
    })

    // maybe we need to throw an error
    if (!isGood(response)) {
      //  driveapp throws this error with a bad id
      if (ss) {
        throw new Error("Unexpected error while getting the method or property openById on object SpreadsheetApp.")
      } else {
        // adv drive throws this one
        throw new Error("GoogleJsonResponseException: API call to sheets.spreadsheets.get failed with error: Requested entity was not found.")
      }
    }

    // all is good
    return data

  }



}

export const newFakeAdvSheetsSpreadsheets = (...args) => Proxies.guard(new FakeAdvSheetsSpreadsheets(...args))

