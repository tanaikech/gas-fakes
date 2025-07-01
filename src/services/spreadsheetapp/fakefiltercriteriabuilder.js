import { Proxies } from '../../support/proxies.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';
import { newFakeFilterCriteria } from './fakefiltercriteria.js';
import { Utils } from '../../support/utils.js';

const { is } = Utils;

const criteriaApiMap = {
  'CELL_EMPTY': 'IS_BLANK',
  'CELL_NOT_EMPTY': 'IS_NOT_BLANK',
  'DATE_AFTER': 'DATE_AFTER',
  'DATE_BEFORE': 'DATE_BEFORE',
  'DATE_EQUAL_TO': 'DATE_EQ',
  'NUMBER_BETWEEN': 'NUMBER_BETWEEN',
  'NUMBER_EQUAL_TO': 'NUMBER_EQ',
  'NUMBER_GREATER_THAN': 'NUMBER_GREATER',
  'NUMBER_GREATER_THAN_OR_EQUAL_TO': 'NUMBER_GREATER_THAN_EQ',
  'NUMBER_LESS_THAN': 'NUMBER_LESS',
  'NUMBER_LESS_THAN_OR_EQUAL_TO': 'NUMBER_LESS_THAN_EQ',
  'NUMBER_NOT_BETWEEN': 'NUMBER_NOT_BETWEEN',
  'NUMBER_NOT_EQUAL_TO': 'NUMBER_NOT_EQ',
  'TEXT_CONTAINS': 'TEXT_CONTAINS',
  'TEXT_DOES_NOT_CONTAIN': 'TEXT_NOT_CONTAINS',
  'TEXT_EQUAL_TO': 'TEXT_EQ',
  'TEXT_STARTS_WITH': 'TEXT_STARTS_WITH',
  'TEXT_ENDS_WITH': 'TEXT_ENDS_WITH',
  'CUSTOM_FORMULA': 'CUSTOM_FORMULA'
};

export const apiCriteriaMap = Object.fromEntries(Object.entries(criteriaApiMap).map(([k, v]) => [v, k]));

/**
 * @returns {FakeFilterCriteriaBuilder}
 */
export const newFakeFilterCriteriaBuilder = (...args) => {
  return Proxies.guard(new FakeFilterCriteriaBuilder(...args));
};

export class FakeFilterCriteriaBuilder {
  constructor() {
    this.__apiCriteria = {};
  }

  __setFromApiObject(apiCriteria) {
    this.__apiCriteria = JSON.parse(JSON.stringify(apiCriteria));
    return this;
  }

  build() {
    return newFakeFilterCriteria(this);
  }

  copy() {
    const builder = newFakeFilterCriteriaBuilder();
    builder.__apiCriteria = JSON.parse(JSON.stringify(this.__apiCriteria));
    return builder;
  }

  withHiddenValues(values) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.withHiddenValues");
    if (nargs !== 1 || !is.array(values)) matchThrow();
    this.__apiCriteria = { hiddenValues: values };
    return this;
  }

  withVisibleValues(values) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.withVisibleValues");
    if (nargs !== 1 || !is.array(values)) matchThrow();
    this.__apiCriteria = { visibleValues: values };
    return this;
  }

  whenNumberGreaterThan(number) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenNumberGreaterThan");
    if (nargs !== 1 || !is.number(number)) matchThrow();
    this.__apiCriteria = {
      condition: {
        type: 'NUMBER_GREATER',
        values: [{ userEnteredValue: String(number) }]
      }
    };
    return this;
  }

  // This is just a sample. A full implementation would have all `when...` methods.
  whenCellEmpty() {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenCellEmpty");
    if (nargs !== 0) matchThrow();
    this.__apiCriteria = {
      condition: {
        type: 'IS_BLANK'
      }
    };
    return this;
  }

  __getApiObject() {
    return this.__apiCriteria;
  }

  toString() {
    return 'FilterCriteriaBuilder';
  }
}