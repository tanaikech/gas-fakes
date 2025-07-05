import { Proxies } from '../../support/proxies.js';
import { Utils } from '../../support/utils.js';
import { signatureArgs } from '../../support/helpers.js';
import { batchUpdate } from './sheetrangehelpers.js';
import { newFakePivotGroup } from './fakepivotgroup.js';
import { newFakePivotValue } from './fakepivotvalue.js';
import { newFakePivotFilter } from './fakepivotfilter.js';
import { newFakeSheetRange } from './fakesheetrange.js';
import { Dimension } from '../enums/sheetsenums.js';

const { is, isEnum } = Utils;

/**
 * create a new FakePivotTable instance
 * @param  {...any} args
 * @returns {FakePivotTable}
 */
export const newFakePivotTable = (...args) => {
  return Proxies.guard(new FakePivotTable(...args));
};

/**
 * @class FakePivotTable
 * @implements {SpreadsheetApp.PivotTable}
 */
export class FakePivotTable {
  /**
   * Re-fetches the pivot table from the sheet to ensure the internal state is current.
   */
  __refresh() {
    const anchor = this.getAnchorCell();
    const sheet = anchor.getSheet();
    // get a fresh instance of the sheet from the parent spreadsheet
    const freshSheet = sheet.getParent().getSheetByName(sheet.getName());
    const freshPivotTable = freshSheet.getPivotTables().find(pt => pt.getAnchorCell().getA1Notation() === anchor.getA1Notation());
    this.__pivotTable = freshPivotTable?.__pivotTable || this.__pivotTable;
  }

  /**
   * @param {import('../../../node_modules/googleapis/build/src/apis/sheets/v4').sheets_v4.Schema$PivotTable} pivotTable
   * @param {import('./fakesheetrange').FakeSheetRange} anchorRange
   */
  constructor(pivotTable, anchorRange) {
    this.__pivotTable = pivotTable;
    this.__anchorRange = anchorRange;
  }

  /**
   * @param {import('../../../node_modules/googleapis/build/src/apis/sheets/v4').sheets_v4.Schema$PivotTable} pivotTable
   */
  __updatePivotTable(pivotTable) {
    const anchorCell = this.getAnchorCell();
    const spreadsheet = anchorCell.getSheet().getParent();
    const spreadsheetId = spreadsheet.getId();

    const updateCellsRequest = {
      updateCells: {
        rows: [{
          values: [{
            pivotTable: pivotTable
          }]
        }],
        fields: `pivotTable`,
        start: {
          sheetId: anchorCell.getSheet().getSheetId(),
          rowIndex: anchorCell.getRow() - 1,
          columnIndex: anchorCell.getColumn() - 1,
        }
      }
    };

    batchUpdate({ spreadsheet, requests: [updateCellsRequest] });
    this.__pivotTable = pivotTable;
  }

  addCalculatedPivotValue(name, formula) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotTable.addCalculatedPivotValue');
    if (nargs !== 2 || !is.string(name) || !is.string(formula)) matchThrow();
    if (!formula.startsWith('=')) {
      throw new Error('Formula must start with an "=" sign.');
    }
    this.__refresh();

    const newPivotValue = {
      name: name,
      formula: formula,
      summarizeFunction: 'CUSTOM',
    };

    const currentValues = this.__pivotTable.values || [];
    const newValues = [...currentValues, newPivotValue];
    const newPivotTable = { ...this.__pivotTable, values: newValues };

    this.__updatePivotTable(newPivotTable);

