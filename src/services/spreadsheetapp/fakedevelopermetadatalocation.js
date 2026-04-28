import { Proxies } from '../../support/proxies.js';
import { Utils } from '../../support/utils.js';
import { SheetUtils } from '../../support/sheetutils.js';
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
    const startA1 = SheetUtils.columnToLetter(dr.startIndex + 1);
    const endA1 = SheetUtils.columnToLetter(dr.endIndex);
    return this.getSheet().getRange(`${startA1}:${endA1}`);
  }

  getLocationType() {
    if (this.__location.locationType) {
        return SpreadsheetApp.DeveloperMetadataLocationType[this.__location.locationType];
    }
    if (this.__location.spreadsheet) {
        return SpreadsheetApp.DeveloperMetadataLocationType.SPREADSHEET;
    }
    if (this.__location.dimensionRange) {
        return this.__location.dimensionRange.dimension === 'COLUMNS' ? 
            SpreadsheetApp.DeveloperMetadataLocationType.COLUMN : 
            SpreadsheetApp.DeveloperMetadataLocationType.ROW;
    }
    if (this.__location.sheetId !== undefined) {
        return SpreadsheetApp.DeveloperMetadataLocationType.SHEET;
    }
    return null;
  }

  getRow() {
    if (this.getLocationType().toString() !== 'ROW' || !this.__location.dimensionRange) {
      return null;
    }
    const dr = this.__location.dimensionRange;
    return this.getSheet().getRange(`${dr.startIndex + 1}:${dr.endIndex}`);
  }

  getSheet() {
    const sheetId = this.__location.sheetId || this.__location.dimensionRange?.sheetId;
    if (!sheetId) return null;
    return this.__spreadsheet.getSheetById(sheetId);
  }

  getSpreadsheet() {
    if (this.getLocationType().toString() !== 'SPREADSHEET' || !this.__location.spreadsheet) {
      return null;
    }
    return this.__spreadsheet;
  }

  toString() {
    return 'DeveloperMetadataLocation';
  }
}