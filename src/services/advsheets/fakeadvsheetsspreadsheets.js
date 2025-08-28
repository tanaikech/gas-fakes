/**
 * Advanced sheets service
 */

import { Proxies } from '../../support/proxies.js'
import { Syncit } from '../../support/syncit.js'
import { notYetImplemented, ssError } from '../../support/helpers.js'
import { newFakeAdvSheetsValues } from './fakeadvsheetsvalues.js'
import { newFakeAdvSheetsDeveloperMetadata } from './fakeadvsheetsdevelopermetadata.js'
import { FakeAdvResource } from '../common/fakeadvresource.js';

/**
 * the advanced Sheets Apps Script service faked - Spreadsheets class
 * @class FakeAdvSheetsSpreadsheets
 */
class FakeAdvSheetsSpreadsheets extends FakeAdvResource {
  constructor(sheets) {
    super(sheets, 'spreadsheets', Syncit.fxSheets);
    this.sheets = sheets
    this.__fakeObjectType = "Sheets.Spreadsheets";
    this.sheets = sheets
    const props = [
      'getByDataFilter',
      'Sheets']

    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented()
      }
    })
  }

  get DeveloperMetadata() {
    return newFakeAdvSheetsDeveloperMetadata(this.__mainService)
  }

  get Values() {
    return newFakeAdvSheetsValues(this.__mainService)
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
    const { response, data } = this._call("batchUpdate", {
      spreadsheetId: this.sheets.__allowed(spreadsheetId),
      requestBody: requests
    }, options);

    // maybe we need to throw an error
    ssError(response, "batchUpdate", ss)

    return data
  }

  /**
   * get a spreadsheet
   * @param {string} id 
   * @param {object} options 
   */
  get(id, options, { ss = false } = {}) {
    const params = { spreadsheetId: this.sheets.__allowed(id), ...options };
    const { response, data } = this._call("get", params);

    // maybe we need to throw an error
    ssError(response, "get", ss)
    return data;
  }


  /**
   * @param {Spreadsheet} resource #https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets#SpreadsheetProperties
   * @return {Spreadsheet} resource
   */
  create(resource, { ss = false } = {}) {
    const { response, data } = this._call("create", {
      requestBody: resource
    });

    // maybe we need to throw an error
    ssError(response, "create", ss)
    this.sheets.__addAllowed  (data.spreadsheetId);
    return data
  }
}


export const newFakeAdvSheetsSpreadsheets = (...args) => Proxies.guard(new FakeAdvSheetsSpreadsheets(...args))
