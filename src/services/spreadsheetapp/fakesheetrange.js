import { Proxies } from '../../support/proxies.js'
import { newFakePivotTable } from './fakepivottable.js';
import { newFakeDataTable } from './fakedatatable.js';
import { newFakeBanding } from './fakebanding.js';
import { newFakeDeveloperMetadataFinder } from './fakedevelopermetadatafinder.js';
import { SheetUtils } from '../../support/sheetutils.js'
import { Utils } from '../../support/utils.js'
import { setterList, attrGetList, valuesGetList, setterMaker, attrGens, valueGens, makeCellTextFormatData } from './sheetrangemakers.js'
import {
  updateCells,
  isRange,
  makeGridRange,
  makeSheetsGridRange,
  batchUpdate,
  fillRange,
  arrMatchesRange,
  isACheckbox,
  makeExtendedValue,
  bandingThemeMap
} from "./sheetrangehelpers.js"

import { TextToColumnsDelimiter, Direction, Dimension } from '../enums/sheetsenums.js'

const { is, rgbToHex, hexToRgb, stringer, outsideInt, capital, BLACKER, getEnumKeys, isEnum, normalizeColorStringToHex } = Utils
import { notYetImplemented, signatureArgs } from '../../support/helpers.js'
import { FakeSpreadsheet } from './fakespreadsheet.js'
import { FakeDataValidation } from './fakedatavalidation.js'

// private properties are identified with leading __
// this will signal to the proxy handler that it's okay to set them
/**
 * create a new FakeSheet instance
 * @param  {...any} args 
 * @returns {FakeSheetRange}
 */
export const newFakeSheetRange = (...args) => {
  return Proxies.guard(new FakeSheetRange(...args))
}


const sortOutGridForCopy = (gridIdOrSheet, column, columnEnd, row, rowEnd) => {
  const sheetId = is.object(gridIdOrSheet) ? gridIdOrSheet.getSheetId() : gridIdOrSheet
  const gridRange = {
    sheetId,
    startColumnIndex: column - 1,
    endColumnIndex: columnEnd,
    startRowIndex: row - 1,
    endRowIndex: rowEnd
  }
  return gridRange
}
/**
 * basic fake FakeSheetRange
 * @class FakeSheetRange
 */
export class FakeSheetRange {