    return newFakePivotValue(newPivotValue, this);
  }

  addColumnGroup(sourceDataColumn) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotTable.addColumnGroup');
    if (nargs !== 1 || !is.number(sourceDataColumn)) matchThrow();
    this.__refresh();

    const newGroup = {
      sourceColumnOffset: sourceDataColumn - 1,
      sortOrder: 'ASCENDING', // Default
      showTotals: true, // Default
    };

    const currentGroups = this.__pivotTable.columns || [];
    const newGroups = [...currentGroups, newGroup];
    const newPivotTable = { ...this.__pivotTable, columns: newGroups };

    this.__updatePivotTable(newPivotTable);
    return newFakePivotGroup(newGroup, this, 'COLUMNS');
  }

  addFilter(sourceDataColumn, filterCriteria) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotTable.addFilter');
    if (nargs !== 2 || !is.number(sourceDataColumn) || !is.object(filterCriteria) || filterCriteria.toString() !== 'FilterCriteria') {
      matchThrow();
    }
    this.__refresh();

    const newFilter = {
      columnOffsetIndex: sourceDataColumn - 1,
      filterCriteria: filterCriteria.__apiCriteria,
    };

    const currentFilters = this.__pivotTable.filterSpecs || [];
    const newFilters = [...currentFilters, newFilter];
    const newPivotTable = { ...this.__pivotTable, filterSpecs: newFilters };

    this.__updatePivotTable(newPivotTable);
    return newFakePivotFilter(newFilter, this);
  }

  addPivotValue(sourceDataColumn, summarizeFunction) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotTable.addPivotValue');
    if (nargs !== 2 || !is.number(sourceDataColumn) || !isEnum(summarizeFunction)) matchThrow();
    this.__refresh();

    const newPivotValue = {
      sourceColumnOffset: sourceDataColumn - 1,
      summarizeFunction: summarizeFunction.toString(),
    };

    const currentValues = this.__pivotTable.values || [];
    const newValues = [...currentValues, newPivotValue];
    const newPivotTable = { ...this.__pivotTable, values: newValues };

    this.__updatePivotTable(newPivotTable);
    return newFakePivotValue(newPivotValue, this);
  }

  addRowGroup(sourceDataColumn) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotTable.addRowGroup');
    if (nargs !== 1 || !is.number(sourceDataColumn)) matchThrow();
    this.__refresh();

    const newGroup = {
      sourceColumnOffset: sourceDataColumn - 1,
      sortOrder: 'ASCENDING', // Default
      showTotals: true, // Default
    };

    const currentGroups = this.__pivotTable.rows || [];
    const newGroups = [...currentGroups, newGroup];
    const newPivotTable = { ...this.__pivotTable, rows: newGroups };

    this.__updatePivotTable(newPivotTable);
    return newFakePivotGroup(newGroup, this, 'ROWS');
  }

  asDataSourcePivotTable() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotTable.asDataSourcePivotTable');
    if (nargs) matchThrow();
    // Not implemented yet, as it requires DataSource support
    return null;
  }

  getAnchorCell() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotTable.getAnchorCell');
    if (nargs) matchThrow();
    return this.__anchorRange;
  }

  getColumnGroups() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotTable.getColumnGroups');
    if (nargs) matchThrow();
    this.__refresh();
    const groups = this.__pivotTable.columns || [];
    return groups.map(g => newFakePivotGroup(g, this, 'COLUMNS'));
  }

  getFilters() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotTable.getFilters');
    if (nargs) matchThrow();
    this.__refresh();
    const filters = this.__pivotTable.filterSpecs || [];
    return filters.map(f => newFakePivotFilter(f, this));
  }

  getPivotValues() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotTable.getPivotValues');
    if (nargs) matchThrow();
    this.__refresh();
    const values = this.__pivotTable.values || [];
    return values.map(v => newFakePivotValue(v, this));
  }

  getRowGroups() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotTable.getRowGroups');
    if (nargs) matchThrow();
    this.__refresh();
    const groups = this.__pivotTable.rows || [];
    return groups.map(g => newFakePivotGroup(g, this, 'ROWS'));
  }

  getSourceDataRange() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotTable.getSourceDataRange');
    if (nargs) matchThrow();
    const source = this.__pivotTable.source;
    if (!source) return null;

    const spreadsheet = this.getAnchorCell().getSheet().getParent();
    const sheet = spreadsheet.getSheetById(source.sheetId);
    if (!sheet) return null;

    return newFakeSheetRange(source, sheet);
  }

  getValuesDisplayOrientation() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotTable.getValuesDisplayOrientation');
    if (nargs) matchThrow();
    const layout = this.__pivotTable.valueLayout;
    return layout === 'VERTICAL' ? Dimension.ROWS : Dimension.COLUMNS;
  }

  remove() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotTable.remove');
    if (nargs) matchThrow();
    // By setting the pivot table to null, we effectively remove it
    this.__updatePivotTable(null);
  }

  setValuesDisplayOrientation(dimension) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotTable.setValuesDisplayOrientation');
    if (nargs !== 1 || !isEnum(dimension)) matchThrow();

    const layout = dimension === Dimension.ROWS ? 'VERTICAL' : 'HORIZONTAL';
    const newPivotTable = { ...this.__pivotTable, valueLayout: layout };
    this.__updatePivotTable(newPivotTable);
    return this;
  }

  toString() {
    return 'PivotTable';
  }
}