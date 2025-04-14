import { Proxies } from '../../support/proxies.js'
import { notYetImplemented } from '../../support/helpers.js'
import { Syncit } from '../../support/syncit.js'
import { getWorkbookEntry, setWorkbookEntry } from "../../support/sheetscache.js"
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

    this.__sheets = sheets
    const props = [
      'batchClearByDataFilter',
      'batchUpdateByDataFilter',
      'batchClear',
      'batchUpdate',
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

}


