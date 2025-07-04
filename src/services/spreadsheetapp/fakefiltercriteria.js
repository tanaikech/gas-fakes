import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { apiCriteriaMap } from './fakefiltercriteriabuilder.js';
import { BooleanCriteria, RelativeDate } from '../enums/sheetsenums.js';
import { Utils } from '../../support/utils.js';

const { serialToDate } = Utils;

export const newFakeFilterCriteria = (...args) => {
  return Proxies.guard(new FakeFilterCriteria(...args));
};

export class FakeFilterCriteria {
  constructor(apiCriteria) {
    // The constructor can receive the raw API object, or a builder.
    // If it's a builder, get the raw API object from it.
    if (apiCriteria && apiCriteria.toString() === 'FilterCriteriaBuilder') {
      this.__apiCriteria = apiCriteria.__getApiObject() || {};
    } else {
      this.__apiCriteria = apiCriteria || {};
    }
  }

  copy() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'FilterCriteria.copy');
    if (nargs) matchThrow();
    // The API object is a plain object, so a deep copy is needed.
    return newFakeFilterCriteria(JSON.parse(JSON.stringify(this.__apiCriteria)));
  }

  getCriteriaType() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'FilterCriteria.getCriteriaType');
    if (nargs) matchThrow();

    const condition = this.__apiCriteria.condition;
    if (!condition) {
      return null;
    }

    let gasTypeString = apiCriteriaMap[condition.type];
    if (!gasTypeString) {
      return null;
    }

    // Check for relative dates
    if (condition.values && condition.values.length > 0 && condition.values[0].relativeDate) {
      if (gasTypeString === 'DATE_AFTER' || gasTypeString === 'DATE_BEFORE' || gasTypeString === 'DATE_EQUAL_TO') {
        gasTypeString += '_RELATIVE';
      }
    }

    return BooleanCriteria[gasTypeString] || null;
  }

  getCriteriaValues() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'FilterCriteria.getCriteriaValues');
    if (nargs) matchThrow();

    const condition = this.__apiCriteria.condition;
    if (!condition) {
      return [];
    }
    if (!condition.values) {
      return [];
    }

    const criteriaType = this.getCriteriaType()?.toString();

    return condition.values.map(v => {
      if (v.relativeDate) {
        return RelativeDate[v.relativeDate];
      }
      if (Object.prototype.hasOwnProperty.call(v, 'userEnteredValue')) {
        const userValue = v.userEnteredValue;
        if (criteriaType) {
          if (criteriaType.includes('DATE')) return serialToDate(parseFloat(userValue));
          if (criteriaType.includes('NUMBER')) return parseFloat(userValue);
        }
        return userValue;
      }
      return null; // Should not happen for valid criteria
    });
  }

  getHiddenValues() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'FilterCriteria.getHiddenValues');
    if (nargs) matchThrow();
    return this.__apiCriteria.hiddenValues || [];
  }

  getVisibleValues() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'FilterCriteria.getVisibleValues');
    if (nargs) matchThrow();
    return this.__apiCriteria.visibleValues || [];
  }

  toString() {
    return 'FilterCriteria';
  }
}