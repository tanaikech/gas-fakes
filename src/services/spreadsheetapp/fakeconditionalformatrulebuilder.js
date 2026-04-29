import { Proxies } from '../../support/proxies.js';
import { newFakeConditionalFormatRule } from './fakeconditionalformatrule.js';
import { newFakeBooleanCondition } from './fakebooleancondition.js';
import { newFakeGradientCondition } from './fakegradientcondition.js';
import { makeSheetsGridRange } from './sheetrangehelpers.js';
import { BooleanCriteria, InterpolationType } from '../enums/sheetsenums.js';
import { Utils } from '../../support/utils.js';

export const newFakeConditionalFormatRuleBuilder = (...args) => {
  return Proxies.guard(new FakeConditionalFormatRuleBuilder(...args));
};

export class FakeConditionalFormatRuleBuilder {
  constructor(apiRule = {}, spreadsheet = null) {
    // We deep clone so that modifications to the builder don't affect the original rule immediately
    this.__apiRule = JSON.parse(JSON.stringify(apiRule));
    this.__spreadsheet = spreadsheet;
    
    // Ensure we have at least one rule type established, defaulting to booleanRule if nothing is set
    if (!this.__apiRule.booleanRule && !this.__apiRule.gradientRule) {
      this.__apiRule.booleanRule = {
        condition: { type: 'CUSTOM_FORMULA', values: [] },
        format: {}
      };
    }
  }

  __ensureBooleanRule() {
    if (this.__apiRule.gradientRule) {
      delete this.__apiRule.gradientRule;
    }
    if (!this.__apiRule.booleanRule) {
      this.__apiRule.booleanRule = { condition: { type: 'CUSTOM_FORMULA', values: [] }, format: {} };
    }
    return this.__apiRule.booleanRule;
  }

  __ensureGradientRule() {
    if (this.__apiRule.booleanRule) {
      delete this.__apiRule.booleanRule;
    }
    if (!this.__apiRule.gradientRule) {
      this.__apiRule.gradientRule = { minpoint: {}, midpoint: {}, maxpoint: {} };
    }
    return this.__apiRule.gradientRule;
  }

  __setBooleanFormatProperty(property, value) {
    const rule = this.__ensureBooleanRule();
    if (!rule.format) rule.format = {};
    if (property === 'backgroundColorStyle') {
       // Reset standard rgbColor if style is set
       delete rule.format.backgroundColor;
       if (value === null) {
         delete rule.format.backgroundColorStyle;
       } else {
         rule.format.backgroundColorStyle = value;
       }
    } else if (property === 'backgroundColor') {
       delete rule.format.backgroundColorStyle;
       if (value === null) {
         delete rule.format.backgroundColor;
       } else {
         rule.format.backgroundColor = value;
       }
    } else {
      if (!rule.format.textFormat) rule.format.textFormat = {};
      if (property === 'foregroundColorStyle') {
        delete rule.format.textFormat.foregroundColor;
        if (value === null) {
          delete rule.format.textFormat.foregroundColorStyle;
        } else {
          rule.format.textFormat.foregroundColorStyle = value;
        }
      } else if (property === 'foregroundColor') {
        delete rule.format.textFormat.foregroundColorStyle;
        if (value === null) {
          delete rule.format.textFormat.foregroundColor;
        } else {
          rule.format.textFormat.foregroundColor = value;
        }
      } else {
        if (value === null) {
          delete rule.format.textFormat[property];
        } else {
          rule.format.textFormat[property] = value;
        }
      }
    }
    return this;
  }

  __colorToApiStyle(colorObj) {
    if (!colorObj) return null;
    const type = colorObj.getColorType().toString();
    if (type === 'THEME') {
      return { themeColor: colorObj.asThemeColor().getThemeColorType().toString() };
    } else if (type === 'RGB') {
      const rgb = colorObj.asRgbColor();
      return {
        rgbColor: {
          red: rgb.getRed() / 255,
          green: rgb.getGreen() / 255,
          blue: rgb.getBlue() / 255
        }
      };
    }
    return null;
  }

  __cssToApiColor(cssColor) {
    if (!cssColor) return null;
    const hex = Utils.validateHex(cssColor);
    if (!hex) return null;
    return {
      red: hex.r / 255,
      green: hex.g / 255,
      blue: hex.b / 255
    };
  }

