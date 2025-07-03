import { Proxies } from '../../support/proxies.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';
import { newFakeFilterCriteria } from './fakefiltercriteria.js';
import { Utils } from '../../support/utils.js';

const { is, isEnum } = Utils;

const criteriaApiMap = {
  // These are from BooleanCriteria in Apps Script
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

const dateToSerial = (date) => {
  if (!is.date(date)) {
    throw new Error(`dateToSerial is expecting a date but got ${is(date)}`)
  }
  // these are held in a serial number like in Excel, rather than JavaScript epoch
  // so the epoch is actually Dec 30 1899 rather than Jan 1 1970
  const epochCorrection = 2209161600000
  const msPerDay = 24 * 60 * 60 * 1000
  const adjustedMs = date.getTime() + epochCorrection
  return adjustedMs / msPerDay
}

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

  __setCondition(apiType, values = []) {
    const condition = { type: apiType };
    if (values.length > 0) {
      condition.values = values.map(v => {
        if (isEnum(v)) { // Assuming RelativeDate enum
          return { relativeDate: v.toString() };
        }
        if (is.date(v)) {
          return { userEnteredValue: String(dateToSerial(v)) };
        }
        return { userEnteredValue: String(v) };
      });
    }
    this.__apiCriteria = { condition };
    return this;
  }

  whenCellEmpty() {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenCellEmpty");
    if (nargs !== 0) matchThrow();
    return this.__setCondition('IS_BLANK');
  }

  whenCellNotEmpty() {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenCellNotEmpty");
    if (nargs !== 0) matchThrow();
    return this.__setCondition('IS_NOT_BLANK');
  }

  whenDateAfter(date) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenDateAfter");
    if (nargs !== 1 || (!is.date(date) && !isEnum(date))) matchThrow();
    return this.__setCondition('DATE_AFTER', [date]);
  }

  whenDateBefore(date) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenDateBefore");
    if (nargs !== 1 || (!is.date(date) && !isEnum(date))) matchThrow();
    return this.__setCondition('DATE_BEFORE', [date]);
  }

  whenDateEqualTo(date) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenDateEqualTo");
    if (nargs !== 1 || (!is.date(date) && !isEnum(date))) matchThrow();
    return this.__setCondition('DATE_EQ', [date]);
  }

  whenFormulaSatisfied(formula) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenFormulaSatisfied");
    if (nargs !== 1 || !is.string(formula)) matchThrow();
    return this.__setCondition('CUSTOM_FORMULA', [formula]);
  }

  whenNumberBetween(start, end) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenNumberBetween");
    if (nargs !== 2 || !is.number(start) || !is.number(end)) matchThrow();
    return this.__setCondition('NUMBER_BETWEEN', [start, end]);
  }

  whenNumberEqualTo(number) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenNumberEqualTo");
    if (nargs !== 1 || !is.number(number)) matchThrow();
    return this.__setCondition('NUMBER_EQ', [number]);
  }

  whenNumberGreaterThan(number) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenNumberGreaterThan");
    if (nargs !== 1 || !is.number(number)) matchThrow();
    return this.__setCondition('NUMBER_GREATER', [number]);
  }

  whenNumberGreaterThanOrEqualTo(number) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenNumberGreaterThanOrEqualTo");
    if (nargs !== 1 || !is.number(number)) matchThrow();
    return this.__setCondition('NUMBER_GREATER_THAN_EQ', [number]);
  }

  whenNumberLessThan(number) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenNumberLessThan");
    if (nargs !== 1 || !is.number(number)) matchThrow();
    return this.__setCondition('NUMBER_LESS', [number]);
  }

  whenNumberLessThanOrEqualTo(number) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenNumberLessThanOrEqualTo");
    if (nargs !== 1 || !is.number(number)) matchThrow();
    return this.__setCondition('NUMBER_LESS_THAN_EQ', [number]);
  }

  whenNumberNotBetween(start, end) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenNumberNotBetween");
    if (nargs !== 2 || !is.number(start) || !is.number(end)) matchThrow();
    return this.__setCondition('NUMBER_NOT_BETWEEN', [start, end]);
  }

  whenNumberNotEqualTo(number) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenNumberNotEqualTo");
    if (nargs !== 1 || !is.number(number)) matchThrow();
    return this.__setCondition('NUMBER_NOT_EQ', [number]);
  }

  whenTextContains(text) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenTextContains");
    if (nargs !== 1 || !is.string(text)) matchThrow();
    return this.__setCondition('TEXT_CONTAINS', [text]);
  }

  whenTextDoesNotContain(text) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenTextDoesNotContain");
    if (nargs !== 1 || !is.string(text)) matchThrow();
    return this.__setCondition('TEXT_NOT_CONTAINS', [text]);
  }

  whenTextEndsWith(text) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenTextEndsWith");
    if (nargs !== 1 || !is.string(text)) matchThrow();
    return this.__setCondition('TEXT_ENDS_WITH', [text]);
  }

  whenTextEqualTo(text) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenTextEqualTo");
    if (nargs !== 1 || !is.string(text)) matchThrow();
    return this.__setCondition('TEXT_EQ', [text]);
  }

  whenTextStartsWith(text) {
    const { nargs, matchThrow } = signatureArgs(arguments, "FilterCriteriaBuilder.whenTextStartsWith");
    if (nargs !== 1 || !is.string(text)) matchThrow();
    return this.__setCondition('TEXT_STARTS_WITH', [text]);
  }

  __getApiObject() {
    return this.__apiCriteria;
  }

  toString() {
    return 'FilterCriteriaBuilder';
  }
}
