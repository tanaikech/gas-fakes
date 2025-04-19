/**
 * Advanced sheets service
 */
/// <reference path="../typedefs.js"

import { Proxies } from '../../support/proxies.js'
import { Syncit } from '../../support/syncit.js'
import { notYetImplemented, ssError } from '../../support/helpers.js'
import { newFakeSheetValues } from './fakeadvvalues.js'
import { getWorkbookEntry, setWorkbookEntry, clearWorkbookCache } from "../../support/sheetscache.js"



/**
 * the advanced Sheets Apps Script service faked - Spreadsheets class
 * @class FakeAdvSheetsSpreadsheets
 */
class FakeAdvSheetsSpreadsheets {
  constructor(sheets) {

    const props = [
      'getByDataFilter',
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
    
    // naive cache - was an update so zap everything
    clearWorkbookCache(spreadsheetId)

    // maybe we need to throw an error
    ssError (response, pack.method, ss)

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
    ssError (response, pack.method, ss)

    // all is good so write to cache
    setWorkbookEntry(id, pack, data)
    return data
  }

  /**
   * @param {Spreadsheet} resource #https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets#SpreadsheetProperties
   * @return {Spreadsheet} resource
   */
  create(resource, {ss=false} = {}) {

    const pack = {
      prop: "spreadsheets",
      method: "create",
      params: {
        requestBody: resource
      }
    }

    // create the sheet
    const { response, data } = Syncit.fxSheets(pack)

    // maybe we need to throw an error
    ssError (response, pack.method, ss)

    return data
  }
}


export const newFakeAdvSheetsSpreadsheets = (...args) => Proxies.guard(new FakeAdvSheetsSpreadsheets(...args))