  build() {
    let sheet = null;
    if (this.__spreadsheet) {
      if (this.__apiRule.ranges && this.__apiRule.ranges.length > 0) {
         const sheetId = this.__apiRule.ranges[0].sheetId;
         sheet = this.__spreadsheet.getSheets().find(s => s.getSheetId() === sheetId);
      }
      // If no ranges yet or sheet not found, just use the active sheet as a fallback context
      // Note: getActiveSheet() might be stubbed.
      if (!sheet && typeof this.__spreadsheet.getActiveSheet === 'function') {
        try {
          sheet = this.__spreadsheet.getActiveSheet();
        } catch(e) {}
      }
    }

    // Clean up empty gradient points so the API doesn't complain
    if (this.__apiRule.gradientRule) {
      const g = this.__apiRule.gradientRule;
      ['minpoint', 'midpoint', 'maxpoint'].forEach(pt => {
        if (g[pt] && Object.keys(g[pt]).length === 0) {
          delete g[pt];
        }
      });
    }
    
    return newFakeConditionalFormatRule(this.__apiRule, sheet);
  }

  copy() {
    return newFakeConditionalFormatRuleBuilder(this.__apiRule, this.__spreadsheet);
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
      const sheet = this.__spreadsheet.getSheets().find(s => s.getSheetId() === gridRange.sheetId);
      if (!sheet) return null;
      return sheet.getRange(
        gridRange.startRowIndex + 1,
        gridRange.startColumnIndex + 1,
        (gridRange.endRowIndex || sheet.getMaxRows()) - gridRange.startRowIndex,
        (gridRange.endColumnIndex || sheet.getMaxColumns()) - gridRange.startColumnIndex
      );
    }).filter(Boolean);
  }

  setBackground(color) {
    return this.__setBooleanFormatProperty('backgroundColor', this.__cssToApiColor(color));
  }

  setBackgroundObject(color) {
    return this.__setBooleanFormatProperty('backgroundColorStyle', this.__colorToApiStyle(color));
  }

  setBold(bold) {
    return this.__setBooleanFormatProperty('bold', bold);
  }

  setFontColor(color) {
    return this.__setBooleanFormatProperty('foregroundColor', this.__cssToApiColor(color));
  }

  setFontColorObject(color) {
    return this.__setBooleanFormatProperty('foregroundColorStyle', this.__colorToApiStyle(color));
  }

  setItalic(italic) {
    return this.__setBooleanFormatProperty('italic', italic);
  }

  setStrikethrough(strikethrough) {
    return this.__setBooleanFormatProperty('strikethrough', strikethrough);
  }

  setUnderline(underline) {
    return this.__setBooleanFormatProperty('underline', underline);
  }

  __setGradientPoint(point, color, type, value) {
    const rule = this.__ensureGradientRule();
    if (!rule[point]) rule[point] = {};
    if (color !== undefined) {
      if (typeof color === 'string') {
        rule[point].color = this.__cssToApiColor(color);
        delete rule[point].colorStyle;
      } else if (color !== null) {
        rule[point].colorStyle = this.__colorToApiStyle(color);
        delete rule[point].color;
      }
    }
    if (type !== undefined) rule[point].type = type.toString();
    if (value !== undefined) rule[point].value = value.toString();
    return this;
  }

  setGradientMaxpoint(color) {
    return this.__setGradientPoint('maxpoint', color, InterpolationType.MAX, "");
  }

  setGradientMaxpointObject(color) {
    return this.__setGradientPoint('maxpoint', color, InterpolationType.MAX, "");
  }

  setGradientMaxpointObjectWithValue(color, type, value) {
    return this.__setGradientPoint('maxpoint', color, type, value);
  }

  setGradientMaxpointWithValue(color, type, value) {
    return this.__setGradientPoint('maxpoint', color, type, value);
  }

  setGradientMidpointObjectWithValue(color, type, value) {
    return this.__setGradientPoint('midpoint', color, type, value);
  }

  setGradientMidpointWithValue(color, type, value) {
    return this.__setGradientPoint('midpoint', color, type, value);
  }

  setGradientMinpoint(color) {
    return this.__setGradientPoint('minpoint', color, InterpolationType.MIN, "");
  }

  setGradientMinpointObject(color) {
    return this.__setGradientPoint('minpoint', color, InterpolationType.MIN, "");
  }

  setGradientMinpointObjectWithValue(color, type, value) {
    return this.__setGradientPoint('minpoint', color, type, value);
  }

  setGradientMinpointWithValue(color, type, value) {
    return this.__setGradientPoint('minpoint', color, type, value);
  }

  setRanges(ranges) {
    const arr = Array.isArray(ranges) ? ranges : [ranges];
    this.__apiRule.ranges = arr.map(r => makeSheetsGridRange(r));
    return this;
  }

  __setBooleanCriteria(type, args = []) {
    const rule = this.__ensureBooleanRule();
    rule.condition = {
      type: type,
      values: args.map(a => {
         // handle relative dates vs userEnteredValues
         if (a && a.toString().indexOf('DATE_') === 0 || ['TODAY', 'TOMORROW', 'YESTERDAY', 'PAST_WEEK', 'PAST_MONTH', 'PAST_YEAR'].includes(a.toString())) {
             return { relativeDate: a.toString() };
         }
         // Handle real Date objects
         if (a instanceof Date) {
            // Sheets API accepts dates in "MM/dd/yyyy" format for userEnteredValue, or as a formula like "=DATE(y,m,d)"
            // Let's format it as a formula to be globally safe, or as MM/dd/yyyy.
            // Actually, Sheets accepts "MM/dd/yyyy" universally in userEnteredValue for dates.
            const m = a.getMonth() + 1;
            const d = a.getDate();
            const y = a.getFullYear();
            return { userEnteredValue: `${m}/${d}/${y}` };
         }
         return { userEnteredValue: a.toString() };
      })
    };
    return this;
  }

  whenCellEmpty() { return this.__setBooleanCriteria('BLANK'); }
  whenCellNotEmpty() { return this.__setBooleanCriteria('NOT_BLANK'); }
  whenDateAfter(date) { return this.__setBooleanCriteria('DATE_AFTER', [date]); }
  whenDateBefore(date) { return this.__setBooleanCriteria('DATE_BEFORE', [date]); }
  whenDateEqualTo(date) { return this.__setBooleanCriteria('DATE_EQ', [date]); }
  whenFormulaSatisfied(formula) { return this.__setBooleanCriteria('CUSTOM_FORMULA', [formula]); }
  whenNumberBetween(start, end) { return this.__setBooleanCriteria('NUMBER_BETWEEN', [start, end]); }
  whenNumberEqualTo(number) { return this.__setBooleanCriteria('NUMBER_EQ', [number]); }
  whenNumberGreaterThan(number) { return this.__setBooleanCriteria('NUMBER_GREATER', [number]); }
  whenNumberGreaterThanOrEqualTo(number) { return this.__setBooleanCriteria('NUMBER_GREATER_THAN_EQ', [number]); }
  whenNumberLessThan(number) { return this.__setBooleanCriteria('NUMBER_LESS', [number]); }
  whenNumberLessThanOrEqualTo(number) { return this.__setBooleanCriteria('NUMBER_LESS_THAN_EQ', [number]); }
  whenNumberNotBetween(start, end) { return this.__setBooleanCriteria('NUMBER_NOT_BETWEEN', [start, end]); }
  whenNumberNotEqualTo(number) { return this.__setBooleanCriteria('NUMBER_NOT_EQ', [number]); }
  whenTextContains(text) { return this.__setBooleanCriteria('TEXT_CONTAINS', [text]); }
  whenTextDoesNotContain(text) { return this.__setBooleanCriteria('TEXT_NOT_CONTAINS', [text]); }
  whenTextEndsWith(text) { return this.__setBooleanCriteria('TEXT_ENDS_WITH', [text]); }
  whenTextEqualTo(text) { return this.__setBooleanCriteria('TEXT_EQ', [text]); }
  whenTextStartsWith(text) { return this.__setBooleanCriteria('TEXT_STARTS_WITH', [text]); }

  withCriteria(criteria, args) {
    // API type is usually same as the enum, except enum uses string keys matching API types mostly.
    return this.__setBooleanCriteria(criteria.toString(), args);
  }

  toString() {
    return 'ConditionalFormatRuleBuilder';
  }
}
