import { Proxies } from '../../support/proxies.js';

export const newFakeChoice = (...args) => {
  return Proxies.guard(new FakeChoice(...args));
};

/**
 * @class FakeChoice
 * A fake for the Choice class in Apps Script.
 * @see https://developers.google.com/apps-script/reference/forms/choice
 */
export class FakeChoice {
  /**
   * @param {string} value The value of the choice.
   * @param {boolean} isCorrect Whether the choice is correct.
   * @param {import('./pagebreakitem.js').FakePageBreakItem} page The page to navigate to.
   * @param {FormApp.PageNavigationType} navigationType The navigation type.
   */
  constructor(value, isCorrect, page, navigationType) {
    this.__value = value;
    this.__isCorrect = isCorrect;
    this.__page = page;
    this.__navigationType = navigationType;
  }

  getGotoPage() {
    return this.__page;
  }

  getIsCorrect() {
    return this.__isCorrect;
  }

  getPageNavigationType() {
    return this.__navigationType;
  }

  getValue() {
    return this.__value;
  }

  toString() {
    return 'Choice';
  }
}