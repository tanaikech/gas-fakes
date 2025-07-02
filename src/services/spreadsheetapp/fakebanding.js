import { Proxies } from '../../support/proxies.js';
import { batchUpdate, bandingThemeMap, makeSheetsGridRange, isRange, defaultThemeColors } from './sheetrangehelpers.js';
import { newFakeSheetRange } from './fakesheetrange.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { BandingTheme } from '../enums/sheetsenums.js';

const { rgbToHex, hexToRgb, is, isEnum, normalizeColorStringToHex } = Utils;

/**
 * @returns {FakeBanding}
 */
export const newFakeBanding = (...args) => {
  return Proxies.guard(new FakeBanding(...args));
};

/**
 * Represents a banding.
 */
export class FakeBanding {
  /**
   * @param {object} apiBandedRange The BandedRange object from Sheets API
   * @param {FakeSheet} sheet The parent sheet
   */
  constructor(bandedRange, sheet) {
    this.__apiBandedRange = bandedRange;
    this.__sheet = sheet;

    const props = [];
    props.forEach(f => {
      this[f] = () => notYetImplemented(f);
    });
  }

  __getColor(colorStyle) {
    if (!colorStyle) {
      return null;
    }
    const builder = SpreadsheetApp.newColor();
    if (colorStyle.rgbColor) {
      const { red = 0, green = 0, blue = 0 } = colorStyle.rgbColor;
      builder.setRgbColor(rgbToHex(red, green, blue));
    } else if (colorStyle.themeColor) {
      builder.setThemeColor(SpreadsheetApp.ThemeColorType[colorStyle.themeColor]);
    } else {
      return null;
    }
    return builder.build();
  }

  __getColorStyle(color) {
    if (color === null) {
      return {}; // Clears the color when used with a field mask
    }
    if (is.string(color)) {
      const hex = normalizeColorStringToHex(color);
      if (!hex) throw new Error(`Invalid color string: "${color}"`);
      return { rgbColor: hexToRgb(hex) };
    }
    if (color && color.toString() === 'Color') {
      const colorType = color.getColorType().toString();
      if (colorType === 'RGB') {
        const hex = color.asRgbColor().asHexString();
        return { rgbColor: hexToRgb(hex) };
      }
      if (colorType === 'THEME') {
        const theme = color.asThemeColor().getThemeColorType().toString();
        return { themeColor: theme };
      }
    }
    return null;
  }

  __updateBandingProperty(path, value) {
    // This builds the nested object structure needed for the Sheets API update request.
    // For a path 'a.b.c', it creates { a: { b: { c: value } } } inside the bandedRange object.
    const props = path.split('.');
    const lastProp = props.pop();

    const bandedRange = {
      bandedRangeId: this.__apiBandedRange.bandedRangeId,
    };

    const deepestObject = props.reduce((currentObject, prop) => (currentObject[prop] = {}), bandedRange);
    deepestObject[lastProp] = value;

    const request = {
      updateBanding: {
        bandedRange,
        fields: path,
      },
    };
    batchUpdate({ spreadsheetId: this.__sheet.getParent().getId(), requests: [request] });
    this.__sheet.getParent().__disruption();

    // The state has changed in the central store, so we need to update this instance's internal object.
    // If the banding was removed, this will be undefined, which is fine.
    const updatedSheetMeta = this.__sheet.getParent().__getSheetMeta(this.__sheet.getSheetId());
    const updatedBanding = updatedSheetMeta.bandedRanges?.find(b => b.bandedRangeId === this.__apiBandedRange.bandedRangeId);
    if (updatedBanding) {
      this.__apiBandedRange = updatedBanding;
    }
    return this;
  }

