/**
 * Advanced sheets service
 */
/// <reference path="../typedefs.js"

import { Proxies } from '../../support/proxies.js'
import { Syncit } from '../../support/syncit.js'
import { notYetImplemented, isGood } from '../../support/helpers.js'
import { newFakeSheetValues } from './fakeadvvalues.js'
import { getWorkbookEntry, setWorkbookEntry, clearWorkbookCache } from "../../support/sheetscache.js"
import { clear } from 'google-auth-library/build/src/auth/envDetect.js'


/**
 * the advanced Sheets Apps Script service faked - Spreadsheets class
 * @class FakeAdvSheetsSpreadsheets
 */
class FakeAdvSheetsSpreadsheets {
  constructor(sheets) {

    const props = [
      'getByDataFilter',
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

  get Values() {
    return newFakeSheetValues(this.__sheets)
  }

  /**
   * batchUpdate: https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/batchUpdate
   * note that the order of args -- requests first then id - is different to usual
   * Batch request looks like this https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/request#request
   * @param {object} request batch request {request:Request[]}
   */
  batchUpdate(requests, spreadsheetId, { ss = false } = {}) {

    // note that in GAS adv sheet service doesnt take the requestBody parameter - it just sends requests as the arg
    // so we need to wrap that in requestbody for the Node API
    const requestBody = requests

    const pack = {
      prop: "spreadsheets",
      method: "batchUpdate",
      params: {
        spreadsheetId,
        requestBody
      }
    }

    const { response, data } = Syncit.fxSheets(pack)

    // maybe we need to throw an error
    if (!isGood(response)) {
      //  driveapp and adv will have different errors
      // TODO find ot exacty what they are
      if (ss) {
        throw new Error("Unexpected error while doing batchUpdate.")
      } else {
        // adv drive throws this one
        throw new Error(`GoogleJsonResponseException: API call to sheets.spreadsheets.batchUpdate failed with error: ${response.error.message}`)
      }
    }
    // zap cache for this spreadsheet as it might now be invalid after an update
    clearWorkbookCache(spreadsheetId)
    return data
  }

  /**
   * get a spreadsheet
   * @param {string} id 
   * @param {object} options 
   */
  get(id, options, { ss = false } = {}) {

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
    setWorkbookEntry(id, pack, data)
    return data
  }



}

export const newFakeAdvSheetsSpreadsheets = (...args) => Proxies.guard(new FakeAdvSheetsSpreadsheets(...args))

