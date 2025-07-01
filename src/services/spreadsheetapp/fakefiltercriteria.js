import { Proxies } from '../../support/proxies.js';
import { notYetImplemented } from '../../support/helpers.js';
import { apiCriteriaMap } from './fakefiltercriteriabuilder.js';
import { BooleanCriteria } from '../enums/sheetsenums.js';

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

  getHiddenValues() {
    return this.__apiCriteria.hiddenValues || null;
  }

  getVisibleValues() {
    return this.__apiCriteria.visibleValues || null;
  }

  getCriteriaType() {
    if (this.__apiCriteria.hiddenValues || this.__apiCriteria.visibleValues) {
      return null;
    }
    const apiType = this.__apiCriteria.condition?.type;
    if (!apiType) return null;

    const appsScriptType = apiCriteriaMap[apiType];
    return appsScriptType ? BooleanCriteria[appsScriptType] : null;
  }

  getCriteriaValues() {
    const values = this.__apiCriteria.condition?.values;
    if (!values) return [];

    const criteriaType = this.getCriteriaType()?.toString() || '';
    const isNumericCriteria = criteriaType.startsWith('NUMBER_');

    // This is a simplification. The real implementation would need to handle relative dates etc.
    return values.map(v => {
      const uev = v.userEnteredValue;
      // For numeric criteria, parse the string back to a number for Apps Script compatibility.
      if (isNumericCriteria && uev && !isNaN(uev) && !isNaN(parseFloat(uev))) {
        return parseFloat(uev);
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