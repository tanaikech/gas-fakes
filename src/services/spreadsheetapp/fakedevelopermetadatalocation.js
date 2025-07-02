import { Proxies } from '../../support/proxies.js';
import { Utils } from '../../support/utils.js';
import { newFakeSheetRange } from './fakesheetrange.js';
import { makeGridRange } from './sheetrangehelpers.js';

const { is } = Utils;

/**
 * create a new FakeDeveloperMetadataLocation instance
 * @param  {...any} args
 * @returns {FakeDeveloperMetadataLocation}
 */
export const newFakeDeveloperMetadataLocation = (...args) => {
  return Proxies.guard(new FakeDeveloperMetadataLocation(...args));
};

class FakeDeveloperMetadataLocation {
  constructor(location, spreadsheet) {
    this.__location = location;
    this.__spreadsheet = spreadsheet;
  }

  getColumn() {
    if (this.getLocationType().toString() !== 'COLUMN' || !this.__location.dimensionRange) {
      return null;
    }
    const dr = this.__location.dimensionRange;
    const numCols = dr.endIndex - dr.startIndex;
    return this.getSheet().getRange(1, dr.startIndex + 1, this.getSheet().getMaxRows(), numCols);
  }

  getLocationType() {
    return SpreadsheetApp.DeveloperMetadataLocationType[this.__location.locationType];
  }

  getRow() {
    if (this.getLocationType().toString() !== 'ROW' || !this.__location.dimensionRange) {
      return null;
    }
    const dr = this.__location.dimensionRange;
    const numRows = dr.endIndex - dr.startIndex;
    return this.getSheet().getRange(dr.startIndex + 1, 1, numRows, this.getSheet().getMaxColumns());
  }

  getSheet() {
    if (!this.__location.sheetId) return null;
    return this.__spreadsheet.getSheetById(this.__location.sheetId);
  }

  toString() {
    return 'DeveloperMetadataLocation';
  }
}