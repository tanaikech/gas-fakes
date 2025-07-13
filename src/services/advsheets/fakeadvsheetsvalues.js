/**
 * Advanced sheets service
 */

import { Proxies } from '../../support/proxies.js'
import { notYetImplemented, ssError } from '../../support/helpers.js'
import { Syncit } from '../../support/syncit.js'
import { getWorkbookEntry, setWorkbookEntry, clearWorkbookCache } from '../../support/sheetscache.js'
import { FakeAdvResource } from '../common/fakeadvresource.js';

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
class FakeAdvSheetsValues extends FakeAdvResource {
  /**
   * @constructor
   * @returns {FakeAdvSheetsValues}
   */
  constructor (sheets) {
    super(sheets, 'spreadsheets', Syncit.fxSheets);
    this.__fakeObjectType = 'Sheets.Spreadsheets.Values';
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

  get (spreadsheetId, range, options = {}) {
    const params = { spreadsheetId, range, ...options };
    const pack = { subProp: 'values', prop: 'spreadsheets', method: 'get', params }; // for cache key
    const cache = getWorkbookEntry(spreadsheetId, pack);
    if (cache) {
      return cache
    }

    const { data } = this._call("get", params, null, 'values');

    if (data) {
      setWorkbookEntry(spreadsheetId, pack, data);
    }
    return data || null
  }

  batchUpdate (requests, spreadsheetId, { ss = false } = {}) {
    const requestBody = requests
    const { response, data } = this._call("batchUpdate", {
      spreadsheetId,
      requestBody
    }, null, 'values');

    clearWorkbookCache(spreadsheetId)
    ssError(response, "batchUpdate", ss)
    return data
  }
}