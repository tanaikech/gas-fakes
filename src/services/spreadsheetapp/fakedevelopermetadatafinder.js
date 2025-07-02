import { Proxies } from '../../support/proxies.js';
import { newFakeDeveloperMetadata } from './fakedevelopermetadata.js';
import { makeGridRange } from './sheetrangehelpers.js';
import { Utils } from '../../support/utils.js';

const { isEnum } = Utils;

/**
 * create a new FakeDeveloperMetadataFinder instance
 * @param  {...any} args
 * @returns {FakeDeveloperMetadataFinder}
 */
export const newFakeDeveloperMetadataFinder = (...args) => {
  return Proxies.guard(new FakeDeveloperMetadataFinder(...args));
};

class FakeDeveloperMetadataFinder {
  constructor(container) {
    this.__container = container;
    const containerType = container.toString();
    this.__spreadsheet = containerType === 'Spreadsheet' ? container :
      (containerType === 'Sheet' ? container.getParent() : container.getSheet().getParent());
    this.__lookup = {};
    this.__intersecting = false;
  }

  find() {
    const lookupCriteria = { ...this.__lookup };

    if (!this.__intersecting) {
      // This is a non-intersecting search.
      // It performs an exact match on the container's location.
      // If the container is a Spreadsheet, it finds all metadata matching the criteria (no location filter).
      // If the container is a Sheet, it finds metadata ONLY on that exact sheet.
      // If the container is a Range, it finds metadata ONLY on that exact range.
      const containerType = this.__container.toString();

      if (containerType === 'Spreadsheet') {
        // No location filter needed for spreadsheet-level non-intersecting search
      } else if (containerType === 'Sheet') {
        lookupCriteria.metadataLocation = { sheetId: this.__container.getSheetId() };
        lookupCriteria.locationMatchingStrategy = 'EXACT_LOCATION';
      } else if (containerType === 'Range') {
        const container = this.__container;
        const sheet = container.getSheet();
        const isEntireRow = container.getNumRows() === 1 && container.getColumn() === 1 && container.getNumColumns() === sheet.getMaxColumns();
        const isEntireColumn = container.getNumColumns() === 1 && container.getRow() === 1 && container.getNumRows() === sheet.getMaxRows();

        if (isEntireRow || isEntireColumn) {
          const dimension = isEntireColumn ? 'COLUMNS' : 'ROWS';
          const startIndex = dimension === 'ROWS' ? container.getRow() - 1 : container.getColumn() - 1;
          const endIndex = startIndex + (dimension === 'ROWS' ? container.getNumRows() : container.getNumColumns());
          lookupCriteria.metadataLocation = {
            dimensionRange: { sheetId: sheet.getSheetId(), dimension, startIndex, endIndex },
          };
          lookupCriteria.locationMatchingStrategy = 'EXACT_LOCATION';
        } else {
          // Arbitrary ranges don't support developer metadata in this implementation.
          // An exact search for a location that can't have metadata will find nothing.
          return [];
        }
      }

      const request = { dataFilters: [{ developerMetadataLookup: lookupCriteria }] };
      const response = Sheets.Spreadsheets.DeveloperMetadata.search(request, this.__spreadsheet.getId());
      return response.matchedDeveloperMetadata ?
        response.matchedDeveloperMetadata.map(m => newFakeDeveloperMetadata(m.developerMetadata, this.__spreadsheet)) : [];
    }

    // From here on, it's an intersecting search.
    const containerType = this.__container.toString();

    // Case 1: Searching on a Range.
    if (containerType === 'Range') {
      // The API doesn't support intersecting searches on multi-cell ranges directly.
      // The strategy is to search the entire spreadsheet for metadata matching other criteria,
      // and then filter the results locally by location.
      const sheet = this.__container.getSheet();
      const localGridRange = makeGridRange(this.__container);

      // To search the whole spreadsheet, we search with no location criteria.
      const request = { dataFilters: [{ developerMetadataLookup: lookupCriteria }] };
      const response = Sheets.Spreadsheets.DeveloperMetadata.search(request, this.__spreadsheet.getId());
      const allResults = response.matchedDeveloperMetadata ?
        response.matchedDeveloperMetadata.map(m => newFakeDeveloperMetadata(m.developerMetadata, this.__spreadsheet)) : [];

      // Now, perform the local filtering to find true intersections.
      return allResults.filter(meta => {
        const loc = meta.getLocation();
        const locType = loc.getLocationType().toString();

        if (locType === 'SPREADSHEET' || (locType === 'SHEET' && loc.getSheet()?.getSheetId() === sheet.getSheetId())) {
          return true;
        }

        const metaSheet = loc.getSheet();
        if (!metaSheet || metaSheet.getSheetId() !== sheet.getSheetId()) return false;

        // Based on live environment testing, a finder on a sub-range (like a single cell)
        // does NOT find metadata attached to its containing row or column.
        // It only finds metadata on the exact range.
        if (locType === 'ROW' || locType === 'COLUMN') {
          const metaRange = locType === 'ROW' ? loc.getRow() : loc.getColumn();
          if (!metaRange) return false;

          // When getDeveloperMetadata() is called on a Range, it's a strict equality check.
          // A finder on a single cell ("G3") should not find metadata on the containing column ("G:G").
          // To emulate this, we check if the container range itself is a full row/column and if it's the same one.

          const container = this.__container;
          const sheet = container.getSheet();
          const isContainerFullCol = container.getNumColumns() === 1 && container.getRow() === 1 && container.getNumRows() === sheet.getMaxRows();
          const isContainerFullRow = container.getNumRows() === 1 && container.getColumn() === 1 && container.getNumColumns() === sheet.getMaxColumns();

          if (locType === 'COLUMN') {
            return isContainerFullCol && container.getColumn() === metaRange.getColumn();
          }

          if (locType === 'ROW') {
            return isContainerFullRow && container.getRow() === metaRange.getRow();
          }
        }
        return false;
      });
    }

    const dataFilters = [];
    // Case 2: Searching on a Sheet.
    if (containerType === 'Sheet') {
      // For a sheet, an intersecting search should find metadata on the sheet itself,
      // its rows/columns, and on the spreadsheet. We need two lookups for this.
      dataFilters.push({
        developerMetadataLookup: { ...lookupCriteria, locationMatchingStrategy: 'INTERSECTING_LOCATION', metadataLocation: { sheetId: this.__container.getSheetId() } },
      });
      dataFilters.push({
        developerMetadataLookup: { ...lookupCriteria, metadataLocation: { spreadsheet: true } },
      });
    }
    // Case 3: Searching on a Spreadsheet.
    else if (containerType === 'Spreadsheet') {
      // onIntersectingLocations() on a spreadsheet finds all metadata in it.
      // So we search with no location criteria.
      dataFilters.push({ developerMetadataLookup: lookupCriteria });
    }

    // Make the API call for Sheet or Spreadsheet intersecting searches.
    if (!dataFilters.length) return [];
    const request = { dataFilters };
    const response = Sheets.Spreadsheets.DeveloperMetadata.search(request, this.__spreadsheet.getId());
    return response.matchedDeveloperMetadata ?
      response.matchedDeveloperMetadata.map(m => newFakeDeveloperMetadata(m.developerMetadata, this.__spreadsheet)) : [];
  }

  onIntersectingLocations() {
    this.__intersecting = true;
    return this;
  }

  withId(id) {
    this.__lookup.metadataId = id;
    return this;
  }

  withKey(key) {
    this.__lookup.metadataKey = key;
    return this;
  }

  withLocationType(locationType) {
    if (!isEnum(locationType)) throw new Error('Invalid location type');
    this.__lookup.locationType = locationType.toString();
    return this;
  }

  withVisibility(visibility) {
    if (!isEnum(visibility)) throw new Error('Invalid visibility');
    this.__lookup.visibility = visibility.toString();
    return this;
  }

  withValue(value) {
    this.__lookup.metadataValue = value;
    return this;
  }
}
