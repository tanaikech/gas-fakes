import { Proxies } from '../../support/proxies.js';
import { notYetImplemented } from '../../support/helpers.js';
import { apiCriteriaMap } from './fakefiltercriteriabuilder.js';
import { BooleanCriteria } from '../enums/sheetsenums.js';
import { Utils } from '../../support/utils.js';

const { is } = Utils;

const serialToDate = (serial) => {
  const epochCorrection = 2209161600000;
  const msPerDay = 24 * 60 * 60 * 1000;
  const ms = (serial * msPerDay) - epochCorrection;
  return new Date(ms);
};
/**
 * @returns {FakeFilterCriteria}
 */
export const newFakeFilterCriteria = (...args) => {
  return Proxies.guard(new FakeFilterCriteria(...args));
};

export class FakeFilterCriteria {
  constructor(builder) {
    this.__builder = builder;
    this.__apiCriteria = builder.__getApiObject();
  }

  getCriteriaType() {
    const condition = this.__apiCriteria.condition;
    if (!condition) {
      // This handles withHiddenValues/withVisibleValues cases
      return null;
    }
    const apiType = condition.type;
    if (!apiType) return null;

    let appsScriptType = apiCriteriaMap[apiType];
    if (appsScriptType) {
      // Check for relative dates, which return a different enum in Apps Script for filters.
      if ((appsScriptType === 'DATE_AFTER' || appsScriptType === 'DATE_BEFORE' || appsScriptType === 'DATE_EQUAL_TO') &&
        condition.values && condition.values.length > 0 && condition.values[0].relativeDate) {
        appsScriptType += '_RELATIVE';
      }
      return BooleanCriteria[appsScriptType] || null;
    }
    return null;
  }

  getCriteriaValues() {
    const values = this.__apiCriteria.condition?.values;
    if (!values) return [];

    const criteriaType = this.getCriteriaType()?.toString() || '';
    const isNumericCriteria = criteriaType.startsWith('NUMBER_');
    const isDateCriteria = criteriaType.startsWith('DATE_');

    return values.map(v => {
      if (v.relativeDate) {
        return SpreadsheetApp.RelativeDate[v.relativeDate];
      }
      const uev = v.userEnteredValue;
      // For numeric criteria, parse the string back to a number for Apps Script compatibility.
      if (isNumericCriteria && uev && !isNaN(uev)) {
        return parseFloat(uev);
      }
      // For dates, convert the serial number string back to a Date object.
      if (isDateCriteria && uev && !isNaN(uev)) {
        // Don't convert formulas
        if (is.string(uev) && uev.startsWith('=')) return uev;
        return serialToDate(parseFloat(uev));
      }
      return uev;
    });
  }

  copy() {
    return this.__builder.copy().build();
  }

  // This will be used by setColumnFilterCriteria to get the API object
  __getApiObject() {
    return this.__apiCriteria;
  }

  toString() {
    return 'FilterCriteria';
  }
}