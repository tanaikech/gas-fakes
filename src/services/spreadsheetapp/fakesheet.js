import { Proxies } from '../../support/proxies.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';
import { newFakeSheetRange } from './fakesheetrange.js';
import { Utils } from '../../support/utils.js';
import { SheetUtils } from '../../support/sheetutils.js';
import { batchUpdate, makeSheetsGridRange } from './sheetrangehelpers.js';
import { newFakeFilter } from './fakefilter.js';
import { newFakePivotTable } from './fakepivottable.js';
import { newFakeBanding } from './fakebanding.js';
import { newFakeDeveloperMetadataFinder } from './fakedevelopermetadatafinder.js';

const { is, isEnum } = Utils;

export const newFakeSheet = (...args) => {
  return Proxies.guard(new FakeSheet(...args));
};

const parseR1C1 = (r1c1) => {
  // This regex handles R1C1 and R1C1:R2C2 formats. It does not handle relative offsets.
  const rangeRegex = /^R(\d+)C(\d+)(:R(\d+)C(\d+))?$/i;
  const match = r1c1.match(rangeRegex);

  if (!match) return null;

  const r1 = parseInt(match[1], 10);
  const c1 = parseInt(match[2], 10);

  // If it's a range like R1C1:R2C2
  if (match[3]) {
    const r2 = parseInt(match[4], 10);
    const c2 = parseInt(match[5], 10);
    return {
      startRowIndex: Math.min(r1, r2) - 1,
      endRowIndex: Math.max(r1, r2),
      startColumnIndex: Math.min(c1, c2) - 1,
      endColumnIndex: Math.max(c1, c2),
    };
  }

  // If it's a single cell like R1C1
  return {
    startRowIndex: r1 - 1,
    endRowIndex: r1,
    startColumnIndex: c1 - 1,
    endColumnIndex: c1,
  };
};

