/**
 * Advanced sheets service
 */

import { Proxies } from '../../support/proxies.js'
import { notYetImplemented, ssError } from '../../support/helpers.js'
import { Syncit } from '../../support/syncit.js'
import { getWorkbookEntry, setWorkbookEntry, clearWorkbookCache } from '../../support/sheetscache.js'

/**
 * create a new FakeSheet instance
 * @param  {...any} args
 * @returns {FakeAdvSheetsValues}
 */
export const newFakeAdvSheetsValues = (...args) => {
  return Proxies.guard(new FakeAdvSheetsValues(...args))
}

/**
* basic fake FakeSheetValues
* @class FakeAdvSheetsValues
*/
class FakeAdvSheetsValues {
  /**
   * @constructor
   * @returns {FakeAdvSheetsValues}
   */
  constructor (sheets) {
    this.__fakeObjectType = 'Sheets.Spreadsheets.Values'
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

  toString () {
    return this.__sheets.toString()
  }

  get (spreadsheetId, range, options = {}) {
    const pack = {
      subProp: 'values',
      prop: 'spreadsheets',
      method: 'get',
      params: {
        spreadsheetId,
        range,
        ...options
      }
    }
    const cache = getWorkbookEntry(spreadsheetId, pack)
    if (cache) {
      return cache
    }

    const result = Syncit.fxSheets(pack)
    const { data } = result || {}

    setWorkbookEntry(spreadsheetId, pack, data)
    return data || null
  }

  batchUpdate (requests, spreadsheetId, { ss = false } = {}) {
    const requestBody = requests
    const pack = {
      subProp: 'values',
      prop: 'spreadsheets',
      method: 'batchUpdate',
      params: { spreadsheetId, requestBody }
    }
    const result = Syncit.fxSheets(pack)
    const { response, data } = result || {}
    clearWorkbookCache(spreadsheetId)
    ssError(response, pack.method, ss)
    return data
  }
}