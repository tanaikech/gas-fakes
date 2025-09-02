/**
 * Advanced sheets service
 */

import { Proxies } from '../../support/proxies.js'
import { notYetImplemented, ssError } from '../../support/helpers.js'
import { Syncit } from '../../support/syncit.js'
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
  constructor(sheets) {
    super(sheets, 'spreadsheets', Syncit.fxSheets);
    this.__fakeObjectType = 'Sheets.Spreadsheets.Values';
    this.sheets = sheets
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


  get(spreadsheetId, range, options = {}) {
    ScriptApp.__behavior.isAccessible(spreadsheetId, 'Sheets', 'read');
    const params = { spreadsheetId, range, ...options };
    const { response, data } = this._call("get", params, null, 'values');
    // maybe we need to throw an error
    ssError(response, "get")
    return data || null
  }

  batchUpdate(requests, spreadsheetId, { ss = false } = {}) {
    ScriptApp.__behavior.isAccessible(spreadsheetId, 'Sheets', 'write');
    const requestBody = requests
    const { response, data } = this._call("batchUpdate", {
      spreadsheetId,
      requestBody
    }, null, 'values');

    ssError(response, "batchUpdate", ss)
    return data
  }
}