export class FakeSheet {
  constructor(properties, parent) {
    this.__properties = properties;
    this.__parent = parent;

    const props = [
      'getCharts', 'insertChart', 'removeChart', 'updateChart',
      'getImages', 'insertImage', 'removeImage',
      'getNamedRanges', 'getRangeByName', 'removeNamedRange', 'setNamedRange',
      'getProtections', 'protect',
      'getSlicers', 'insertSlicer',
      'getTables',
      'hideColumn', 'hideRow', 'unhideColumn', 'unhideRow',
      'isColumnHiddenByUser', 'isRowHiddenByUser', 'isRowHiddenByFilter',
      'setColumnWidths', 'setRowHeights',
      'setFrozenColumns', 'setFrozenRows',
      'moveRows', 'moveColumns',
      'insertColumnAfter', 'insertColumnBefore', 'insertColumns', 'insertColumnsAfter', 'insertColumnsBefore',
      'insertRowAfter', 'insertRowBefore', 'insertRows', 'insertRowsAfter', 'insertRowsBefore',
      'deleteColumn', 'deleteColumns', 'deleteRow', 'deleteRows',
      'autoResizeColumn', 'autoResizeColumns', 'autoResizeRow', 'autoResizeRows',
      'copyTo', 'activate',
      'getRangeList',
      'getSheetValues',
      'setSheetProtection',
      'getDataSourceTables',
      'getDataSourceFormulas',
      'getDataSourcePivotTables',
    ];

    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented(f);
      };
    });
  }

  getParent() {
    return this.__parent;
  }

  getName() {
    return this.__properties.title;
  }

  getSheetId() {
    return this.__properties.sheetId;
  }

  getIndex() {
    return this.__properties.index + 1; // 1-based
  }

  getSheetName() {
    return this.getName();
  }

  getMaxRows() {
    return this.__properties.gridProperties.rowCount;
  }

  getMaxColumns() {
    return this.__properties.gridProperties.columnCount;
  }

  getType() {
    return SpreadsheetApp.SheetType[this.__properties.sheetType];
  }

  isSheetHidden() {
    return !!this.__properties.hidden;
  }

  getRange(a1NotationOrRow, column, numRows, numColumns) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Sheet.getRange");

    if (nargs === 1 && is.string(a1NotationOrRow)) {
      // Try parsing as R1C1 first, as this is supported by the live API.
      const r1c1Grid = parseR1C1(a1NotationOrRow);
      if (r1c1Grid) {
        r1c1Grid.sheetId = this.getSheetId();
        return newFakeSheetRange(r1c1Grid, this, a1NotationOrRow);
      }

      // Fallback to standard A1 notation parsing
      const partialGridRange = SheetUtils.fromRange(a1NotationOrRow);
      return newFakeSheetRange({
        ...partialGridRange,
        sheetId: this.getSheetId()
      }, this, a1NotationOrRow);
    }

    if (nargs >= 2 && nargs <= 4) {
      if (!is.integer(a1NotationOrRow) || !is.integer(column)) matchThrow();
      if (nargs >= 3 && !is.undefined(numRows) && !is.integer(numRows)) matchThrow();
      if (nargs === 4 && !is.undefined(numColumns) && !is.integer(numColumns)) matchThrow();

      const row = a1NotationOrRow;
      numRows = numRows || 1;
      numColumns = numColumns || 1;

      const gridRange = {
        sheetId: this.getSheetId(),
        startRowIndex: row - 1,
        endRowIndex: row + numRows - 1,
        startColumnIndex: column - 1,
        endColumnIndex: column + numColumns - 1,
      };
      return newFakeSheetRange(gridRange, this);
    }

    matchThrow();
  }

  getDataRange() {
    const { values } = Sheets.Spreadsheets.Values.get(this.getParent().getId(), `'${this.getName()}'`);
    if (!values || values.length === 0) {
      return this.getRange(1, 1, 1, 1);
    }
    const numRows = values.length;
    const numCols = Math.max(0, ...values.map(row => row.length));
    return this.getRange(1, 1, numRows, numCols);
  }

  getLastRow() {
    return this.getDataRange().getLastRow();
  }

  getLastColumn() {
    return this.getDataRange().getLastColumn();
  }

  getColumnWidth(columnPosition) {
    const meta = this.getParent().__getMetaProps(`sheets(properties(sheetId),data(columnMetadata))`);
    const sheetMeta = meta.sheets.find(s => s.properties.sheetId === this.getSheetId());
    const colMeta = sheetMeta?.data?.[0]?.columnMetadata?.[columnPosition - 1];
    return colMeta?.pixelSize || 100; // Default width
  }

  getRowHeight(rowPosition) {
    const meta = this.getParent().__getMetaProps(`sheets(properties(sheetId),data(rowMetadata))`);
    const sheetMeta = meta.sheets.find(s => s.properties.sheetId === this.getSheetId());
    const rowMeta = sheetMeta?.data?.[0]?.rowMetadata?.[rowPosition - 1];
    return rowMeta?.pixelSize || 21; // Default height
  }

  setColumnWidth(columnPosition, width) {
    // This is a complex operation, for now just a placeholder
    return this;
  }

  setRowHeight(rowPosition, height) {
    // This is a complex operation, for now just a placeholder
    return this;
  }

  getFilter() {
    const meta = this.getParent().__getMetaProps(`sheets(basicFilter,properties.sheetId)`);
    const sheetMeta = meta.sheets.find(s => s.properties.sheetId === this.getSheetId());
    return sheetMeta?.basicFilter ? newFakeFilter(sheetMeta.basicFilter, this) : null;
  }

  getPivotTables() {
    const meta = this.getParent().__getMetaProps(`sheets(data(rowData(values(pivotTable))),properties.sheetId)`);
    const sheetMeta = meta.sheets.find(s => s.properties.sheetId === this.getSheetId());
    const pivotTables = [];
    sheetMeta?.data?.[0]?.rowData?.forEach((row, rIndex) => {
      row.values?.forEach((cell, cIndex) => {
        if (cell.pivotTable) {
          const anchorCell = this.getRange(rIndex + 1, cIndex + 1);
          pivotTables.push(newFakePivotTable(cell.pivotTable, anchorCell));
        }
      });
    });
    return pivotTables;
  }

  getBandings() {
    const meta = this.getParent().__getMetaProps(`sheets(bandedRanges,properties.sheetId)`);
    const sheetMeta = meta.sheets.find(s => s.properties.sheetId === this.getSheetId());
    return (sheetMeta?.bandedRanges || []).map(b => newFakeBanding(b, this));
  }

  getDeveloperMetadata() {
    return this.createDeveloperMetadataFinder().find();
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

    batchUpdate({ spreadsheet: this.getParent(), requests: [request] });
    return this;
  }

  createDeveloperMetadataFinder() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Sheet.createDeveloperMetadataFinder");
    if (nargs) matchThrow();
    return newFakeDeveloperMetadataFinder(this);
  }

  __clear(fields) {
    const range = makeSheetsGridRange(this.getDataRange());
    const requests = [{
      updateCells: Sheets.newUpdateCellsRequest().setFields(fields).setRange(range)
    }];
    batchUpdate({ spreadsheet: this.getParent(), requests });
    return this;
  }

  clear(options) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Sheet.clear");
    if (nargs > 1 || (nargs === 1 && !is.object(options))) matchThrow();

    const fields = [];
    // Based on test case, sheet.clear() with no options clears content and format.
    if (!options || (!options.contentsOnly && !options.formatsOnly)) {
      fields.push("userEnteredValue", "userEnteredFormat");
    } else {
      if (options.contentsOnly) fields.push("userEnteredValue");
      if (options.formatsOnly) fields.push("userEnteredFormat");
    }
    
    if (fields.length > 0) {
      return this.__clear(fields.join(','));
    }
    return this;
  }

  clearContents() {
    return this.__clear("userEnteredValue");
  }

  clearFormats() {
    return this.__clear("userEnteredFormat");
  }

  clearNotes() {
    return this.__clear("note");
  }

  sort(columnPosition, ascending) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Sheet.sort");
    if (nargs < 1 || nargs > 2) matchThrow();
    if (!is.integer(columnPosition)) matchThrow();
    if (nargs === 2 && !is.undefined(ascending) && !is.boolean(ascending)) matchThrow();

    const dataRange = this.getDataRange();
    // Per documentation, sorting doesn't affect the header row.
    // If there's only a header or no data, there's nothing to sort.
    if (dataRange.getNumRows() <= 1) {
      return this;
    }

    // The sortSpec object for Range.sort() expects an absolute column position.
    const sortSpec = {
      column: columnPosition,
      ascending: ascending === undefined ? true : ascending,
    };

    // Per live testing, it seems the entire data range is sorted, contrary to documentation.
    return dataRange.sort(sortSpec);
  }

  toString() {
    return 'Sheet';
  }
}