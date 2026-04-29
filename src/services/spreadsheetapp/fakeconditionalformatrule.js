import { Proxies } from '../../support/proxies.js';
import { newFakeBooleanCondition } from './fakebooleancondition.js';
import { newFakeGradientCondition } from './fakegradientcondition.js';
import { newFakeSheetRange } from './fakesheetrange.js';
import { newFakeConditionalFormatRuleBuilder } from './fakeconditionalformatrulebuilder.js';

export const newFakeConditionalFormatRule = (...args) => {
  return Proxies.guard(new FakeConditionalFormatRule(...args));
};

export class FakeConditionalFormatRule {
  constructor(apiRule, sheet) {
    this.__apiRule = apiRule;
    this.__sheet = sheet;
  }

  copy() {
    // Builder takes spreadsheet. Sheet gives us spreadsheet via getParent()
    return newFakeConditionalFormatRuleBuilder(this.__apiRule, this.__sheet.getParent());
  }

  getBooleanCondition() {
    if (!this.__apiRule.booleanRule) return null;
    return newFakeBooleanCondition(
      this.__apiRule.booleanRule.condition,
      this.__apiRule.booleanRule.format
    );
  }

  getGradientCondition() {
    if (!this.__apiRule.gradientRule) return null;
    return newFakeGradientCondition(this.__apiRule.gradientRule);
  }

  getRanges() {
    if (!this.__apiRule.ranges) return [];
    return this.__apiRule.ranges.map(gridRange => {
      const sheetId = gridRange.sheetId;
      let sheet = this.__sheet; // Default to the sheet this rule was fetched from
      if (sheetId !== undefined && sheet.getSheetId() !== sheetId) {
        sheet = this.__sheet.getParent().getSheets().find(s => s.getSheetId() === sheetId);
      }
      
      if (!sheet) return null;
      return newFakeSheetRange(
        gridRange,
        sheet
      );
    }).filter(Boolean);
  }

  toString() {
    return 'ConditionalFormatRule';
  }
}
