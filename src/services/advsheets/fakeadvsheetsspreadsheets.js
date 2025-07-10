/**
 * Advanced sheets service
 */

import { Proxies } from '../../support/proxies.js'
import { Syncit } from '../../support/syncit.js'
import { notYetImplemented, ssError } from '../../support/helpers.js'
import { newFakeAdvSheetsValues } from './fakeadvsheetsvalues.js'
import { getWorkbookEntry, setWorkbookEntry, clearWorkbookCache } from '../../support/sheetscache.js'
import { newFakeAdvSheetsDeveloperMetadata } from './fakeadvsheetsdevelopermetadata.js'
import path from 'path';

/**
 * the advanced Sheets Apps Script service faked - Spreadsheets class
 * @class FakeAdvSheetsSpreadsheets
 */
class FakeAdvSheetsSpreadsheets {
  constructor(sheets) {

    this.shapisPath = path.resolve(import.meta.dirname, './shapis.js')

    this.__fakeObjectType = "Sheets.Spreadsheets"

    const props = [
      'getByDataFilter',
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

  get DeveloperMetadata() {
    return newFakeAdvSheetsDeveloperMetadata(this.__sheets)
  }

  get Values() {
    return newFakeAdvSheetsValues(this.__sheets)
  }

  /**
 * batchUpdate: https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/batchUpdate
 * note that the order of args -- requests first then id - is different to usual
 * Batch request looks like this https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/request#request
 * @param {object} request batch request {request:Request[]}
 */
  batchUpdate(requests, spreadsheetId, options) {
    return this.__batchUpdate(requests, spreadsheetId, options, { ss: false } )
  }

  /**
   * batchUpdate: https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/batchUpdate
   * note that the order of args -- requests first then id - is different to usual
   * Batch request looks like this https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/request#request
   * @param {object} request batch request {request:Request[]}
   */
  __batchUpdate(requests, spreadsheetId, options, { ss = true } = {}) {

    // this is wrapper for batchupdate so we can alter the behavior depending on whether we're being called by spreadsheetapp
    // note that in GAS adv sheet service doesnt take the requestBody parameter - it just sends requests as the arg
    // so we need to wrap that in requestbody for the Node API
    const pack = {
      prop: "spreadsheets",
      method: "batchUpdate",
      params: {
        spreadsheetId,
        requestBody: requests
      },
      options
    }

    const result = Syncit.fxSheets(pack)
    const { response, data } = result || {}
    // naive cache - was an update so zap everything
    clearWorkbookCache(spreadsheetId)

    // maybe we need to throw an error
    ssError(response, pack.method, ss)

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

    const result = Syncit.fxSheets(pack)
    const { response, data } = result || {}

    // maybe we need to throw an error
    ssError(response, pack.method, ss)

    // all is good so write to cache
    setWorkbookEntry(id, pack, data)
    return data
  }

  /**
   * @param {Spreadsheet} resource #https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets#SpreadsheetProperties
   * @return {Spreadsheet} resource
   */
  create(resource, { ss = false } = {}) {

    const pack = {
      prop: "spreadsheets",
      method: "create",
      params: {
        requestBody: resource
      }
    }

    // create the sheet
    const result = Syncit.fxSheets(pack)
    const { response, data } = result || {}

    // maybe we need to throw an error
    ssError(response, pack.method, ss)

    return data
  }
}


export const newFakeAdvSheetsSpreadsheets = (...args) => Proxies.guard(new FakeAdvSheetsSpreadsheets(...args))
