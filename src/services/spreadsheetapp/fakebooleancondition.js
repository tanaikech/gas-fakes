import { Proxies } from '../../support/proxies.js';
import { BooleanCriteria } from '../enums/sheetsenums.js';
import { newFakeColor } from '../common/fakecolor.js';
import { makeColorFromApi } from '../common/fakecolorbuilder.js';

export const newFakeBooleanCondition = (...args) => {
  return Proxies.guard(new FakeBooleanCondition(...args));
};

export class FakeBooleanCondition {
  constructor(apiCondition, format) {
    this.__apiCondition = apiCondition;
    this.__format = format || {};
  }

  getBackgroundObject() {
    if (this.__format.backgroundColorStyle) {
      return makeColorFromApi(this.__format.backgroundColorStyle);
    }
    if (this.__format.backgroundColor) {
      return makeColorFromApi({ rgbColor: this.__format.backgroundColor });
    }
    return null;
  }

  getBold() {
    return this.__format.textFormat?.bold ?? null;
  }

  getCriteriaType() {
    // The API uses slightly different strings than the GAS enum for many rules
    const map = {
      'BLANK': 'CELL_EMPTY',
      'NOT_BLANK': 'CELL_NOT_EMPTY',
      'DATE_AFTER': 'DATE_AFTER',
      'DATE_BEFORE': 'DATE_BEFORE',
      'DATE_EQ': 'DATE_EQUAL_TO',
      'DATE_NOT_EQ': 'DATE_NOT_EQUAL_TO',
      'DATE_AFTER_RELATIVE': 'DATE_AFTER_RELATIVE',
      'DATE_BEFORE_RELATIVE': 'DATE_BEFORE_RELATIVE',
      'DATE_EQUAL_TO_RELATIVE': 'DATE_EQUAL_TO_RELATIVE',
      'DATE_EQ_RELATIVE': 'DATE_EQUAL_TO_RELATIVE',
      'NUMBER_BETWEEN': 'NUMBER_BETWEEN',
      'NUMBER_NOT_BETWEEN': 'NUMBER_NOT_BETWEEN',
      'NUMBER_EQ': 'NUMBER_EQUAL_TO',
      'NUMBER_NOT_EQ': 'NUMBER_NOT_EQUAL_TO',
      'NUMBER_GREATER': 'NUMBER_GREATER_THAN',
      'NUMBER_GREATER_THAN_EQ': 'NUMBER_GREATER_THAN_OR_EQUAL_TO',
      'NUMBER_LESS': 'NUMBER_LESS_THAN',
      'NUMBER_LESS_THAN_EQ': 'NUMBER_LESS_THAN_OR_EQUAL_TO',
      'TEXT_CONTAINS': 'TEXT_CONTAINS',
      'TEXT_NOT_CONTAINS': 'TEXT_DOES_NOT_CONTAIN',
      'TEXT_EQ': 'TEXT_EQUAL_TO',
      'TEXT_NOT_EQ': 'TEXT_NOT_EQUAL_TO',
      'TEXT_STARTS_WITH': 'TEXT_STARTS_WITH',
      'TEXT_ENDS_WITH': 'TEXT_ENDS_WITH',
      'CUSTOM_FORMULA': 'CUSTOM_FORMULA'
    };

    // If the API value contains RELATIVE properties it should probably be resolved to the _RELATIVE equivalents 
    // However the API 'type' doesn't usually distinguish between DATE_EQ and DATE_EQUAL_TO_RELATIVE at the root level,
    // they are often just DATE_EQ and the value object specifies if it's relative.
    // Let's infer if it's relative.
    let type = this.__apiCondition.type;
    if (type && type.startsWith('DATE_')) {
      const isRelative = this.__apiCondition.values && this.__apiCondition.values.some(v => v.relativeDate !== undefined);
      if (isRelative && !type.endsWith('_RELATIVE')) {
        type += '_RELATIVE';
      }
    }

    const enumKey = map[type] || type;

    // Return the Enum if available
    if (BooleanCriteria[enumKey]) {
      return BooleanCriteria[enumKey];
    }
    
    return enumKey || null;
  }

  getCriteriaValues() {
    if (!this.__apiCondition.values) return [];
    
    // API condition values are typically { userEnteredValue: 'string' } or { relativeDate: 'TODAY' }
    return this.__apiCondition.values.map(v => {
      if (v.userEnteredValue !== undefined) return v.userEnteredValue;
      // In Apps Script, RelativeDate enum values are typically returned as strings matching the enum
      if (v.relativeDate !== undefined) return SpreadsheetApp.RelativeDate[v.relativeDate] || v.relativeDate; 
      return null;
    });
  }

  getFontColorObject() {
    if (this.__format.textFormat?.foregroundColorStyle) {
      return makeColorFromApi(this.__format.textFormat.foregroundColorStyle);
    }
    if (this.__format.textFormat?.foregroundColor) {
      return makeColorFromApi({ rgbColor: this.__format.textFormat.foregroundColor });
    }
    return null;
  }

  getItalic() {
    return this.__format.textFormat?.italic ?? null;
  }

  getStrikethrough() {
    return this.__format.textFormat?.strikethrough ?? null;
  }

  getUnderline() {
    return this.__format.textFormat?.underline ?? null;
  }

  toString() {
    return 'BooleanCondition';
  }
}