  __setColorStringProperty(methodName, path, color) {
    const { nargs, matchThrow } = signatureArgs([color], methodName);
    if (nargs !== 1 || (color !== null && !is.string(color))) matchThrow();

    if (color === null && (path.includes('firstBandColorStyle') || path.includes('secondBandColorStyle'))) {
      let propName = methodName.split('.').pop()
        .replace(/^set/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase();
      throw new Error(`${propName.charAt(0).toUpperCase() + propName.slice(1)} should not be null.`);
    }
    const colorStyle = this.__getColorStyle(color);
    if (colorStyle === null) throw new Error(`Invalid color argument for ${methodName}`);
    return this.__updateBandingProperty(path, colorStyle);
  }

  __setColorObjectProperty(methodName, path, color) {
    const { nargs, matchThrow } = signatureArgs([color], methodName);
    if (nargs !== 1 || (color !== null && color.toString() !== 'Color')) matchThrow();

    if (color === null && (path.includes('firstBandColorStyle') || path.includes('secondBandColorStyle'))) {
      let propName = methodName.split('.').pop()
        .replace(/^set/, '')
        .replace(/Object$/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase();
      throw new Error(`${propName.charAt(0).toUpperCase() + propName.slice(1)} should not be null.`);
    }
    const colorStyle = this.__getColorStyle(color);
    if (colorStyle === null) throw new Error(`Invalid color argument for ${methodName}`);
    return this.__updateBandingProperty(path, colorStyle);
  }

  __getColorString(colorStyle) {
    if (!colorStyle) return null;
    if (colorStyle.rgbColor) {
      const { red = 0, green = 0, blue = 0 } = colorStyle.rgbColor;
      return rgbToHex(red, green, blue);
    }
    return colorStyle.themeColor ? (defaultThemeColors[colorStyle.themeColor] || null) : null;
  }

  __colorStylesEqual(style1, style2) {
    if (!style1 && !style2) return true;
    if (!style1 || !style2) return false;

    // If one is theme and other is rgb, they are not equal
    if (!!style1.themeColor !== !!style2.themeColor) return false;

    if (style1.themeColor) {
      return style1.themeColor === style2.themeColor;
    }

    if (style1.rgbColor) {
      // Handle cases where one might be missing rgbColor
      if (!style2.rgbColor) return false;

      // The API can return colors with very high precision.
      // We compare them with a small tolerance.
      const r1 = style1.rgbColor.red || 0;
      const g1 = style1.rgbColor.green || 0;
      const b1 = style1.rgbColor.blue || 0;

      const r2 = style2.rgbColor.red || 0;
      const g2 = style2.rgbColor.green || 0;
      const b2 = style2.rgbColor.blue || 0;

      const tolerance = 1e-4;
      return Math.abs(r1 - r2) < tolerance && Math.abs(g1 - g2) < tolerance && Math.abs(b1 - b2) < tolerance;
    }
    return false;
  }

  copyTo(range) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Banding.copyTo');
    if (nargs !== 1 || !isRange(range)) matchThrow();

    const newApiBanding = {
      range: makeSheetsGridRange(range),
    };
    if (this.__apiBandedRange.rowProperties) {
      newApiBanding.rowProperties = this.__apiBandedRange.rowProperties;
    }
    if (this.__apiBandedRange.columnProperties) {
      newApiBanding.columnProperties = this.__apiBandedRange.columnProperties;
    }

    const request = {
      addBanding: { bandedRange: newApiBanding },
    };

    const response = batchUpdate({ spreadsheetId: this.__sheet.getParent().getId(), requests: [request] });
    const createdBanding = response.replies[0].addBanding.bandedRange;
    this.__sheet.getParent().__disruption();
    return newFakeBanding(createdBanding, this.__sheet);
  }

  getFooterColumnColor() {
    return this.__getColorString(this.__apiBandedRange.columnProperties?.footerColorStyle);
  }

  getFooterColumnColorObject() {
    return this.__getColor(this.__apiBandedRange.columnProperties?.footerColorStyle);
  }

  getFooterRowColor() {
    return this.__getColorString(this.__apiBandedRange.rowProperties?.footerColorStyle);
  }

  getFooterRowColorObject() {
    return this.__getColor(this.__apiBandedRange.rowProperties?.footerColorStyle);
  }

  getFirstColumnColor() {
    return this.__getColorString(this.__apiBandedRange.columnProperties?.firstBandColorStyle);
  }

  getFirstColumnColorObject() {
    return this.__getColor(this.__apiBandedRange.columnProperties?.firstBandColorStyle);
  }

  getFirstRowColor() {
    return this.__getColorString(this.__apiBandedRange.rowProperties?.firstBandColorStyle);
  }

  getFirstRowColorObject() {
    return this.__getColor(this.__apiBandedRange.rowProperties?.firstBandColorStyle);
  }

  getHeaderColumnColor() {
    return this.__getColorString(this.__apiBandedRange.columnProperties?.headerColorStyle);
  }

  getHeaderColumnColorObject() {
    return this.__getColor(this.__apiBandedRange.columnProperties?.headerColorStyle);
  }

  getHeaderRowColor() {
    return this.__getColorString(this.__apiBandedRange.rowProperties?.headerColorStyle);
  }

  getHeaderRowColorObject() {
    return this.__getColor(this.__apiBandedRange.rowProperties?.headerColorStyle);
  }

  getRange() {
    return newFakeSheetRange(this.__apiBandedRange.range, this.__sheet);
  }

  getSecondColumnColor() {
    return this.__getColorString(this.__apiBandedRange.columnProperties?.secondBandColorStyle);
  }

  getSecondColumnColorObject() {
    return this.__getColor(this.__apiBandedRange.columnProperties?.secondBandColorStyle);
  }

  getSecondRowColor() {
    return this.__getColorString(this.__apiBandedRange.rowProperties?.secondBandColorStyle);
  }

  getSecondRowColorObject() {
    return this.__getColor(this.__apiBandedRange.rowProperties?.secondBandColorStyle);
  }

  remove() {
    const request = { deleteBanding: { bandedRangeId: this.__apiBandedRange.bandedRangeId } };
    batchUpdate({ spreadsheetId: this.__sheet.getParent().getId(), requests: [request] });
    this.__sheet.getParent().__disruption();
  }

  setFooterColumnColor(color) {
    return this.__setColorStringProperty('Banding.setFooterColumnColor', 'columnProperties.footerColorStyle', color);
  }

  setFooterColumnColorObject(color) {
    return this.__setColorObjectProperty('Banding.setFooterColumnColorObject', 'columnProperties.footerColorStyle', color);
  }

  setFooterRowColor(color) {
    return this.__setColorStringProperty('Banding.setFooterRowColor', 'rowProperties.footerColorStyle', color);
  }

  setFooterRowColorObject(color) {
    return this.__setColorObjectProperty('Banding.setFooterRowColorObject', 'rowProperties.footerColorStyle', color);
  }

  setFirstColumnColor(color) {
    return this.__setColorStringProperty('Banding.setFirstColumnColor', 'columnProperties.firstBandColorStyle', color);
  }

  setFirstColumnColorObject(color) {
    return this.__setColorObjectProperty('Banding.setFirstColumnColorObject', 'columnProperties.firstBandColorStyle', color);
  }

  setFirstRowColor(color) {
    return this.__setColorStringProperty('Banding.setFirstRowColor', 'rowProperties.firstBandColorStyle', color);
  }

  setFirstRowColorObject(color) {
    return this.__setColorObjectProperty('Banding.setFirstRowColorObject', 'rowProperties.firstBandColorStyle', color);
  }

  setHeaderColumnColor(color) {
    return this.__setColorStringProperty('Banding.setHeaderColumnColor', 'columnProperties.headerColorStyle', color);
  }

  setHeaderColumnColorObject(color) {
    return this.__setColorObjectProperty('Banding.setHeaderColumnColorObject', 'columnProperties.headerColorStyle', color);
  }

  setHeaderRowColor(color) {
    return this.__setColorStringProperty('Banding.setHeaderRowColor', 'rowProperties.headerColorStyle', color);
  }

  setHeaderRowColorObject(color) {
    return this.__setColorObjectProperty('Banding.setHeaderRowColorObject', 'rowProperties.headerColorStyle', color);
  }

  setRange(range) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Banding.setRange');
    if (nargs !== 1 || !isRange(range)) matchThrow();

    const gridRange = makeSheetsGridRange(range);
    return this.__updateBandingProperty('range', gridRange);
  }

  setSecondColumnColor(color) {
    return this.__setColorStringProperty('Banding.setSecondColumnColor', 'columnProperties.secondBandColorStyle', color);
  }

  setSecondColumnColorObject(color) {
    return this.__setColorObjectProperty('Banding.setSecondColumnColorObject', 'columnProperties.secondBandColorStyle', color);
  }

  setSecondRowColor(color) {
    return this.__setColorStringProperty('Banding.setSecondRowColor', 'rowProperties.secondBandColorStyle', color);
  }

  setSecondRowColorObject(color) {
    return this.__setColorObjectProperty('Banding.setSecondRowColorObject', 'rowProperties.secondBandColorStyle', color);
  }

  toString() {
    return 'Banding';
  }
}