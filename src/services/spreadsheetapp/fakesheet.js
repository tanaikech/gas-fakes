import { Proxies } from '../../support/proxies.js';
import { Utils } from '../../support/utils.js';
import { newFakeDeveloperMetadata } from './fakedevelopermetadata.js';
import { newFakeDeveloperMetadataFinder } from './fakedevelopermetadatafinder.js';
import { batchUpdate } from './sheetrangehelpers.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';
import { SheetUtils } from '../../support/sheetutils.js';
import { newFakeSheetRange } from './fakesheetrange.js';

const { is, isEnum } = Utils;

export const newFakeSheet = (...args) => {
  return Proxies.guard(new FakeSheet(...args));
};

export class FakeSheet {
  constructor(properties, spreadsheet) {
    this.__properties = properties;
    this.__spreadsheet = spreadsheet;

    const props = [
      'getRange', 'getMaxRows', 'getMaxColumns', 'getFilter', 'getBandings', 'clear', 'getParent',
      // ... other sheet methods would be here
    ];
    props.forEach(f => {
      if (!this[f]) {
        this[f] = () => notYetImplemented(`Sheet.${f}`);
      }
    });
  }

  getSheetId() {
    return this.__properties.sheetId;
  }

  getName() {
    return this.__properties.title;
  }

  getParent() {
    return this.__spreadsheet;
  }

  addDeveloperMetadata(key, value, visibility) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Sheet.addDeveloperMetadata");
    if (nargs < 1 || nargs > 3) matchThrow();
    if (!is.string(key)) matchThrow();

    let realValue = null;
    let realVisibility = SpreadsheetApp.DeveloperMetadataVisibility.DOCUMENT;

    if (nargs === 2) {
      if (isEnum(value)) {
        realVisibility = value;
      } else {
        realValue = value;
      }
    } else if (nargs === 3) {
      realValue = value;
      realVisibility = visibility;
    }

    const metadata = {
      metadataKey: key,
      metadataValue: realValue,
      visibility: realVisibility.toString(),
      location: {
        sheetId: this.getSheetId(),
      },
    };

    const request = {
      createDeveloperMetadata: {
        developerMetadata: metadata,
      },
    };

    batchUpdate({ spreadsheetId: this.getParent().getId(), requests: [request] });
    return this;
  }

  createDeveloperMetadataFinder() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Sheet.createDeveloperMetadataFinder");
    if (nargs) matchThrow();
    return newFakeDeveloperMetadataFinder(this);
  }

  getDeveloperMetadata() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Sheet.getDeveloperMetadata");
    if (nargs) matchThrow();
    return this.createDeveloperMetadataFinder().onIntersectingLocations().find();
  }

  toString() {
    return 'Sheet';
  }

  // Dummy implementations for methods used by other fakes
  getRange(rowOrA1, column, numRows, numColumns) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Sheet.getRange");

    if (nargs < 1 || nargs > 4) matchThrow();

    if (nargs === 1) {
      if (!is.string(rowOrA1)) matchThrow();
      const grid = SheetUtils.fromRange(rowOrA1);
      return newFakeSheetRange({
        ...grid,
        sheetId: this.getSheetId()
      }, this);
    }

    const row = rowOrA1;
    if (!is.integer(row) || !is.integer(column)) matchThrow();
    if (nargs >= 3 && !is.integer(numRows)) matchThrow();
    if (nargs === 4 && !is.integer(numColumns)) matchThrow();

    const _numRows = numRows || 1;
    const _numColumns = numColumns || 1;

    const startRowIndex = row - 1;
    const startColumnIndex = column - 1;

    return newFakeSheetRange({
      sheetId: this.getSheetId(),
      startRowIndex, startColumnIndex, endRowIndex: startRowIndex + _numRows, endColumnIndex: startColumnIndex + _numColumns
    }, this);
  }

  getMaxRows() {
    return this.__properties.gridProperties.rowCount;
  }

  getMaxColumns() {
    return this.__properties.gridProperties.columnCount;
  }
}