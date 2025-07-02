/**
 * Advanced sheets service
 */

import { Proxies } from '../../support/proxies.js';
import { Syncit } from '../../support/syncit.js';
import { notYetImplemented, ssError } from '../../support/helpers.js';

/**
 * the advanced Sheets Apps Script service faked - DeveloperMetadata class
 * @class FakeAdvSheetsDeveloperMetadata
 */
class FakeAdvSheetsDeveloperMetadata {
  constructor(sheets) {
    this.__fakeObjectType = "Sheets.Spreadsheets.DeveloperMetadata";
    this.__sheets = sheets;

    const props = [];
    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented();
      };
    });
  }

  toString() {
    return this.__sheets.toString();
  }

  /**
   * get: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.developerMetadata/get
   * @param {string} spreadsheetId The ID of the spreadsheet to retrieve metadata from.
   * @param {number} metadataId The ID of the developer metadata to retrieve.
   * @returns {object} DeveloperMetadata
   */
  get(spreadsheetId, metadataId) {
    const pack = {
      subProp: "developerMetadata",
      prop: "spreadsheets",
      method: "get",
      params: {
        spreadsheetId,
        metadataId,
      },
    };

    const { response, data } = Syncit.fxSheets(pack);
    ssError(response, `${pack.prop}.${pack.subProp}.${pack.method}`);
    return data;
  }

  search(requestBody, spreadsheetId) {
    const pack = {
      subProp: "developerMetadata",
      prop: "spreadsheets",
      method: "search",
      params: { spreadsheetId, requestBody },
    };
    const { response, data } = Syncit.fxSheets(pack);
    ssError(response, `${pack.prop}.${pack.subProp}.${pack.method}`);
    return data;
  }
}

export const newFakeAdvSheetsDeveloperMetadata = (...args) => Proxies.guard(new FakeAdvSheetsDeveloperMetadata(...args));