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
    this.__spreadsheet = container.toString() === 'Spreadsheet' ? container : container.getSheet().getParent();
    this.__lookup = {};
    this.__intersecting = false;
  }

  find() {
    const lookupCriteria = { ...this.__lookup };

    if (!this.__intersecting) {
      // Handle non-intersecting searches (e.g., from Spreadsheet.createDeveloperMetadataFinder()).
      // These don't have a location matching strategy, so they don't need a metadataLocation.
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
          const metaRange = (locType === 'ROW') ? loc.getRow() : loc.getColumn();
          return metaRange ? this.__container.getA1Notation() === metaRange.getA1Notation() : false;
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