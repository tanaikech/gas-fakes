import { Proxies } from '../../support/proxies.js';
import { Utils } from '../../support/utils.js';
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

  moveTo(location) {
    const newLocation = {};
    if (location.toString() === 'Sheet') {
      newLocation.sheetId = location.getSheetId();
    } else if (location.toString() === 'Range') {
      const isSingleColumn = location.getNumColumns() === 1;
      const isSingleRow = location.getNumRows() === 1;
      const dimension = isSingleColumn && !isSingleRow ? 'COLUMNS' : 'ROWS';
      const startIndex = dimension === 'ROWS' ? location.getRow() - 1 : location.getColumn() - 1;

      newLocation.dimensionRange = {
        sheetId: location.getSheet().getSheetId(),
        dimension: dimension,
        startIndex: startIndex,
        endIndex: startIndex + 1,
      };
    } else {
      throw new Error('Location must be a Sheet or Range.');
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
    batchUpdate({ spreadsheetId: this.__spreadsheet.getId(), requests: [request] });
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
    batchUpdate({ spreadsheetId: this.__spreadsheet.getId(), requests: [request] });
    Object.assign(this.__metadata, metadata);
    return this;
  }
}