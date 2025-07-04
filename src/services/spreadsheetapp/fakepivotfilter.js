import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { newFakeFilterCriteria } from './fakefiltercriteria.js';

const { is } = Utils;

export const newFakePivotFilter = (...args) => {
  return Proxies.guard(new FakePivotFilter(...args));
};

export class FakePivotFilter {
  constructor(apiPivotFilter, pivotTable) {
    this.__apiPivotFilter = apiPivotFilter;
    this.__pivotTable = pivotTable;
  }

  __getFreshParent(forRead = false) {
    const parentPivotTable = this.getPivotTable();
    const anchor = parentPivotTable.getAnchorCell();
    const sheet = anchor.getSheet();
    // for read operations, we can trust the current sheet object. for writes, we must get a fresh one.
    const operatingSheet = forRead ? sheet : sheet.getParent().getSheetByName(sheet.getName());
    return operatingSheet.getPivotTables().find(pt => pt.getAnchorCell().getA1Notation() === anchor.getA1Notation());
  }

  getFilterCriteria() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotFilter.getFilterCriteria');
    if (nargs) matchThrow();
    const freshPivotTable = this.__getFreshParent(true);
    // Find the corresponding filter spec from the fresh pivot table object
    const freshFilterSpec = freshPivotTable?.__pivotTable.filterSpecs?.find(f =>
      f.columnOffsetIndex === this.__apiPivotFilter.columnOffsetIndex
    );
    const apiCriteria = freshFilterSpec?.filterCriteria;

    // If no criteria are set, return a default criteria object.
    if (!apiCriteria || Object.keys(apiCriteria).length === 0) {
      return newFakeFilterCriteria({});
    }

    // Re-create the criteria object from the stored API representation.
    return newFakeFilterCriteria(apiCriteria);
  }

  getPivotTable() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotFilter.getPivotTable');
    if (nargs) matchThrow();
    return this.__pivotTable;
  }

  getSourceDataColumn() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotFilter.getSourceDataColumn');
    if (nargs) matchThrow();
    // columnOffsetIndex is 0-based, GAS is 1-based
    return this.__apiPivotFilter.columnOffsetIndex + 1;
  }

  remove() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotFilter.remove');
    if (nargs) matchThrow();
    const freshPivotTable = this.__getFreshParent();
    const pivotTableApi = freshPivotTable.__pivotTable;

    const currentFilters = pivotTableApi.filterSpecs || [];
    const currentCriteria = pivotTableApi.criteria || {};
    const columnOffsetToRemove = this.__apiPivotFilter.columnOffsetIndex;

    const newFilters = currentFilters.filter(f =>
      f.columnOffsetIndex !== columnOffsetToRemove
    );

    const newCriteria = { ...currentCriteria };
    delete newCriteria[String(columnOffsetToRemove)];

    if (newFilters.length === currentFilters.length && !currentCriteria[String(columnOffsetToRemove)]) {
      // already removed or never existed, do nothing.
      return;
    }

    const newPivotTableApi = {
      ...pivotTableApi,
      filterSpecs: newFilters.length ? newFilters : undefined,
      criteria: Object.keys(newCriteria).length ? newCriteria : undefined,
    };

    freshPivotTable.__updatePivotTable(newPivotTableApi);
    // Invalidate this object as it's been removed
    this.__apiPivotFilter = {};
    this.__pivotTable = freshPivotTable;
  }

  setFilterCriteria(filterCriteria) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotFilter.setFilterCriteria');
    if (nargs !== 1) matchThrow();
    if (!is.null(filterCriteria) && filterCriteria.toString() !== 'FilterCriteria') matchThrow();
    const freshPivotTable = this.__getFreshParent();
    const pivotTableApi = freshPivotTable.__pivotTable;
    const currentFilters = pivotTableApi.filterSpecs || [];
    const filterIndex = currentFilters.findIndex(f =>
      f.columnOffsetIndex === this.__apiPivotFilter.columnOffsetIndex
    );

    if (filterIndex === -1) {
      throw new Error('Filter not found in pivot table. It may have been removed.');
    }

    const newFilters = [...currentFilters];
    const updatedFilter = {
      ...newFilters[filterIndex],
      // Use the internal API object from the passed FilterCriteria object.
      filterCriteria: filterCriteria ? filterCriteria.__apiCriteria : {},
    };
    newFilters[filterIndex] = updatedFilter;

    const newPivotTableApi = {
      ...pivotTableApi,
      filterSpecs: newFilters,
    };

    freshPivotTable.__updatePivotTable(newPivotTableApi);
    this.__apiPivotFilter = updatedFilter;
    this.__pivotTable = freshPivotTable;

    return this;
  }

  toString() {
    return 'PivotFilter';
  }
}