  /**
   * @constructor
   * @param {GridRange} gridRange 
   * @param {FakeSheet} sheet the sheet
   * @returns {FakeSheetRange}
   */
  constructor(gridRange, sheet, a1Notation = null) {

    this.__apiGridRange = gridRange
    this.__sheet = sheet
    this.__hasGrid = Reflect.has(gridRange, "startRowIndex") || Reflect.has(gridRange, "startColumnIndex")
    this.__a1Notation = a1Notation

    // make the generatable functions
    attrGetList.forEach(target => attrGens(this, target))
    valuesGetList.forEach(target => valueGens(this, target))

    // list of not yet implemented methods
    const props = [

      'createDataSourcePivotTable',
      'activate',
      'getDataSourceFormula',
      'activateAsCurrentCell',
      'setComments',

      'createDataSourceTable',
      'getComments',
      'clearComment',

      'getDataSourceUrl',

      'getDataSourcePivotTables',
      // these are not documented, so will skip for now
      'setComment',
      'getComment'
      //--
    ]
    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented(f)
      }
    })

    setterList.forEach(f => {
      setterMaker({
        self: this,
        ...f,
        single: 'set' + capital(f.single || f.name),
        plural: f.plural || ('set' + capital(f.single || f.name) + 's'),
        fields: f.fields || `userEnteredFormat.textFormat.${f.name}`,
        maker: f.maker || makeCellTextFormatData,
        apiSetter: f.apiSetter || 'set' + capital(f.single || f.name)
      })
    })
  }

  getFormulasR1C1() {
    const a1Formulas = this.getFormulas();
    if (!a1Formulas) return null;

    const startRow = this.getRow();
    const startCol = this.getColumn();

    return a1Formulas.map((row, rIdx) => {
      return row.map((a1Formula, cIdx) => {
        if (!a1Formula || !a1Formula.startsWith('=')) {
          return a1Formula;
        }
        const baseRow = startRow + rIdx;
        const baseCol = startCol + cIdx;
        return SheetUtils.a1ToR1C1(a1Formula, baseRow, baseCol);
      });
    });
  }

  getFormulaR1C1() {
    const formulas = this.getFormulasR1C1();
    return formulas && formulas[0] && formulas[0][0];
  }

  setFormulasR1C1(formulas) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setFormulasR1C1");
    if (nargs !== 1 || !arrMatchesRange(this, formulas, 'string', true)) matchThrow();

    const startRow = this.getRow();
    const startCol = this.getColumn();

    const a1Formulas = formulas.map((row, rIdx) => {
      return row.map((r1c1Formula, cIdx) => {
        if (!r1c1Formula || !r1c1Formula.startsWith('=')) {
          return r1c1Formula;
        }
        const baseRow = startRow + rIdx;
        const baseCol = startCol + cIdx;
        return SheetUtils.r1c1ToA1(r1c1Formula, baseRow, baseCol);
      });
    });

    return this.setFormulas(a1Formulas);
  }

  setFormulaR1C1(formula) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setFormulaR1C1");
    if (nargs !== 1 || !is.string(formula)) matchThrow();

    const a1Formula = SheetUtils.r1c1ToA1(formula, this.getRow(), this.getColumn());
    return this.setFormula(a1Formula);
  }

  getMergedRanges() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.getMergedRanges");
    if (nargs) matchThrow();

    // The sheet object associated with this range might be stale after a mutation.
    // Always get a fresh spreadsheet object to ensure we have the latest metadata.
    const spreadsheet = this.getSheet().getParent();
    const sheetId = this.getSheet().getSheetId();
    const sheetMeta = spreadsheet.__getSheetMeta(sheetId);
    const allMergesOnSheet = sheetMeta.merges || [];
    const thisGridRange = this.__gridRange;

    const intersects = (merge) => {
      // Check if two grid ranges intersect.
      const r1 = thisGridRange;
      const r2 = merge;
      return r1.sheetId === r2.sheetId &&
        Math.max(r1.startRowIndex, r2.startRowIndex) < Math.min(r1.endRowIndex, r2.endRowIndex) &&
        Math.max(r1.startColumnIndex, r2.startColumnIndex) < Math.min(r1.endColumnIndex, r2.endColumnIndex);
    };

    const intersectingMerges = allMergesOnSheet.filter(intersects);
    const freshSheet = spreadsheet.getSheetById(sheetId);
    return intersectingMerges.map(m => newFakeSheetRange(m, freshSheet));
  }

  isPartOfMerge() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.isPartOfMerge");
    if (nargs) matchThrow();
    return this.getMergedRanges().length > 0;
  }

  __merge(mergeType) {
    const requests = [];
    if (mergeType === 'MERGE_ACROSS') {
      for (let i = 0; i < this.getNumRows(); i++) {
        const rowRange = this.offset(i, 0, 1, this.getNumColumns());
        requests.push({
          mergeCells: { range: makeSheetsGridRange(rowRange), mergeType: 'MERGE_ROWS' },
        });
      }
    } else if (mergeType === 'MERGE_VERTICALLY') {
      for (let i = 0; i < this.getNumColumns(); i++) {
        const colRange = this.offset(0, i, this.getNumRows(), 1);
        requests.push({
          mergeCells: { range: makeSheetsGridRange(colRange), mergeType: 'MERGE_COLUMNS' },
        });
      }
    } else { // MERGE_ALL
      requests.push({
        mergeCells: { range: makeSheetsGridRange(this), mergeType: 'MERGE_ALL' },
      });
    }

    if (requests.length > 0) {
      batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests });
    }
    return this;
  }

  merge() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.merge");
    if (nargs) matchThrow();
    return this.__merge('MERGE_ALL');
  }

  mergeAcross() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.mergeAcross");
    if (nargs) matchThrow();
    return this.__merge('MERGE_ACROSS');
  }

  moveTo(target) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.moveTo");
    if (nargs !== 1 || !isRange(target)) matchThrow();

    const request = {
      cutPaste: {
        source: makeSheetsGridRange(this),
        destination: {
          sheetId: target.getSheet().getSheetId(),
          rowIndex: target.getRow() - 1,
          columnIndex: target.getColumn() - 1,
        },
        pasteType: 'PASTE_NORMAL', // Moves values, formats, etc.
      },
    };

    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests: [request] });
    // The docs don't specify a return, but returning `this` is standard for mutator methods.
    // Note: The original range object is now invalid as its contents have moved.
    return this;
  }

  mergeVertically() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.mergeVertically");
    if (nargs) matchThrow();
    return this.__merge('MERGE_VERTICALLY');
  }

  breakApart() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.breakApart");
    if (nargs) matchThrow();

    const request = {
      unmergeCells: {
        range: makeSheetsGridRange(this),
      },
    };

    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests: [request] });
    return this;
  }

  autoFill(destination, series) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.autoFill");
    if (nargs !== 2 || !isRange(destination) || !isEnum(series)) matchThrow();

    const sourceGrid = this.__gridRange;
    const destGrid = makeGridRange(destination);

    // Validate destination contains source
    if (destGrid.sheetId !== sourceGrid.sheetId ||
      destGrid.startRowIndex > sourceGrid.startRowIndex ||
      destGrid.endRowIndex < sourceGrid.endRowIndex ||
      destGrid.startColumnIndex > sourceGrid.startColumnIndex ||
      destGrid.endColumnIndex < sourceGrid.endColumnIndex) {
      throw new Error('The destination range must contain the source range.');
    }

    const extendsDown = destGrid.startRowIndex === sourceGrid.startRowIndex && destGrid.endRowIndex > sourceGrid.endRowIndex;
    const extendsUp = destGrid.endRowIndex === sourceGrid.endRowIndex && destGrid.startRowIndex < sourceGrid.startRowIndex;
    const extendsRight = destGrid.startColumnIndex === sourceGrid.startColumnIndex && destGrid.endColumnIndex > sourceGrid.endColumnIndex;
    const extendsLeft = destGrid.endColumnIndex === sourceGrid.endColumnIndex && destGrid.startColumnIndex < sourceGrid.startColumnIndex;

    const sameCols = destGrid.startColumnIndex === sourceGrid.startColumnIndex && destGrid.endColumnIndex === sourceGrid.endColumnIndex;
    const sameRows = destGrid.startRowIndex === sourceGrid.startRowIndex && destGrid.endRowIndex === sourceGrid.endRowIndex;

    let dimension;
    let fillLength;

    if (extendsDown && sameCols) {
      dimension = 'ROWS';
      fillLength = destGrid.endRowIndex - sourceGrid.endRowIndex;
    } else if (extendsUp && sameCols) {
      dimension = 'ROWS';
      fillLength = -(sourceGrid.startRowIndex - destGrid.startRowIndex);
    } else if (extendsRight && sameRows) {
      dimension = 'COLUMNS';
      fillLength = destGrid.endColumnIndex - sourceGrid.endColumnIndex;
    } else if (extendsLeft && sameRows) {
      dimension = 'COLUMNS';
      fillLength = -(sourceGrid.startColumnIndex - destGrid.startColumnIndex);
    } else {
      throw new Error('AutoFill destination range must extend the source range in only one direction.');
    }

    const request = {
      autoFill: {
        sourceAndDestination: {
          source: makeSheetsGridRange(this),
          dimension: dimension,
          fillLength: fillLength,
        },
        useAlternateSeries: series.toString() === 'ALTERNATE_SERIES',
      },
    };

    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests: [request] });
    return this;
  }

  autoFillToNeighbor(series) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.autoFillToNeighbor");
    if (nargs !== 1 || !isEnum(series)) matchThrow();

    const sheet = this.getSheet();
    const sourceRows = this.getNumRows();
    const sourceCols = this.getNumColumns();
    const startRow = this.getRow();
    const endRow = this.getLastRow();
    const startCol = this.getColumn();
    const endCol = this.getLastColumn();

    // The live API for autoFillToNeighbor only appears to support vertical fills,
    // looking at data in columns to the left and right.
    if (this.getNumColumns() > this.getNumRows()) {
      // If the range is wider than it is tall, it's likely intended for horizontal fill, which is not supported.
      // The live API does nothing in this case, so we return `this`.
      return this;
    }

    let neighborLastRow = 0;
    const maxRows = sheet.getMaxRows();

    // Check column to the left
    if (startCol > 1) {
      const lastDataCell = sheet.getRange(maxRows, startCol - 1).getNextDataCell(Direction.UP);
      if (lastDataCell.getValue() !== '') neighborLastRow = Math.max(neighborLastRow, lastDataCell.getRow());
    }
    // Check column to the right
    if (endCol < sheet.getMaxColumns()) {
      const lastDataCell = sheet.getRange(maxRows, endCol + 1).getNextDataCell(Direction.UP);
      if (lastDataCell.getValue() !== '') neighborLastRow = Math.max(neighborLastRow, lastDataCell.getRow());
    }

    if (neighborLastRow <= endRow) {
      return this; // No neighbor data to fill towards, or neighbor is shorter.
    }

    const destinationRange = sheet.getRange(startRow, startCol, neighborLastRow - startRow + 1, sourceCols);

    return this.autoFill(destinationRange, series);
  }

  addDeveloperMetadata(key, value, visibility) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.addDeveloperMetadata");
    if (nargs < 1 || nargs > 3) matchThrow();
    if (!is.string(key)) matchThrow();

    const sheet = this.getSheet();
    const maxRows = sheet.getMaxRows();
    const maxCols = sheet.getMaxColumns();

    const isEntireRow = this.getNumRows() === 1 && this.getColumn() === 1 && this.getNumColumns() === maxCols;
    const isEntireColumn = this.getNumColumns() === 1 && this.getRow() === 1 && this.getNumRows() === maxRows;

    if (!isEntireRow && !isEntireColumn) {
      throw new Error('Adding developer metadata to arbitrary ranges is not currently supported. ' +
        'Developer metadata may only be added to the top-level spreadsheet, an individual sheet, ' +
        'or an entire row or column.');
    }

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

    // Per documentation, if the range is a single column (and not a single cell), metadata is attached to the column.
    // Otherwise, it's attached to the first row.
    const dimension = isEntireColumn ? 'COLUMNS' : 'ROWS';
    const startIndex = dimension === 'ROWS' ? this.getRow() - 1 : this.getColumn() - 1;
    const endIndex = startIndex + (dimension === 'ROWS' ? this.getNumRows() : this.getNumColumns());

    const metadata = {
      metadataKey: key,
      metadataValue: realValue,
      visibility: realVisibility.toString(),
      location: {
        dimensionRange: {
          sheetId: this.getSheet().getSheetId(),
          dimension: dimension,
          startIndex: startIndex,
          endIndex: endIndex,
        },
      },
    };

    const request = {
      createDeveloperMetadata: {
        developerMetadata: metadata,
      },
    };

    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests: [request] });
    return this;
  }

  createDeveloperMetadataFinder() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.createDeveloperMetadataFinder");
    if (nargs) matchThrow();
    return newFakeDeveloperMetadataFinder(this);
  }

  collapseGroups() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.collapseGroups");
    if (nargs) matchThrow();
    const sheet = this.getSheet();
    const spreadsheet = sheet.getParent();
    const spreadsheetId = spreadsheet.getId();
    const sheetId = sheet.getSheetId();

    // Get all groups for the entire spreadsheet to find the ones on our sheet.
    const meta = spreadsheet.__getMetaProps('sheets(properties.sheetId,rowGroups(range,depth,collapsed),columnGroups(range,depth,collapsed))');
    const sheetMeta = meta.sheets.find(s => s.properties.sheetId === sheetId);

    if (!sheetMeta) return this;

    const allGroups = [
      ...(sheetMeta.rowGroups || []).map(g => ({ ...g, dimension: g.range.dimension })),
      ...(sheetMeta.columnGroups || []).map(g => ({ ...g, dimension: g.range.dimension }))
    ];

    const thisGridRange = this.__gridRange;

    // Find groups wholly contained within the range
    const whollyContainedGroups = allGroups.filter(group => {
      const groupRange = group.range;
      if (groupRange.sheetId !== sheetId) return false;
      const dim = group.dimension;
      const thisStart = dim === 'ROWS' ? thisGridRange.startRowIndex : thisGridRange.startColumnIndex;
      const thisEnd = dim === 'ROWS' ? thisGridRange.endRowIndex : thisGridRange.endColumnIndex;
      return groupRange.startIndex >= thisStart && groupRange.endIndex <= thisEnd;
    });

    let groupsToCollapse = [];
    if (whollyContainedGroups.length > 0) {
      // Per observed behavior, only collapse the outermost groups in the selection.
      const minDepth = Math.min(...whollyContainedGroups.map(g => g.depth));
      groupsToCollapse = whollyContainedGroups.filter(g => g.depth === minDepth);
    } else {
      // "If no group is fully within the range, the deepest expanded group that is partially within the range is collapsed."
      const intersectingGroups = allGroups.filter(group => {
        const groupRange = group.range;
        if (groupRange.sheetId !== sheetId) return false;
        const dim = group.dimension;
        const thisStart = dim === 'ROWS' ? thisGridRange.startRowIndex : thisGridRange.startColumnIndex;
        const thisEnd = dim === 'ROWS' ? thisGridRange.endRowIndex : thisGridRange.endColumnIndex;
        return Math.max(thisStart, groupRange.startIndex) < Math.min(thisEnd, groupRange.endIndex);
      });

      const expandedIntersecting = intersectingGroups.filter(g => !g.collapsed);
      if (expandedIntersecting.length > 0) {
        const maxDepth = Math.max(...expandedIntersecting.map(g => g.depth));
        const deepestGroup = expandedIntersecting.find(g => g.depth === maxDepth);
        if (deepestGroup) {
          groupsToCollapse.push(deepestGroup);
        }
      }
    }

    if (groupsToCollapse.length === 0) return this;

    const requests = groupsToCollapse.map(group => ({
      updateDimensionGroup: {
        dimensionGroup: {
          range: group.range,
          depth: group.depth,
          collapsed: true,
        },
        fields: 'collapsed',
      },
    }));

    batchUpdate({ spreadsheet, requests });
    return this;
  }

  expandGroups() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.expandGroups");
    if (nargs) matchThrow();

    const sheet = this.getSheet();
    const spreadsheet = sheet.getParent();
    const sheetId = sheet.getSheetId();

    const meta = spreadsheet.__getMetaProps('sheets(properties.sheetId,rowGroups(range,depth,collapsed),columnGroups(range,depth,collapsed))');
    const sheetMeta = meta.sheets.find(s => s.properties.sheetId === sheetId);
    if (!sheetMeta) return this;

    const allGroups = [
      ...(sheetMeta.rowGroups || []).map(g => ({ ...g, dimension: g.range.dimension })),
      ...(sheetMeta.columnGroups || []).map(g => ({ ...g, dimension: g.range.dimension }))
    ];

    const thisGridRange = this.__gridRange;

    // "Expands the collapsed groups whose range or control toggle intersects with this range."
    const intersectingGroups = allGroups.filter(group => {
      const groupRange = group.range;
      if (groupRange.sheetId !== sheetId) return false;
      const dim = group.dimension;
      const thisStart = dim === 'ROWS' ? thisGridRange.startRowIndex : thisGridRange.startColumnIndex;
      const thisEnd = dim === 'ROWS' ? thisGridRange.endRowIndex : thisGridRange.endColumnIndex;
      return Math.max(thisStart, groupRange.startIndex) < Math.min(thisEnd, groupRange.endIndex);
    });

    // Per observed behavior, expand all intersecting groups that are currently collapsed.
    const groupsToExpand = intersectingGroups.filter(g => g.collapsed);

    if (groupsToExpand.length === 0) return this;

    const requests = groupsToExpand.map(group => ({
      updateDimensionGroup: {
        dimensionGroup: {
          range: group.range,
          depth: group.depth,
          collapsed: false,
        },
        fields: 'collapsed',
      },
    }));

    batchUpdate({ spreadsheet, requests });
    return this;
  }

  __shiftGroupDepth(dimension, delta) {
    const { nargs, matchThrow } = signatureArgs([delta], `Range.shift${dimension === 'ROWS' ? 'Row' : 'Column'}GroupDepth`);
    if (nargs !== 1 || !is.integer(delta)) matchThrow();
    if (delta === 0) return this;

    const gridRange = this.__gridRange;
    const dimensionRange = {
      sheetId: this.getSheet().getSheetId(),
      dimension: dimension,
      startIndex: dimension === 'ROWS' ? gridRange.startRowIndex : gridRange.startColumnIndex,
      endIndex: dimension === 'ROWS' ? gridRange.endRowIndex : gridRange.endColumnIndex,
    };

    const requestType = delta > 0 ? 'addDimensionGroup' : 'deleteDimensionGroup';
    const requestBody = { range: dimensionRange };

    const requests = Array.from({ length: Math.abs(delta) }, () => ({
      [requestType]: requestBody,
    }));

    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests });
    return this;
  }

  shiftRowGroupDepth(delta) {
    return this.__shiftGroupDepth('ROWS', delta);
  }

  shiftColumnGroupDepth(delta) {
    return this.__shiftGroupDepth('COLUMNS', delta);
  }

  getDeveloperMetadata() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.getDeveloperMetadata");
    if (nargs) matchThrow();
    // Per documentation, this is an exact match search, not an intersecting one.
    return this.createDeveloperMetadataFinder().find();
  }

  applyRowBanding(bandingTheme, header, footer) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.applyRowBanding");
    if (nargs > 3) matchThrow();
    if (nargs >= 1 && !is.undefined(bandingTheme) && !isEnum(bandingTheme)) matchThrow();
    if (nargs >= 2 && !is.undefined(header) && !is.boolean(header)) matchThrow();
    if (nargs >= 3 && !is.undefined(footer) && !is.boolean(footer)) matchThrow();

    return this.__applyBanding({
      dimension: 'ROWS',
      bandingTheme,
      header,
      footer
    });
  }

  applyColumnBanding(bandingTheme, header, footer) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.applyColumnBanding");
    if (nargs > 3) matchThrow();
    if (nargs >= 1 && !is.undefined(bandingTheme) && !isEnum(bandingTheme)) matchThrow();
    if (nargs >= 2 && !is.undefined(header) && !is.boolean(header)) matchThrow();
    if (nargs >= 3 && !is.undefined(footer) && !is.boolean(footer)) matchThrow();

    return this.__applyBanding({
      dimension: 'COLUMNS',
      bandingTheme,
      header,
      footer
    });
  }

  __applyBanding({ dimension, bandingTheme, header, footer }) {
    const themeName = bandingTheme ? bandingTheme.toString() : 'LIGHT_GREY';
    const theme = bandingThemeMap[themeName] || bandingThemeMap.LIGHT_GREY;

    const bandedRange = Sheets.newBandedRange().setRange(makeSheetsGridRange(this));
    const properties = Sheets.newBandingProperties();

    if (header) properties.setHeaderColorStyle(theme.header);
    if (footer) properties.setFooterColorStyle(theme.footer);

    properties.setFirstBandColorStyle(theme.first);
    properties.setSecondBandColorStyle(theme.second);

    if (dimension === 'ROWS') {
      bandedRange.setRowProperties(properties);
    } else {
      bandedRange.setColumnProperties(properties);
    }

    const request = { addBanding: { bandedRange } };
    const response = batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests: [request] });
    const newBandedRange = response.replies[0].addBanding.bandedRange;
    return newFakeBanding(newBandedRange, this.getSheet());
  }

  getBandings() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.getBandings");
    if (nargs > 0) matchThrow();
    const sheet = this.getSheet();
    const sheetMeta = sheet.getParent().__getMetaProps(`sheets(bandedRanges,properties.sheetId)`);
    const thisSheetMeta = sheetMeta.sheets.find(s => s.properties.sheetId === sheet.getSheetId());
    const allBandingsOnSheet = thisSheetMeta.bandedRanges || [];
    const thisGridRange = makeGridRange(this);
    const intersectingBandings = allBandingsOnSheet.filter(b => b.range.sheetId === thisGridRange.sheetId && Math.max(0, Math.min(thisGridRange.endColumnIndex, b.range.endColumnIndex) - Math.max(thisGridRange.startColumnIndex, b.range.startColumnIndex)) > 0 && Math.max(0, Math.min(thisGridRange.endRowIndex, b.range.endRowIndex) - Math.max(thisGridRange.startRowIndex, b.range.startRowIndex)) > 0);
    return intersectingBandings.map(b => newFakeBanding(b, sheet));
  }

  /**
   * canEdit() https://developers.google.com/apps-script/reference/spreadsheet/range#canedit
   * Determines whether the user has permission to edit every cell in the range. The spreadsheet owner is always able to edit protected ranges and sheets.
   * @returns {boolean}
   */
  canEdit() {

    // we'll need to use the Drive API to get the permissions
    const owner = this.__getSpreadsheet().getOwner()
    const user = Session.getEffectiveUser()

    // the owner ? - can do anything
    if (user.getEmail() === owner.getEmail()) return true

    // edit privileges ? if yes then see if the range is protected
    const editors = this.__getSpreadsheet().getEditors()
    if (!editors.find(f => f.getEmail() === user.getEmail())) return null


  }
  __clear(fields) {

    const range = makeSheetsGridRange(this)
    const requests = [{
      updateCells: Sheets.newUpdateCellsRequest().setFields(fields).setRange(range)
    }]

    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests });
    return this
  }
  /**
   * clears  (notes) 
   * @returns {FakeSheetRange} self
   */
  clearNote() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.clearNote")
    if (nargs) matchThrow()
    return this.__clear("note")
  }
  /**
   * clears  (values) 
   * @returns {FakeSheetRange} self
   */
  clearContent() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.clearContent")
    if (nargs) matchThrow()
    return this.__clear("userEnteredValue")
  }
  /**
   * clears  (format) 
   * @returns {FakeSheetRange} self
   */
  clearFormat() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.clearFormat")
    if (nargs) matchThrow()
    return this.__clear("userEnteredFormat")
  }

  /**
   * clears evertything (notes,formats,values,datavalidations) (except comments)
   * @returns {FakeSheetRange} self
   */
  clear(options) {
    // options is optional
    // 
    // TODO
    /* 
commentsOnly	Boolean	Whether to clear only the comments.
contentsOnly	Boolean	Whether to clear only the contents.
formatOnly	Boolean	Whether to clear only the format; note that clearing format also clears data validation rules.
validationsOnly	Boolean	Whether to clear only data validation rules.
skipFilteredRows	Boolean	Whether to avoid clearing filtered rows.
*/

    const { nargs, matchThrow } = signatureArgs(arguments, "Sheet.clear");
    if (nargs > 1 || (nargs === 1 && !is.object(options) && !is.undefined(options))) matchThrow();
    if (nargs === 1 && !is.undefined(options)) {
      if (!Reflect.ownKeys(options).every(f => ['contentsOnly', 'formatOnly'].includes(f))) matchThrow()
    }
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


  /**
   * insertCells(shiftDimension) https://developers.google.com/apps-script/reference/spreadsheet/range#insertcellsshiftdimension
   * Inserts a blank cell or cells into the range, shifting other cells to accommodate the new cells.
   * @param {Dimension} shiftDimension The dimension to shift the cells.
   * @returns {FakeSheetRange} self
   */
  insertCells(shiftDimension) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.insertCells");
    if (nargs !== 1 || !isEnum(shiftDimension)) matchThrow();

    const request = Sheets.newInsertRangeRequest()
      .setRange(makeSheetsGridRange(this))
      .setShiftDimension(shiftDimension.toString());

    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests: [{ insertRange: request }] });

    return this;
  }

  /**
   * createFilter() https://developers.google.com/apps-script/reference/spreadsheet/range#createfilter
   * Creates a new filter and applies it to the range.
   * @returns {FakeFilter}
   */
  createFilter() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.createFilter");
    if (nargs) matchThrow();

    const sheet = this.getSheet();
    if (sheet.getFilter()) {
      throw new Error("You can't create a filter in a sheet that already has a filter.");
    }

    const request = {
      setBasicFilter: {
        filter: {
          range: makeSheetsGridRange(this)
        }
      }
    };

    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests: [request] });
    return sheet.getFilter();
  }
  clearDataValidations() {
    this.setDataValidations(null)
    return this
  }


  /**
   * createPivotTable(sourceData) https://developers.google.com/apps-script/reference/spreadsheet/range#createpivottablesourcedata
   * Creates a new pivot table from a data source range.
   * @param {FakeSheetRange} sourceData The range of data to use for the pivot table.
   * @returns {FakePivotTable} The new pivot table.
   */
  createPivotTable(sourceData) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.createPivotTable");
    if (nargs !== 1 || !isRange(sourceData)) matchThrow();

    const sheet = this.getSheet();
    const spreadsheet = this.__getSpreadsheet();

    // The pivot table is created at the top-left cell of `this` range.
    const anchorCell = this.offset(0, 0, 1, 1);

    const pivotTableApiObject = {
      source: makeSheetsGridRange(sourceData),
      valueLayout: 'HORIZONTAL', // Default layout
    };

    const cellData = Sheets.newCellData().setPivotTable(pivotTableApiObject);
    const rowData = Sheets.newRowData().setValues([cellData]);

    const updateCellsRequest = Sheets.newUpdateCellsRequest()
      .setStart({
        sheetId: anchorCell.getSheet().getSheetId(),
        rowIndex: anchorCell.getRow() - 1,
        columnIndex: anchorCell.getColumn() - 1
      })
      .setRows([rowData])
      .setFields('pivotTable');

    batchUpdate({ spreadsheet, requests: [{ updateCells: updateCellsRequest }] });

    const pivotTables = sheet.getPivotTables();
    const newPivotTable = pivotTables.find(pt => pt.getAnchorCell().getA1Notation() === anchorCell.getA1Notation());

    if (!newPivotTable) {
      throw new Error('Failed to create or find pivot table after update.');
    }

    return newPivotTable;
  }

  getFilter() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.getFilter");
    if (nargs) matchThrow();

    const sheetFilter = this.getSheet().getFilter();
    if (!sheetFilter) {
      return null;
    }

    // Per live testing, any range on a sheet with a filter will return that filter.
    return sheetFilter;
  }

  /**
   * deleteCells(shiftDimension) https://developers.google.com/apps-script/reference/spreadsheet/range#deletecellsshiftdimension
   * Deletes the cells in the range, shifting the remaining cells into the space formerly occupied by the deleted cells.
   * @param {Dimension} shiftDimension The dimension from which deleted cells will be replaced with.
   * @returns {FakeSheetRange} self
   */
  deleteCells(shiftDimension) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.deleteCells");
    if (nargs !== 1 || !isEnum(shiftDimension)) matchThrow();

    const request = Sheets.newDeleteRangeRequest()
      .setRange(makeSheetsGridRange(this))
      .setShiftDimension(shiftDimension.toString());

    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests: [{ deleteRange: request }] });

    return this;
  }

  /**
   * copyTo(destination, copyPasteType, transposed)
   * Copies the data from a range of cells to another range of cells.
   * https://developers.google.com/apps-script/reference/spreadsheet/range#copytodestination,-copypastetype,-transposed
   * @param {FakeSheetRange} destination 	A destination range to copy to; only the top-left cell position is relevant.
   * @param {CopyPasteType||object} [copyPasteTypeOrOptions] enum SpreadsheetApp.enum A type that specifies how the range contents are pasted to the destination or options
   * @param {boolean} [transposed] Whether the range should be pasted in its transposed orientation.
   */
  copyTo(destination, copyPasteTypeOrOptions, transposed) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.copyTo")
    if (nargs < 1 || nargs > 3) matchThrow()
    if (!isRange(destination)) matchThrow()

    // set the defaults
    const copyPaste = Sheets.newCopyPasteRequest()
      .setPasteType("PASTE_NORMAL")
      .setPasteOrientation("NORMAL")

    // the second argument can be with options (modern) or enum + transpose
    if (nargs > 1) {
      // we had an old style variant
      if (isEnum(copyPasteTypeOrOptions)) {
        copyPaste.setPasteType(copyPasteTypeOrOptions.toString())
        if (nargs > 2) {
          if (!is.boolean(transposed)) matchThrow()
          copyPaste.setPasteOrientation(transposed ? "TRANSPOSE" : "NORMAL")
        }
      } else {
        // modern signature with options
        if (nargs !== 2 || !is.object(copyPasteTypeOrOptions)) matchThrow()
        if (Reflect.ownKeys(copyPasteTypeOrOptions).length !== 1) matchThrow()
        if (copyPasteTypeOrOptions.contentsOnly) copyPaste.setPasteType("PASTE_VALUES")
        else if (copyPasteTypeOrOptions.formatOnly) copyPaste.setPasteType("PASTE_FORMAT")
        else matchThrow()

      }
    }

    copyPaste
      .setDestination(
        makeSheetsGridRange(destination)
      )
      .setSource(makeSheetsGridRange(this))


    const requests = [{ copyPaste }];
    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests });

    return this;

  }


  __copyToRange(pasteType, gridIdOrSheet, column, columnEnd, row, rowEnd) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.copytorange")
    if (nargs !== 6) matchThrow()
    const args = Array.from(arguments)
    if (!args.slice(2).every(f => is.integer(f) && is.positiveNumber(f))) matchThrow()
    if (!is.integer(gridIdOrSheet) && !(is.object(gridIdOrSheet) && gridIdOrSheet.toString() === "Sheet")) matchThrow()


    // this is the behavior observed - different than docs
    /*
    So to complete the tests, this time with the Advanced sheets API - we can see it behaves in exactly the same way as he apps script service-
 
    if the target range is less than the source range, it will always copy all of the source range and never truncate.
    if the target range is greater that the source rang eit will duplicate all of the source range as many times as will fit - but never duplicate and truncate - so if the source range is 3 wide and the tharget range is 5 wide it will only copy the 3 columns. If the target is 7 wide, it will duplicate the source twice, making 6 columns. And ignore the 7th column.
    there's no need to do anything special here as the sheets api behave the same way as the apps script ervice
    */
    const targetGrid = sortOutGridForCopy(gridIdOrSheet, column, columnEnd, row, rowEnd)
    const sourceGrid = makeGridRange(this)

    const copyPaste = Sheets.newCopyPasteRequest()
      .setSource(sourceGrid)
      .setPasteType(pasteType)
      .setDestination(targetGrid)
      .setPasteOrientation("NORMAL")

    const requests = [{
      copyPaste
    }]
    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests });
    return this
  }

  /**
   * copyValuesToRange(gridId, column, columnEnd, row, rowEnd)  https://developers.google.com/apps-script/reference/spreadsheet/range#copyvaluestorangegridid,-column,-columnend,-row,-rowend
   * Copy the content of the range to the given location. If the destination is larger or smaller than the source range then the source is repeated or truncated accordingly.
   * @param {integer|Sheet} gridIdOrSheet	Integer	The unique ID of the sheet within the spreadsheet, irrespective of position or the sheet it is on
   * @param {integer} column 	The first column of the target range.
   * @param {integer} columnEnd	The end column of the target range.
   * @param {integer} row The start row of the target range.
   * @param {integer} rowEnd The end row of the target range.
   * @return {FakeSheetRange} self
   */
  copyValuesToRange(gridIdOrSheet, column, columnEnd, row, rowEnd) {
    return this.__copyToRange("PASTE_VALUES", gridIdOrSheet, column, columnEnd, row, rowEnd)
  }

  copyFormatToRange(gridIdOrSheet, column, columnEnd, row, rowEnd) {
    return this.__copyToRange("PASTE_FORMAT", gridIdOrSheet, column, columnEnd, row, rowEnd)
  }


  /**
   * protect() https://developers.google.com/apps-script/reference/spreadsheet/sheet#protect
   * Creates an object that can protect the sheet from being edited except by users who have permission.
   * @return {FakeProtection}
   */
  protect() {
    return newFakeProtection(SpreadsheetApp.ProtectionType.RANGE, this)
  }

  getA1Notation() {
    // For ranges created via getRange(a1Notation), this.__a1Notation is the most reliable source,
    // especially for unbounded ranges, as the underlying grid parsing can be buggy.
    if (this.__a1Notation) {
      const a1 = this.__a1Notation.split('!').pop();

      // Handle row-only ranges like "5:7" or inverted "7:5"
      const rowMatch = a1.match(/^(\d+):(\d+)$/);
      if (rowMatch) {
        let start = parseInt(rowMatch[1], 10);
        let end = parseInt(rowMatch[2], 10);
        if (start > end) [start, end] = [end, start];
        return `${start}:${end}`;
      }

      // Handle column-only ranges like "D:F" or inverted "F:D"
      const colMatch = a1.match(/^([A-Z]+):([A-Z]+)$/i);
      if (colMatch) {
        const col1 = colMatch[1].toUpperCase();
        const col2 = colMatch[2].toUpperCase();
        // Simple sort for columns: shorter one is smaller, then alphabetical
        if (col1.length > col2.length || (col1.length === col2.length && col1 > col2)) {
          return `${col2}:${col1}`;
        }
        return `${col1}:${col2}`;
      }

      // Handle single cells with $ like "$C$3"
      const singleCellMatch = a1.match(/^\$?([A-Z]+)\$?(\d+)$/i);
      if (singleCellMatch) {
        return `${singleCellMatch[1].toUpperCase()}${singleCellMatch[2]}`;
      }
    }

    // Fallback for ranges created by other means (e.g., offset) or simple bounded ranges
    if (this.__hasGrid) {
      const grid = this.__gridRange; // Use the getter to ensure it's expanded
      return SheetUtils.toRange(grid.startRowIndex + 1, grid.startColumnIndex + 1, grid.endRowIndex, grid.endColumnIndex);
    }

    // Default fallback
    return this.__a1Notation ? this.__a1Notation.split('!').pop() : "";
  }

  /**
   * Returns true if the range has a starting row index.
   * @returns {boolean}
   */
  isStartRowBounded() {
    return Reflect.has(this.__apiGridRange, 'startRowIndex');
  }

  /**
   * Returns true if the range has an ending row index.
   * @returns {boolean}
   */
  isEndRowBounded() {
    return Reflect.has(this.__apiGridRange, 'endRowIndex');
  }

  /**
   * Returns true if the range has a starting column index.
   * @returns {boolean}
   */
  isStartColumnBounded() {
    return Reflect.has(this.__apiGridRange, 'startColumnIndex');
  }

  /**
   * Returns true if the range has an ending column index.
   * @returns {boolean}
   */
  isEndColumnBounded() {
    return Reflect.has(this.__apiGridRange, 'endColumnIndex');
  }


  /**
   * these 2 dont exist in the documentation any more - assume they have been renamed as getBackground(s)
   */
  getBackgroundColor() {
    return this.getBackground()
  }
  getBackgroundColors() {
    return this.getBackgrounds()
  }

  /**
   * getCell(row, column) Returns a given cell within a range.
   * @param {number} row 1 based cell relative to range
   * @param {number} column 1 based cell relative to range
   * @return {FakeSheetRange}
   */
  getCell(row, column) {
    // let offset check args
    return this.offset(row - 1, column - 1, 1, 1)
  }
  getColumn() {
    return this.__gridRange.startColumnIndex + 1
  }
  getColumnIndex() {
    return this.getColumn()
  }


  getEndColumn() {
    return this.__gridRange.endColumnIndex + 1
  }
  getEndRow() {
    return this.__gridRange.endRowIndex + 1
  }

  /**
   * getGridId() https://developers.google.com/apps-script/reference/spreadsheet/range#getgridid
   * Returns the grid ID of the range's parent sheet. IDs are random non-negative int values.
   * gridid seems to be the same as the sheetid 
   * @returns {number}
   */
  getGridId() {
    return this.getSheet().getSheetId()
  }
  /**
   * getHeight() https://developers.google.com/apps-script/reference/spreadsheet/range#getheight
   * appears to be the same as getNumRows()
   * Returns the height of the range.
   * @returns {number} 
   */
  getHeight() {
    return this.getNumRows()
  }

  getLastColumn() {
    return this.__gridRange.endColumnIndex
  }
  getLastRow() {
    return this.__gridRange.endRowIndex
  }

  getNumColumns() {
    return this.__gridRange.endColumnIndex - this.__gridRange.startColumnIndex
  }
  getNumRows() {
    return this.__gridRange.endRowIndex - this.__gridRange.startRowIndex
  }
  getRow() {
    return this.__gridRange.startRowIndex + 1
  }
  // row and columnindex are probably now deprecated in apps script
  // in any case, in gas they currently return the 1 based value, not the 0 based value as you'd expect
  // so the same as the getrow and getcolumn
  getRowIndex() {
    return this.getRow()
  }
  getSheet() {
    return this.__sheet
  }

  /**
   * getWidth() https://developers.google.com/apps-script/reference/spreadsheet/range#getwidth
   * appears to be the same as getNumColumns()
   * Returns the width of the range in columns.
   * @returns {number} 
   */
  getWidth() {
    return this.getNumColumns()
  }

  /**
   * offset(rowOffset, columnOffset) https://developers.google.com/apps-script/reference/spreadsheet/range#offsetrowoffset,-columnoffset
   * Returns a new range that is offset from this range by the given number of rows and columns (which can be negative). 
   * The new range is the same size as the original range.
   * offsets are zero based
   * @param {number} rowOffset 
   * @param {number} columnOffset 
   * @param {number} numRows 
   * @param {number} numColumns 
   * @returns 
   */
  offset(rowOffset, columnOffset, numRows, numColumns) {
    // get arg types
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.offset")

    // basic signature tests
    if (nargs > 4 || nargs < 2) matchThrow()
    if (!is.integer(rowOffset) || !is.integer(columnOffset)) matchThrow()
    if (nargs > 2 && !is.integer(numRows)) matchThrow()
    if (nargs > 3 && !is.integer(numColumns)) matchThrow()
    const gr = { ...this.__gridRange }

    numColumns = is.undefined(numColumns) ? this.getNumColumns() : numColumns
    numRows = is.undefined(numRows) ? this.getNumRows() : numRows

    if (!numRows) {
      throw new Error('The number of rows in the range must be at least 1')
    }
    if (!numColumns) {
      throw new Error('The number of columns in the range must be at least 1')
    }
    gr.startRowIndex += rowOffset
    gr.startColumnIndex += columnOffset
    gr.endRowIndex = gr.startRowIndex + numRows
    gr.endColumnIndex = gr.startColumnIndex + numColumns

    return newFakeSheetRange(gr, this.getSheet())

  }
  /**
   * removeCheckboxes()
   * Removes all checkboxes from the range. Clears the data validation of each cell, and additionally clears its value if the cell contains either the checked or unchecked value.
   * @returns {FakeSheetRange}
   */
  removeCheckboxes() {
    // theres not an api method for this, we need to get all the data validations in the range, see if they are check boxes and batchupdate a series of things
    const dv = this.getDataValidations()
    if (!dv) return this

    // now get all the checkboxes and where they are
    const work = dv.map((row, rn) => row.map((cell, cn) => isACheckbox(cell) ? { rn, cn } : null)).flat().filter(f => f)
    if (!work.length) return

    const requests = work.map(f => ({
      setDataValidation: Sheets
        .newSetDataValidationRequest()
        .setRange(makeSheetsGridRange(this.offset(f.rn, f.cn, 1, 1)))
        .setRule(null)
    }))
    const clearRequests = work.map(f => ({
      updateCells: Sheets
        .newUpdateCellsRequest()
        .setFields('userEnteredValue')
        .setRange(makeSheetsGridRange(this.offset(f.rn, f.cn, 1, 1)))
    }))

    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests: requests.concat(clearRequests) });
    return this
  }

  /**
   * getDataRegion() https://developers.google.com/apps-script/reference/spreadsheet/range#getdataregion
   * Returns the data region for a given range. The data region is a range of cells that are considered contiguous and are bounded by empty cells.
   * @param {Dimension} [dimension] The dimension to search.
   * @returns {FakeSheetRange} The data region.
   */
  getDataRegion(dimension) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.getDataRegion");

    if (nargs > 1) matchThrow();
    if (nargs === 1 && !isEnum(dimension)) matchThrow();

    const sheet = this.getSheet();
    const maxRows = sheet.getMaxRows();
    const maxCols = sheet.getMaxColumns();
    const allValues = sheet.getRange(1, 1, maxRows, maxCols).getValues();

    const isCellBlank = (r, c) => {
      if (r < 0 || r >= maxRows || c < 0 || c >= maxCols) return true;
      if (r >= allValues.length || !allValues[r] || c >= allValues[r].length) return true;
      const val = allValues[r][c];
      return val === '' || val === null;
    };

    let searchR = -1;
    let searchC = -1;

    const startRow0 = this.getRow() - 1;
    const endRow0 = this.getLastRow() - 1;
    const startCol0 = this.getColumn() - 1;
    const endCol0 = this.getLastColumn() - 1;

    // 1. Search for a cell with data within the given range.
    for (let r = startRow0; r <= endRow0 && searchR === -1; r++) {
      for (let c = startCol0; c <= endCol0; c++) {
        if (!isCellBlank(r, c)) {
          searchR = r;
          searchC = c;
          break;
        }
      }
    }
    const wasStartingRangeBlank = searchR === -1;

    // 2. If no data in range, search the immediate border of the range.
    if (searchR === -1) {
      if (startRow0 > 0) for (let c = startCol0; c <= endCol0; c++) if (!isCellBlank(startRow0 - 1, c)) { searchR = startRow0 - 1; searchC = c; break }
      if (searchR === -1 && endRow0 < maxRows - 1) for (let c = startCol0; c <= endCol0; c++) if (!isCellBlank(endRow0 + 1, c)) { searchR = endRow0 + 1; searchC = c; break }
      if (searchR === -1 && startCol0 > 0) for (let r = startRow0; r <= endRow0; r++) if (!isCellBlank(r, startCol0 - 1)) { searchR = r; searchC = startCol0 - 1; break }
      if (searchR === -1 && endCol0 < maxCols - 1) for (let r = startRow0; r <= endRow0; r++) if (!isCellBlank(r, endCol0 + 1)) { searchR = r; searchC = endCol0 + 1; break }
    }

    // 3. If still no data found, the range is isolated.
    if (searchR === -1) {
      return this.offset(0, 0, 1, 1);
    }

    // 4. Iteratively expand from the found data cell to find the full contiguous region.
    let top = searchR; let bottom = searchR; let left = searchC; let right = searchC;
    let changed = true;
    while (changed) {
      changed = false;
      // expand up
      if (top > 0 && Array.from({ length: right - left + 1 }, (_, i) => left + i).some(c => !isCellBlank(top - 1, c))) { top--; changed = true; }
      // expand down
      if (bottom < maxRows - 1 && Array.from({ length: right - left + 1 }, (_, i) => left + i).some(c => !isCellBlank(bottom + 1, c))) { bottom++; changed = true; }
      // expand left
      if (left > 0 && Array.from({ length: bottom - top + 1 }, (_, i) => top + i).some(r => !isCellBlank(r, left - 1))) { left--; changed = true; }
      // expand right
      if (right < maxCols - 1 && Array.from({ length: bottom - top + 1 }, (_, i) => top + i).some(r => !isCellBlank(r, right + 1))) { right++; changed = true; }
    }

    if (!dimension) {
      if (wasStartingRangeBlank) {
        const unionTop = Math.min(startRow0, top);
        const unionLeft = Math.min(startCol0, left);
        const unionBottom = Math.max(endRow0, bottom);
        const unionRight = Math.max(endCol0, right);
        return sheet.getRange(unionTop + 1, unionLeft + 1, unionBottom - unionTop + 1, unionRight - left + 1);
      }
      return sheet.getRange(top + 1, left + 1, bottom - top + 1, right - left + 1);
    }

    if (dimension === SpreadsheetApp.Dimension.ROWS) {
      return sheet.getRange(top + 1, this.getColumn(), bottom - top + 1, this.getNumColumns());
    }

    if (dimension === SpreadsheetApp.Dimension.COLUMNS) {
      return sheet.getRange(this.getRow(), left + 1, this.getNumRows(), right - left + 1);
    }

    // should not be reached due to arg checks
    matchThrow();
  }
  /**
   * getNextDataCell(direction) https://developers.google.com/apps-script/reference/spreadsheet/range#getnextdatacelldirection
   * Returns the cell a given number of rows and columns away from the current cell.
   * @param {Direction} direction The direction from the current cell to find the next data cell.
   * @returns {FakeSheetRange} The next data cell.
   */
  getNextDataCell(direction) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.getNextDataCell");
    if (nargs !== 1 || !isEnum(direction)) matchThrow();

    const sheet = this.getSheet();
    const startCell = this.offset(0, 0, 1, 1);

    const findNextData = (arr, startIndex) => {
      const index = arr.slice(startIndex).findIndex(v => v !== '' && v !== null);
      return index === -1 ? -1 : startIndex + index;
    };
    const findNextBlank = (arr, startIndex) => {
      const index = arr.slice(startIndex).findIndex(v => v === '' || v === null);
      return index === -1 ? -1 : startIndex + index;
    };

    const getTargetOffset = (values) => {
      if (!values || values.length === 0) return 0;
      const isStartCellEmpty = (values[0] === '' || values[0] === null);

      if (isStartCellEmpty) {
        const nextDataIndex = findNextData(values, 0);
        return (nextDataIndex === -1) ? values.length - 1 : nextDataIndex;
      } else {
        if (values.length === 1) return 0; // At the edge of the sheet already
        const nextCellIsEmpty = (values[1] === '' || values[1] === null);
        if (nextCellIsEmpty) {
          const nextDataIndex = findNextData(values, 1);
          return (nextDataIndex === -1) ? values.length - 1 : nextDataIndex;
        } else {
          const firstBlankIndex = findNextBlank(values, 1);
          return (firstBlankIndex === -1) ? values.length - 1 : firstBlankIndex - 1;
        }
      }
    };

    const startRow = startCell.getRow();
    const startCol = startCell.getColumn();

    switch (direction) {
      case Direction.DOWN: {
        const maxRows = sheet.getMaxRows();
        if (startRow === maxRows) return startCell;
        const values = sheet.getRange(startRow, startCol, maxRows - startRow + 1, 1).getValues().flat();
        const offset = getTargetOffset(values);
        return sheet.getRange(startRow + offset, startCol);
      }

      case Direction.UP: {
        if (startRow === 1) return startCell;
        const values = sheet.getRange(1, startCol, startRow, 1).getValues().flat().reverse();
        const offset = getTargetOffset(values);
        return sheet.getRange(startRow - offset, startCol);
      }

      case Direction.NEXT: {
        const maxCols = sheet.getMaxColumns();
        if (startCol === maxCols) return startCell;
        const values = sheet.getRange(startRow, startCol, 1, maxCols - startCol + 1).getValues()[0];
        const offset = getTargetOffset(values);
        return sheet.getRange(startRow, startCol + offset);
      }

      case Direction.PREVIOUS: {
        if (startCol === 1) return startCell;
        const values = sheet.getRange(startRow, 1, 1, startCol).getValues()[0].reverse();
        const offset = getTargetOffset(values);
        return sheet.getRange(startRow, startCol - offset);
      }

      default:
        // Should be caught by isEnum check, but as a fallback.
        matchThrow();
    }
  }

  /**
   * check() https://developers.google.com/apps-script/reference/spreadsheet/range#check
   * Checks the checkbox data validation rule in the range. The range must be composed of cells with a checkbox data validation rule.
   * @returns {FakeSheetRange} self
   */
  check() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.check");
    if (nargs) matchThrow();
    return this.__checkUncheck(true);
  }

  /**
   * uncheck() https://developers.google.com/apps-script/reference/spreadsheet/range#uncheck
   * Unchecks the checkbox data validation rule in the range. The range must be composed of cells with a checkbox data validation rule.
   * @returns {FakeSheetRange} self
   */
  uncheck() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.uncheck");
    if (nargs) matchThrow();
    return this.__checkUncheck(false);
  }

  __checkUncheck(isChecked) {
    const validations = this.getDataValidations();
    if (!validations) return this;

    const requests = [];

    for (let r = 0; r < this.getNumRows(); r++) {
      for (let c = 0; c < this.getNumColumns(); c++) {
        const dv = validations[r][c];
        if (dv && isACheckbox(dv)) {
          const criteriaValues = dv.getCriteriaValues();
          const valueToSet = isChecked
            ? (criteriaValues && criteriaValues.length >= 1) ? criteriaValues[0] : true
            : (criteriaValues && criteriaValues.length === 2) ? criteriaValues[1] : false;

          const cellRange = this.offset(r, c, 1, 1);
          const cellData = Sheets.newCellData().setUserEnteredValue(makeExtendedValue(valueToSet));

          const ucr = Sheets.newUpdateCellsRequest()
            .setRange(makeSheetsGridRange(cellRange))
            .setFields('userEnteredValue')
            .setRows([Sheets.newRowData().setValues([cellData])]);

          requests.push({ updateCells: ucr });
        }
      }
    }

    if (requests.length > 0) {
      batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests });
    }

    return this;
  }
  /**
   * insertCheckboxes() https://developers.google.com/apps-script/reference/spreadsheet/range#insertcheckboxes
   * Inserts checkboxes into the range. If the range already has data validation, the data validation is removed.
   * @param {string} [checkedValue] The custom value for a checked box.
   * @param {string} [uncheckedValue] The custom value for an unchecked box.
   * @returns {FakeSheetRange} self
   */
  insertCheckboxes(checkedValue, uncheckedValue) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.insertCheckboxes");
    if (nargs > 2) matchThrow();

    const builder = SpreadsheetApp.newDataValidation();

    if (nargs === 0) {
      builder.requireCheckbox();
    } else if (nargs === 1) {
      builder.requireCheckbox(checkedValue);
    } else { // nargs === 2
      builder.requireCheckbox(checkedValue, uncheckedValue);
    }

    return this.setDataValidation(builder.build());
  }
  /**
   * randomize() https://developers.google.com/apps-script/reference/spreadsheet/range#randomize
   * Randomizes the order of the rows in the given range.
   */
  randomize() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.randomize")
    if (nargs) matchThrow()
    const request = Sheets.newRandomizeRangeRequest()
      .setRange(makeSheetsGridRange(this))
    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests: [{ randomizeRange: request }] });

    return this
  }
  /**
   * removeDuplicates()
   * https://developers.google.com/apps-script/reference/spreadsheet/range#removeduplicates
   * Removes rows within this range that contain values that are duplicates of values in any previous row.
   * @param {Integer[]}	[columnsToCompare]	The columns to analyze for duplicate values. If no columns are provided then all columns are analyzed for duplicates
   * @returns {FakeSheetRange} adjusted range after duplicates are removed
   */
  removeDuplicates(columnsToCompare) {

    const { nargs, matchThrow } = signatureArgs(arguments, "Range.removeDuplicates")

    if (nargs > 1) matchThrow()
    if (nargs) {

      if (!is.array(columnsToCompare)) matchThrow()
      if (!columnsToCompare.every(f => is.integer(f))) {
        matchThrow()
      }
      columnsToCompare.forEach(f => {
        if (f > this.getNumColumns() + this.getColumn() || f < this.getColumn()) {
          throw new Error(`Cell reference ${f} out of range for ${this.getA1Notation()}`)
        }
      })
    }

    const gridIndex = makeSheetsGridRange(this)
    const request = Sheets.newDeleteDuplicatesRequest()
      .setRange(gridIndex)

    if (columnsToCompare && columnsToCompare.length) {
      request.setComparisonColumns(columnsToCompare.map(f => ({
        dimension: "COLUMNS",
        startIndex: f - 1,
        endIndex: f,
        sheetId: this.getSheet().getSheetId()
      })))
    }
    const response = batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests: [{ deleteDuplicates: request }] });
    const reply = response?.replies && response.replies[0]
    if (reply) {
      const { duplicatesRemovedCount = 0 } = reply.deleteDuplicates
      return duplicatesRemovedCount ? this.offset(0, 0, this.getNumRows() - duplicatesRemovedCount, this.getNumColumns()) : this
    }
    return this
  }
  /**
   * Sets the background color of all cells in the range in CSS notation (such as '#ffffff' or 'white').
   * setBackground(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundcolor
   * @param {string} color A color code in CSS notation (such as '#ffffff' or 'white'); a null value resets the color.
   * @return {FakeSheetRange} self
   */
  setBackground(color) {
    return this.setBackgrounds(fillRange(this, color))
  }

  // these are undocumented, but appear to be aequivalent to setBackground
  setBackgroundColor(color) {
    return this.setBackground(color)
  }
  setBackgroundColors(colors) {
    return this.setBackgrounds(colors)
  }

  /**
   * setBackgroundRGB(red, green, blue) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundrgbred,-green,-blue
   * @returns {FakeSheetRange} self
   */
  setBackgroundRGB(red, green, blue) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setBackgroundRGB")
    if (nargs !== 3) matchThrow()
    if (outsideInt(red, 0, 255) || outsideInt(green, 0, 255) || outsideInt(blue, 0, 255)) matchThrow()
    return this.setBackground(rgbToHex(red / 255, green / 255, blue / 255))

  }
  /**
   * there is no 'setBorders' variant
   * setBorder(top, left, bottom, right, vertical, horizontal, color, style)
   * https://developers.google.com/apps-script/reference/spreadsheet/range#setbordertop,-left,-bottom,-right,-vertical,-horizontal,-color,-style
   * @param {Boolean} top		true for border, false for none, null for no change.
   * @param {Boolean} left		true for border, false for none, null for no change.
   * @param {Boolean} bottom	true for border, false for none, null for no change.
   * @param {Boolean} right	true for border, false for none, null for no change.
   * @param {Boolean} vertical true for internal vertical borders, false for none, null for no change.
   * @param {Boolean} horizontal	Boolean	true for internal horizontal borders, false for none, null for no change.
   * @param {Boolean}	[color] A color in CSS notation (such as '#ffffff' or 'white'), null for default color (black).
   * @param {Boolean} [SpreadsheetApp.BorderStyle]	A style for the borders, null for default style (solid).
   * @return {FakeSheetRange} self
   */
  setBorder(top, left, bottom, right, vertical, horizontal, color = null, style = null) {
    // there are 2 valid variants
    // one with each of the first 6 args
    // and another with all 8.
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setBorder")
    if (nargs < 6) matchThrow()
    // check first 6 args
    const args = Array.from(arguments).slice(0, 6)
    if (!args.every(f => is.boolean(f) || is.null(f))) matchThrow()

    // if we have some other number of args
    if (nargs > 6) {
      if (nargs !== 8) matchThrow()
      if (!is.string(color) && !is.null(color)) matchThrow()
      if (!is.null(style) && !isEnum(style)) matchThrow()
    }

    // note that null means leave as it is, and a boolean false means get rid of it
    // in the sheets api, null means get rid of it, and a missing value means leave as it is
    // width is not an option on Apps Script, so we can just do inner or outer
    const hex = is.string(color) ? normalizeColorStringToHex(color) : null;
    if (color && !is.null(color) && !hex) {
      throw new Error(`Invalid color string: "${color}"`);
    }
    const innerBorder = Sheets.newBorder()
      .setColor(is.null(hex) ? BLACKER : hexToRgb(hex))
      .setStyle(is.null(style) ? "SOLID" : style.toString())

    // construct the request
    const ubr = Sheets.newUpdateBordersRequest().setRange(makeSheetsGridRange(this))

      // if it's mentioned then we have to turn the border either off or on
      ;['top', 'left', 'bottom', 'right'].forEach((f, i) => {
        if (!is.null(args[i])) {
          ubr['set' + capital(f)](args[i] ? innerBorder : null)
        }
      })

    // finally the vertical and horizontals
    if (!is.null(vertical)) {
      ubr.setInnerVertical(vertical ? innerBorder : null)
    }
    if (!is.null(horizontal)) {
      ubr.setInnerHorizontal(horizontal ? innerBorder : null)
    }

    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests: [{ updateBorders: ubr }] });

    return this

  }

  /**
   * setDataValidation(rule) https://developers.google.com/apps-script/reference/spreadsheet/range#setdatavalidationrule
   * @param {FakeDataValidation} rule to apply to all
   * @return {FakeSheetRange} self
   */
  setDataValidation(rule) {
    return this.__setDataValidations(fillRange(this, rule))
  }

  /**
   * setDataValidations(rules)
   * @param {FakeDataValidation[][]} rules 
   * @return {FakeSheetRange} self
   */
  setDataValidations(rules) {
    return this.__setDataValidations(rules)
  }


  __setDataValidations(rules) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setDataValidations")

    // an 'official Sheets objects to do this kind of thing
    // it's actually more long winded than just constructing the requests manually
    // this is a clear
    if (is.null(rules)) {
      const setDataValidation = Sheets
        .newSetDataValidationRequest()
        .setRange(makeSheetsGridRange(this))
        .setRule(null);
      batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests: [{ setDataValidation }] });
      return this
    }

    //---
    // this setting some values
    if (nargs !== 1 || !is.nonEmptyArray(rules)) matchThrow()
    if (!arrMatchesRange(this, rules, "object"))
      if (!rules.flat().every(f => f instanceof FakeDataValidation)) matchThrow()

    // TODO
    // if the rules are all different we need to create a separate request for each member of the range
    // all the same we can use a single fetch

    const requests = []

    for (let offsetRow = 0; offsetRow < this.getNumRows(); offsetRow++) {

      for (let offsetCol = 0; offsetCol < this.getNumColumns(); offsetCol++) {

        const range = this.offset(offsetRow, offsetCol, 1, 1)
        const dv = rules[offsetRow][offsetCol]
        const critter = dv.__getCritter()
        if (!critter) {
          throw new Error('couldnt find sheets api mapping for data validation rule', rule.getCriteriaType())
        }
        const field = critter.apiField || 'userEnteredValue'
        const type = critter.apiEnum || critter.name
        let values = dv.getCriteriaValues()
        let showCustomUi = null
        // but if its one of these - drop the last arg
        if (critter.name === "VALUE_IN_LIST" || critter.name === "VALUE_IN_RANGE") {
          if (values.length !== 2) {
            throw new Error(`Expected 2 args for ${critter.name} but got ${values.length}`)
          } else {
            showCustomUi = values[1]
            values = values.slice(0, -1)
          }
          // convert any ranges to formulas
          if (critter.name === "VALUE_IN_RANGE") {
            if (!isRange(values[0])) {
              throw `expected a range for ${critter.name} but got ${values[0]}`
            }
            values[0] = `=${values[0].__getWithSheet()}`
          }
        }

        // all values need to be converted to string 
        values = values.map(stringer).map(f => ({
          [field]: f
        }))

        const condition = {
          type,
          values
        }

        const rule = Sheets.newDataValidationRule()
          .setCondition(condition)
          .setStrict(!dv.getAllowInvalid())

        if (!is.null(showCustomUi)) rule.setShowCustomUi(showCustomUi)

        const setDataValidation = Sheets
          .newSetDataValidationRequest()
          .setRange(makeSheetsGridRange(range))
          .setRule(rule);

        requests.push({ setDataValidation })
      }
    }
    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests });
    return this

  }


  /**
   * Sets the background color of all cells in the range in CSS notation (such as '#ffffff' or 'white').
   * setBackgrounds(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundscolor
   * @param {string[][]} colors A two-dimensional array of colors in CSS notation (such as '#ffffff' or 'white'); null values reset the color.
   * @return {FakeSheetRange} self
   */
  setBackgrounds(colors) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setBackgrounds")
    if (nargs !== 1 || !arrMatchesRange(this, colors, "string", true)) matchThrow()

    const rows = colors.map(row => ({
      values: row.map(c => {
        if (is.null(c)) {
          return { userEnteredFormat: { backgroundColor: null } };
        }
        const hex = normalizeColorStringToHex(c);
        if (!hex) throw new Error(`Invalid color string: "${c}"`);
        return {
          userEnteredFormat: {
            backgroundColor: hexToRgb(hex)
          }
        };
      })
    }))
    const fields = 'userEnteredFormat.backgroundColor'
    return updateCells({ range: this, rows, fields, spreadsheet: this.__getSpreadsheet() })

  }

  /**
   * setBackgroundObjects(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundobjectscolor
   * Sets a rectangular grid of background colors (must match dimensions of this range).
   * @param {Color[][]} colors A two-dimensional array of colors; null values reset the color.
   * @returns {FakeSheetRange} self
   */
  setBackgroundObjects(colors) {

    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setBackgroundObjects", "Color")
    if (nargs !== 1 || !arrMatchesRange(this, colors, "object")) matchThrow()

    const rows = colors.map(row => ({
      values: row.map(c => this.__getColorItem(c))
    }))

    // see __getColorItem for how this allows mixing of both theme and rgb colors.
    const fields = 'userEnteredFormat.backgroundColorStyle'
    return updateCells({ range: this, rows, fields, spreadsheet: this.__getSpreadsheet() })

  }

  /**
  * Sets the font color in CSS notation (such as '#ffffff' or 'white')
  * setBackgroundObject(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundobjectcolor
  * @param {Color} color The background color to set; null value resets the background color.
  * @return {FakeSheetRange} self
  */
  setBackgroundObject(color) {
    return this.setBackgroundObjects(fillRange(this, color))
  }

  /**
   * Sets the font color in CSS notation (such as '#ffffff' or 'white')
   * setFontColor(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setfontcolorcolor
   * @param {string} color A color code in CSS notation (such as '#ffffff' or 'white'); a null value resets the color.
   * @return {FakeSheetRange} self
   */
  setFontColor(color) {
    // we can use the set colorObject here
    // TODO - handle null
    return this.setFontColorObject(is.null(color) ? null : SpreadsheetApp.newColor().setRgbColor(color).build())
  }

  /**
   * TODO -- dont support html color names yet
   * Sets a rectangular grid of font colors (must match dimensions of this range). The colors are in CSS notation (such as '#ffffff' or 'white').
   * setFontColors(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setfontcolorscolors
   * @param {string[][]} colors A two-dimensional array of colors in CSS notation (such as '#ffffff' or 'white'); null values reset the color.
   * @return {FakeSheetRange} self
   */
  setFontColors(colors) {
    // we can use the set colorObject here
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setFontColors")
    if (nargs !== 1 || !arrMatchesRange(this, colors, 'string', true)) matchThrow()
    return this.setFontColorObjects(colors.map(row => row.map(color => {
      if (is.null(color)) return null;
      const hex = normalizeColorStringToHex(color);
      if (!hex) throw new Error(`Invalid color string: "${color}"`);
      return SpreadsheetApp.newColor().setRgbColor(hex).build();
    })))
  }


  /** 
   * setValue(value) https://developers.google.com/apps-script/reference/spreadsheet/range#setvaluesvalues
   * @param {object} A value
   * @return {FakeSheetRange} this
   */
  setValue(value) {
    return this.__setValues({ values: [[value]], single: true })
  }

  /** 
   * setValues(values) https://developers.google.com/apps-script/reference/spreadsheet/range#setvaluesvalues
   * @param {object[][]} A two-dimensional array of values.
   * @return {FakeSheetRange} this
   */
  setValues(values) {
    const rows = this.getNumRows()
    const cols = this.getNumColumns()
    if (rows !== values.length) {
      throw new Error(`
      The number of rows in the data does not match the number of rows in the range. The data has ${values.length} but the range has ${rows}`)
    }
    if (!values.every(row => row.length === cols)) {
      throw new Error(`
        The number of columns in the data does not match the number of columns in the range. The range has ${cols}`)
    }
    return this.__setValues({ values })
  }
  /**
   * splitTextToColumns(delimiter) 
   * https://developers.google.com/apps-script/reference/spreadsheet/range#splittexttocolumnsdelimiter_1
   * Splits a column of text into multiple columns
   * @param {string|| TextToColumnsDelimiter} []
   * @returns {FakeSheetRange} self
   */
  splitTextToColumns(delimiter) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.splitTextToColumns")
    if (nargs > 1) matchThrow()
    if (this.getNumColumns() !== 1) {
      throw new Error(`A range in a single column must be provided`)
    }
    const request = Sheets.newTextToColumnsRequest()
      .setSource(makeSheetsGridRange(this))

    if (nargs == 1) {
      if (isEnum(delimiter)) {
        if (!getEnumKeys(TextToColumnsDelimiter).includes(delimiter.toString())) matchThrow()
        request.setDelimiterType(delimiter.toString())
      } else if (is.string(delimiter)) {
        request.setDelimiter(delimiter).setDelimiterType("CUSTOM")
      } else {
        matchThrow()
      }
    } else {
      // the default
      request.setDelimiterType(TextToColumnsDelimiter.toString())
    }
    // if no delimiter, dont bother mentioning it
    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests: [{ textToColumns: request }] });

    return this

  }

  sort(sortObj) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.sort")
    if (nargs !== 1 || is.nullOrUndefined(sortObj)) matchThrow()
    const sortObjs = (is.array(sortObj) ? sortObj : [sortObj]).map(f => {
      let ob = {}
      if (is.nonEmptyObject(f)) {
        ob = { ...f }
      } else if (is.integer(f)) {
        ob.column = f
      } else {
        matchThrow()
      }
      if (!Reflect.has(ob, "ascending")) ob.ascending = true
      if (!is.boolean(ob.ascending)) matchThrow()
      if (!Reflect.has(ob, "column")) matchThrow()
      if (!is.integer(ob.column)) matchThrow()
      // The column number is the absolute column position in the sheet, and must be within the range.
      if (ob.column < this.getColumn() || ob.column > this.getLastColumn()) {
        throw new Error(`The column to sort by (${ob.column}) is outside the range's columns (${this.getColumn()}-${this.getLastColumn()}).`);
      }

      return {
        // note - absolute - not relative 
        // and will only sort the range contents, not the entire row
        dimensionIndex: ob.column - 1,
        sortOrder: ob.ascending ? "ASCENDING" : "DESCENDING"
      }
    })

    const request = Sheets.newSortRangeRequest()
      .setRange(makeSheetsGridRange(this))
      .setSortSpecs(sortObjs)

    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests: [{ sortRange: request }] });

    return this

  }
  trimWhitespace() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.splitTextToColumns")
    if (nargs > 0) matchThrow()
    const request = Sheets.newTrimWhitespaceRequest()
      .setRange(makeSheetsGridRange(this))

    batchUpdate({ spreadsheet: this.__getSpreadsheet(), requests: [{ trimWhitespace: request }] });

    return this
  }

  getDataTable() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.getDataTable");
    if (nargs) matchThrow();

    const sheet = this.getSheet();
    const spreadsheet = sheet.getParent();
    const sheetId = sheet.getSheetId();

    // Get fresh sheet metadata
    const meta = spreadsheet.__getMetaProps(`sheets(properties.sheetId,data.rowData.values.dataSourceTable)`);
    const sheetMeta = meta.sheets.find(s => s.properties.sheetId === sheetId);

    if (!sheetMeta || !sheetMeta.data || !sheetMeta.data[0] || !sheetMeta.data[0].rowData) {
      return null;
    }

    const rowData = sheetMeta.data[0].rowData;

    // Find all tables on the sheet and see if our range intersects with any of them.
    const allTables = [];
    rowData.forEach((row, rIdx) => {
      row.values?.forEach((cell, cIdx) => {
        if (cell.dataSourceTable) {
          const anchor = sheet.getRange(rIdx + 1, cIdx + 1);
          allTables.push(newFakeDataTable(cell.dataSourceTable, anchor));
        }
      });
    });

    for (const table of allTables) {
      const tableRange = table.getRange(); // This uses getDataRegion()
      const thisRange = this;

      // Check for intersection
      const r1 = makeGridRange(thisRange);
      const r2 = makeGridRange(tableRange);
      const intersects = (
        Math.max(r1.startRowIndex, r2.startRowIndex) < Math.min(r1.endRowIndex, r2.endRowIndex) &&
        Math.max(r1.startColumnIndex, r2.startColumnIndex) < Math.min(r1.endColumnIndex, r2.endColumnIndex)
      );

      if (intersects) return table;
    }

    return null;
  }

  toString() {
    return 'Range'
  }

  //-- private helpers


  __getColorItem = (color) => {
    // this can be a little complex since the color objects are allowed to be both rgb color and theme colors mixed
    const isTheme = (ob) => ob.getColorType().toString() === "THEME"
    const isRgb = (ob) => ob.getColorType().toString() === "RGB"
    const getItem = (ob) => {
      if (isTheme(ob)) {
        return themed(ob.asThemeColor().getThemeColorType().toString())
      } else if (isRgb(ob)) {
        return rgb(ob.asRgbColor().asHexString())
      } else {
        throw new Error('unexpected color value', ob)
      }
    }
    const themed = (value) => ({
      userEnteredFormat: {
        backgroundColorStyle: {
          themeColor: value
        }
      }
    })

    // although you'd expect this to be background rather than style, we can use backgroundColorStyle to allow the mixing of both theme and color
    const rgb = (value) => ({
      userEnteredFormat: {
        backgroundColorStyle: {
          rgbColor: hexToRgb(value)
        }
      }
    })
    return getItem(color)
  }

  __getRangeWithSheet(range) {
    return `${range.getSheet().getName()}!${range.getA1Notation()}`
  }


  /**
   * get the spreadsheet hosting this range
   * @return {FakeSpreadsheet}
   */
  __getSpreadsheet() {
    return this.getSheet().__parent;
  }
  /**
   * get the id of the spreadsheet hosting this range
   * returns {string}
   */
  __getSpreadsheetId() {
    return this.__getSpreadsheet().getId()
  }

  /**
   * sometimes a range has no  grid range so we need to fake one
   */
  get __gridRange() {
    // if we have a full grid, just return it
    if (this.__hasGrid && Reflect.has(this.__apiGridRange, 'startRowIndex') && Reflect.has(this.__apiGridRange, 'startColumnIndex')) {
      return this.__apiGridRange;
    }

    const sheet = this.getSheet();
    const maxRows = sheet.getMaxRows();
    const maxCols = sheet.getMaxColumns();

    // it was a partial range (row-only or column-only), or a whole sheet.
    // so we need to fill in the blanks with the sheet dimensions
    return {
      sheetId: sheet.getSheetId(),
      startRowIndex: 0, endRowIndex: maxRows,
      startColumnIndex: 0, endColumnIndex: maxCols,
      ...this.__apiGridRange
    };
  }

  __toGridRange(range = this) {
    const gr = makeGridRange(range)

    // convert to a sheets style
    return Sheets.newGridRange(gr)
      .setSheetId(gr.sheetId)
      .setStartRowIndex(gr.startRowIndex)
      .setStartColumnIndex(gr.startColumnIndex)
      .setEndRowIndex(gr.endRowIndex)
      .setEndColumnIndex(gr.endColumnIndex)
  }
  __getTopLeft() {
    return this.offset(0, 0, 1, 1)
  }

  __getWithSheet() {
    return this.__getRangeWithSheet(this)
  }



  __setValues({ values, single = false, options = { valueInputOption: "USER_ENTERED" } }) {

    const range = single ? this.__getRangeWithSheet(this.__getTopLeft()) : this.__getWithSheet()
    const request = {
      ...options,
      data: [{
        majorDimension: "ROWS",
        range,
        values
      }]
    }
    Sheets.Spreadsheets.Values.batchUpdate(request, this.__getSpreadsheetId())
    return this
  }

}
