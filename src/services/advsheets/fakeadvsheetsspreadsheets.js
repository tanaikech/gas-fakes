/**
 * Advanced sheets service
 */
/// <reference path="../typedefs.js"

import { Proxies } from '../../support/proxies.js'
import { Syncit } from '../../support/syncit.js'
import { notYetImplemented, isGood } from '../../support/helpers.js'
import { newFakeSheetValues } from './fakeadvvalues.js'
import { getWorkbookEntry, setWorkbookEntry } from "../../support/sheetscache.js"


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
      'Sheets']

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

  get Values () {
    return newFakeSheetValues(this.__sheets)
  }

  /**
   * get a spreadsheet
   * @param {string} id 
   * @param {object} options 
   */
  get(id, options, { ss = false } ={}) {

    const pack = {
      prop: "spreadsheets",
      method: "get",
      params: {
        spreadsheetId: id,
        ...options
      }
    }
    const cache = getWorkbookEntry(id, pack)
    if (cache) {
      return cache
    } 

    const { response, data } = Syncit.fxSheets(pack)

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
    return setWorkbookEntry(id, pack, data)

  }



}

export const newFakeAdvSheetsSpreadsheets = (...args) => Proxies.guard(new FakeAdvSheetsSpreadsheets(...args))

