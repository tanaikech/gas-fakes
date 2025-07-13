/**
 * Advanced sheets service
 */

import { Proxies } from '../../support/proxies.js';
import { Syncit } from '../../support/syncit.js';
import { notYetImplemented, ssError } from '../../support/helpers.js';
import { FakeAdvResource } from '../common/fakeadvresource.js';

/**
 * the advanced Sheets Apps Script service faked - DeveloperMetadata class
 * @class FakeAdvSheetsDeveloperMetadata
 */
class FakeAdvSheetsDeveloperMetadata extends FakeAdvResource {
  constructor(sheets) {
    super(sheets, 'spreadsheets', Syncit.fxSheets);
    this.__fakeObjectType = "Sheets.Spreadsheets.DeveloperMetadata";

    const props = [];
    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented();
      };
    });
  }

  /**
   * get: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.developerMetadata/get
   * @param {string} spreadsheetId The ID of the spreadsheet to retrieve metadata from.
   * @param {number} metadataId The ID of the developer metadata to retrieve.
   * @returns {object} DeveloperMetadata
   */
  get(spreadsheetId, metadataId) {
    const { response, data } = this._call("get", {
      spreadsheetId,
      metadataId,
    }, null, 'developerMetadata');
    ssError(response, `spreadsheets.developerMetadata.get`);
    return data;
  }

  search(requestBody, spreadsheetId) {
    const { response, data } = this._call("search", {
      spreadsheetId,
      requestBody
    }, null, 'developerMetadata');

    ssError(response, `spreadsheets.developerMetadata.search`);
    return data;
  }
}

export const newFakeAdvSheetsDeveloperMetadata = (...args) => Proxies.guard(new FakeAdvSheetsDeveloperMetadata(...args));