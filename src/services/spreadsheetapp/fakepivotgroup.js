import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { Dimension } from '../enums/sheetsenums.js';

const { is } = Utils;

export const newFakePivotGroup = (...args) => {
  return Proxies.guard(new FakePivotGroup(...args));
};

export class FakePivotGroup {
  constructor(apiPivotGroup, pivotTable, dimension) {
    this.__apiPivotGroup = apiPivotGroup;
    this.__pivotTable = pivotTable;
    this.__dimension = dimension; // 'ROWS' or 'COLUMNS'
  }

  __getFreshParent() {
    const parentPivotTable = this.getPivotTable();
    const anchor = parentPivotTable.getAnchorCell();
    const sheet = anchor.getSheet();
    const freshSheet = sheet.getParent().getSheetByName(sheet.getName());
    return freshSheet.getPivotTables().find(pt => pt.getAnchorCell().getA1Notation() === anchor.getA1Notation());
  }

  __updateGroup(newApiGroup) {
    const freshPivotTable = this.__getFreshParent();
    const pivotTableApi = freshPivotTable.__pivotTable;
    const groupListKey = this.__dimension.toLowerCase(); // 'rows' or 'columns'
    const currentGroups = pivotTableApi[groupListKey] || [];

    const groupIndex = currentGroups.findIndex(g =>
      g.sourceColumnOffset === this.__apiPivotGroup.sourceColumnOffset
    );

    if (groupIndex === -1) {
      throw new Error('This pivot group has been removed from the pivot table.');
    }

    const newGroups = [...currentGroups];
    newGroups[groupIndex] = newApiGroup;

    const newPivotTableApi = {
      ...pivotTableApi,
      [groupListKey]: newGroups,
    };

    freshPivotTable.__updatePivotTable(newPivotTableApi);
    this.__pivotTable = freshPivotTable;
    this.__apiPivotGroup = newApiGroup; // Update the local reference
  }

  areLabelsRepeated() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotGroup.areLabelsRepeated');
    if (nargs) matchThrow();
    return this.__apiPivotGroup.repeatHeadings === true;
  }

  getDimension() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotGroup.getDimension');
    if (nargs) matchThrow();
    return Dimension[this.__dimension];
  }

  getPivotTable() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotGroup.getPivotTable');
    if (nargs) matchThrow();
    return this.__pivotTable;
  }

  getSourceDataColumn() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotGroup.getSourceDataColumn');
    if (nargs) matchThrow();
    // sourceColumnOffset is 0-based, API wants 1-based.
    if (is.number(this.__apiPivotGroup.sourceColumnOffset)) {
      return this.__apiPivotGroup.sourceColumnOffset + 1;
    }
    return null;
  }

  isSortAscending() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotGroup.isSortAscending');
    if (nargs) matchThrow();
    return (this.__apiPivotGroup.sortOrder || 'ASCENDING') === 'ASCENDING';
  }

  hideRepeatedLabels() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotGroup.hideRepeatedLabels');
    if (nargs) matchThrow();
    const newGroup = { ...this.__apiPivotGroup, repeatHeadings: false };
    this.__updateGroup(newGroup);
    return this;
  }

  remove() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotGroup.remove');
    if (nargs) matchThrow();
    const freshPivotTable = this.__getFreshParent();
    const pivotTableApi = freshPivotTable.__pivotTable;
    const groupListKey = this.__dimension.toLowerCase();
    const currentGroups = pivotTableApi[groupListKey] || [];

    const newGroups = currentGroups.filter(g =>
      g.sourceColumnOffset !== this.__apiPivotGroup.sourceColumnOffset
    );

    if (newGroups.length === currentGroups.length) {
      // already removed
      return;
    }

    const newPivotTableApi = {
      ...pivotTableApi,
      [groupListKey]: newGroups.length ? newGroups : undefined,
    };

    freshPivotTable.__updatePivotTable(newPivotTableApi);
    // Invalidate this object
    this.__pivotTable = freshPivotTable;
    this.__apiPivotGroup = {};
  }

  resetDisplayName() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotGroup.resetDisplayName');
    if (nargs) matchThrow();

    const newGroup = { ...this.__apiPivotGroup };
    delete newGroup.label;
    this.__updateGroup(newGroup);
    return this;
  }

  showTotals(showTotals) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotGroup.showTotals');
    if (nargs !== 1 || !is.boolean(showTotals)) matchThrow();

    const newGroup = { ...this.__apiPivotGroup, showTotals };
    this.__updateGroup(newGroup);
    return this;
  }

  showRepeatedLabels() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotGroup.showRepeatedLabels');
    if (nargs) matchThrow();
    const newGroup = { ...this.__apiPivotGroup, repeatHeadings: true };
    this.__updateGroup(newGroup);
    return this;
  }

  sortAscending() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotGroup.sortAscending');
    if (nargs) matchThrow();
    const newGroup = { ...this.__apiPivotGroup, sortOrder: 'ASCENDING' };
    this.__updateGroup(newGroup);
    return this;
  }

  sortDescending() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotGroup.sortDescending');
    if (nargs) matchThrow();
    const newGroup = { ...this.__apiPivotGroup, sortOrder: 'DESCENDING' };
    this.__updateGroup(newGroup);
    return this;
  }

  setDisplayName(name) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotGroup.setDisplayName');
    if (nargs !== 1 || !is.string(name)) matchThrow();
    const newGroup = { ...this.__apiPivotGroup, label: name };
    this.__updateGroup(newGroup);
    return this;
  }

  totalsAreShown() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotGroup.totalsAreShown');
    if (nargs) matchThrow();
    // Defaults to true if not specified
    return this.__apiPivotGroup.showTotals !== false;
  }

  toString() {
    return 'PivotGroup';
  }
}