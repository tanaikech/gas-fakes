import { Proxies } from '../../support/proxies.js'
import { notYetImplemented, ssError } from '../../support/helpers.js'
import { Syncit } from '../../support/syncit.js'
import { getWorkbookEntry, setWorkbookEntry, clearWorkbookCache } from "../../support/sheetscache.js"
/**
 * @file
 * @imports ../typedefs.js
 */
// private properties are identified with leading __
// this will signal to the proxy handler that it's okay to set them

/**
 * create a new FakeSheet instance
 * @param  {...any} args 
 * @returns {FakeSheetRange}
 */
export const newFakeSheetValues = (...args) => {
  return Proxies.guard(new FakeSheetValues(...args))
}


/**
* basic fake FakeSheetValues
* @class FakeSheetValues
*/
class FakeSheetValues {

  /**
   * @constructor
   * @returns {FakeSheetValues}
   */
  constructor(sheets) {
    this.__fakeObjectType ="Sheets.Spreadsheets.Values"
    this.__sheets = sheets
    const props = [
      'batchClearByDataFilter',
      'batchUpdateByDataFilter',
      'batchClear',
      'batchGetByDataFilter',
      'clear',
      'update',
      'batchGet',
      'append']

    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented()
      }
    })
  }

  toString() {
    return this.__sheets.toString()
  }

  /**
   * @param {string} spreadsheetId the spreadsheet id
   * @param {string} ranges the a1 style range including the name of the sheet
   * @param {object} options
   */
  get(spreadsheetId, range, options ={}) {

    const pack = {
      subProp: "values",
      prop: "spreadsheets",
      method: "get",
      params: {
        spreadsheetId: spreadsheetId,
        range,
        ...options
      }
    }
    const cache = getWorkbookEntry(spreadsheetId, pack)
    if (cache) {
      return cache
    } 

    const { data } = Syncit.fxSheets(pack)

    setWorkbookEntry(spreadsheetId, pack, data)
    return data
  }


  /**
   * batchUpdate: https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/batchUpdate
   * note that the order of args -- requests first then id - is different to usual
   * Batch request looks like this https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/request#request
   * @param {object} request batch request {request:Request[]}
   */
  batchUpdate(requests, spreadsheetId, { ss = false } = {}) {

    const requestBody = requests

    const pack = {
      subProp: "values",
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

}


