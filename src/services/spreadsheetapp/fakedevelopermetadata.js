import { Proxies } from '../../support/proxies.js';
import { Utils } from '../../support/utils.js';
import { signatureArgs } from '../../support/helpers.js';
import { newFakeDeveloperMetadataLocation } from './fakedevelopermetadatalocation.js';
import { batchUpdate, makeSheetsGridRange } from './sheetrangehelpers.js';

const { is, isEnum } = Utils;

/**
 * create a new FakeDeveloperMetadata instance
 * @param  {...any} args
 * @returns {FakeDeveloperMetadata}
 */
export const newFakeDeveloperMetadata = (...args) => {
  return Proxies.guard(new FakeDeveloperMetadata(...args));
};

class FakeDeveloperMetadata {
  constructor(metadata, spreadsheet) {
    this.__metadata = metadata;
    this.__spreadsheet = spreadsheet;
  }

  getId() {
    return this.__metadata.metadataId;
  }

  getKey() {
    return this.__metadata.metadataKey;
  }

  getLocation() {
    return newFakeDeveloperMetadataLocation(this.__metadata.location, this.__spreadsheet);
  }

  getValue() {
    return this.__metadata.metadataValue;
  }

  getVisibility() {
    return SpreadsheetApp.DeveloperMetadataVisibility[this.__metadata.visibility];
  }

  moveToColumn(column) {
    const { nargs, matchThrow } = signatureArgs(arguments, "moveToColumn")
    if (nargs !== 1 || column.toString() !== 'Range') matchThrow()
    return this.__moveTo(column)
  }

  moveToRow(row) {
    const { nargs, matchThrow } = signatureArgs(arguments, "moveToRow")
    if (nargs !== 1 || row.toString() !== 'Range') matchThrow()
    return this.__moveTo(row)
  }

  moveToSheet(sheet) {
    const { nargs, matchThrow } = signatureArgs(arguments, "moveToSheet")
    if (nargs !== 1 || sheet.toString() !== 'Sheet') matchThrow()
    return this.__moveTo(sheet)
  }

  moveToSpreadsheet() {
    const { nargs, matchThrow } = signatureArgs(arguments, "moveToSpreadsheet")
    if (nargs !== 0) matchThrow()
    return this.__moveTo(this.__spreadsheet)
  }

  __moveTo(location) {
    const newLocation = {};
    const locType = location.toString()
    if (locType === 'Sheet') {
      newLocation.sheetId = location.getSheetId();
    } else if (locType === 'Range') {
      const isEntireRow = location.getNumRows() === 1 && location.getColumn() === 1 && location.getNumColumns() === location.getSheet().getMaxColumns();
      const isEntireColumn = location.getNumColumns() === 1 && location.getRow() === 1 && location.getNumRows() === location.getSheet().getMaxRows();

      if (!isEntireRow && !isEntireColumn) {
        throw new Error('Adding developer metadata to arbitrary ranges is not currently supported. ' +
          'Developer metadata may only be added to the top-level spreadsheet, an individual sheet, ' +
          'or an entire row or column.');
      }
      const dimension = isEntireColumn ? 'COLUMNS' : 'ROWS';
      const startIndex = dimension === 'ROWS' ? location.getRow() - 1 : location.getColumn() - 1;
      const endIndex = startIndex + (dimension === 'ROWS' ? location.getNumRows() : location.getNumColumns());

      newLocation.dimensionRange = {
        sheetId: location.getSheet().getSheetId(),
        dimension: dimension,
        startIndex: startIndex,
        endIndex: endIndex,
      };
    } else if (locType === 'Spreadsheet') {
      newLocation.spreadsheet = true;
    } else {
      throw new Error('Location must be a Sheet, Range or Spreadsheet.');
    }

    this.__updateMetadata({ location: newLocation }, 'location');
    return this;
  }

  remove() {
    const request = {
      deleteDeveloperMetadata: {
        dataFilter: { developerMetadataLookup: { metadataId: this.getId() } },
      },
    };
    batchUpdate({ spreadsheet: this.__spreadsheet, requests: [request] });

    // The global API cache is cleared by batchUpdate().
    // Invalidate this specific object instance so it can't be used again.
    this.__metadata = {};
  }

  setKey(key) {
    return this.__updateMetadata({ metadataKey: key }, 'metadataKey');
  }

  setValue(value) {
    return this.__updateMetadata({ metadataValue: value }, 'metadataValue');
  }

  setVisibility(visibility) {
    if (!isEnum(visibility)) throw new Error('Invalid visibility');
    return this.__updateMetadata({ visibility: visibility.toString() }, 'visibility');
  }

  __updateMetadata(metadata, fields) {
    const request = {
      updateDeveloperMetadata: {
        developerMetadata: metadata,
        dataFilters: [{ developerMetadataLookup: { metadataId: this.getId() } }],
        fields: fields,
      },
    };
    batchUpdate({ spreadsheet: this.__spreadsheet, requests: [request] });
    Object.assign(this.__metadata, metadata);
    return this;
  }
}
