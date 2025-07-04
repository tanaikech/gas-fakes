import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { PivotValueDisplayType, PivotTableSummarizeFunction } from '../enums/sheetsenums.js';

const { is , isEnum} = Utils;

export const newFakePivotValue = (...args) => {
  return Proxies.guard(new FakePivotValue(...args));
};

export class FakePivotValue {
  constructor(apiPivotValue, pivotTable) {
    this.__apiPivotValue = apiPivotValue;
    this.__pivotTable = pivotTable;
  }

  __getFreshParent() {
    const parentPivotTable = this.getPivotTable();
    const anchor = parentPivotTable.getAnchorCell();
    const sheet = anchor.getSheet();
    const freshSheet = sheet.getParent().getSheetByName(sheet.getName());
    return freshSheet.getPivotTables().find(pt => pt.getAnchorCell().getA1Notation() === anchor.getA1Notation());
  }

  __updateValue(newApiValue) {
    const freshPivotTable = this.__getFreshParent();
    const pivotTableApi = freshPivotTable.__pivotTable;
    const currentValues = pivotTableApi.values || [];

    // For regular values, we identify by sourceColumnOffset.
    // For calculated values, we identify by name.
    const valueIndex = currentValues.findIndex(v => {
      if (this.__apiPivotValue.formula) {
        return v.name === this.__apiPivotValue.name;
      }
      // When summarizeBy is called, the summarizeFunction changes, so we can't rely on it.
      // We assume one regular value per source column.
      return v.sourceColumnOffset === this.__apiPivotValue.sourceColumnOffset && !v.formula;
    });

    if (valueIndex === -1) {
      throw new Error('This pivot value has been removed from the pivot table.');
    }

    const newValues = [...currentValues];
    newValues[valueIndex] = newApiValue;

    const newPivotTableApi = { ...pivotTableApi, values: newValues };
    freshPivotTable.__updatePivotTable(newPivotTableApi);
    this.__pivotTable = freshPivotTable;
    this.__apiPivotValue = newApiValue;
  }

  getDisplayType() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotValue.getDisplayType');
    if (nargs) matchThrow();
    const displayType = this.__apiPivotValue.calculatedDisplayType || 'DEFAULT';
    return PivotValueDisplayType[displayType];
  }

  getFormula() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotValue.getFormula');
    if (nargs) matchThrow();
    // Only calculated values have a formula.
    return this.__apiPivotValue.formula || null;
  }

  getPivotTable() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotValue.getPivotTable');
    if (nargs) matchThrow();
    return this.__pivotTable;
  }

  getSourceDataColumn() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotValue.getSourceDataColumn');
    if (nargs) matchThrow();
    // sourceColumnOffset is 0-based, API wants 1-based.
    if (is.number(this.__apiPivotValue.sourceColumnOffset)) {
      return this.__apiPivotValue.sourceColumnOffset + 1;
    }
    return null;
  }

  getSourceDataSourceColumn() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotValue.getSourceDataSourceColumn');
    if (nargs) matchThrow();
    // Not implemented yet, as it requires DataSource support
    return null;
  }

  getSummarizedBy() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotValue.getSummarizedBy');
    if (nargs) matchThrow();
    const func = this.__apiPivotValue.summarizeFunction;
    return PivotTableSummarizeFunction[func];
  }

  remove() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotValue.remove');
    if (nargs) matchThrow();
    const freshPivotTable = this.__getFreshParent();
    const pivotTableApi = freshPivotTable.__pivotTable;
    const currentValues = pivotTableApi.values || [];

    const isCalculated = !!this.__apiPivotValue.formula;

    const newValues = currentValues.filter(v => {
      if (isCalculated) {
        // Calculated values are identified by name
        return v.name !== this.__apiPivotValue.name;
      } else {
        // Regular values are identified by source column.
        // We want to keep everything that is NOT this value.
        return !(v.sourceColumnOffset === this.__apiPivotValue.sourceColumnOffset && !v.formula);
      }
    });

    const newPivotTableApi = { ...pivotTableApi, values: newValues.length ? newValues : undefined };
    freshPivotTable.__updatePivotTable(newPivotTableApi);
    this.__pivotTable = freshPivotTable;
    this.__apiPivotValue = {}; // Invalidate
  }

  setDisplayName(name) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotValue.setDisplayName');
    if (nargs !== 1 || !is.string(name)) matchThrow();

    const newValue = { ...this.__apiPivotValue, name: name };
    this.__updateValue(newValue);
    return this;
  }

  setFormula(formula) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotValue.setFormula');
    if (nargs !== 1 || !is.string(formula) || !formula.startsWith('=')) matchThrow();

    // Per the official API, setFormula can only be used on calculated pivot values.
    // A value is considered "calculated" if it was created with a formula,
    // which is indicated by the CUSTOM summarize function.
    if (this.__apiPivotValue.summarizeFunction !== 'CUSTOM') {
      throw new Error('Cannot set a formula on a non-calculated pivot value. Use PivotTable.addCalculatedPivotValue() or setFormula() on a CalculatedPivotValue.');
    }
    const newValue = { ...this.__apiPivotValue, formula };
    this.__updateValue(newValue);
    return this;
  }

  showAs(displayType) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotValue.showAs');
    if (nargs !== 1 || !isEnum(displayType)) matchThrow();

    const newValue = { ...this.__apiPivotValue, calculatedDisplayType: displayType.toString() };
    this.__updateValue(newValue);
    return this;
  }

  summarizeBy(summarizeFunction) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PivotValue.summarizeBy');
    if (nargs !== 1 || !isEnum(summarizeFunction)) matchThrow();

    const newValue = { ...this.__apiPivotValue, summarizeFunction: summarizeFunction.toString() };
    this.__updateValue(newValue);
    return this;
  }

  toString() {
    return 'PivotValue';
  }
}