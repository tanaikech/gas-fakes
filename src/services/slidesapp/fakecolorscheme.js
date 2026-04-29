import { Proxies } from '../../support/proxies.js';
import { newFakeColor } from '../common/fakecolor.js';
import { newFakeColorBuilder } from '../common/fakecolorbuilder.js';
import { ThemeColorType } from '../enums/slidesenums.js';
import { signatureArgs } from '../../support/helpers.js';

export const newFakeColorScheme = (...args) => {
  return Proxies.guard(new FakeColorScheme(...args));
};

/**
 * @class FakeColorScheme
 */
export class FakeColorScheme {
  constructor(parent) {
    this.__parent = parent;
  }

  get __masterPage() {
    const parent = this.__parent;
    const type = parent.toString();

    if (type === 'Master') return parent;
    if (type === 'Slide' || type === 'Layout') {
      // Find the master for this slide/layout
      if (type === 'Slide') {
        const layout = parent.getLayout();
        return layout ? layout.getMaster() : null;
      } else {
        return parent.getMaster();
      }
    }
    if (type === 'Presentation') {
      // Use the first master of the presentation
      const masters = parent.getMasters();
      if (masters.length > 0) {
        return masters[0];
      }
    }
    return null;
  }

  get __resource() {
    const master = this.__masterPage;
    return master?.__resource?.pageProperties?.colorScheme || { colors: [] };
  }

  /**
   * getConcreteColor(themeColorType) https://developers.google.com/apps-script/reference/slides/color-scheme#getconcretecolorthemecolortype
   * @param {ThemeColorType} themeColorType
   * @returns {FakeColor}
   */
  getConcreteColor(themeColorType) {
    const { nargs, matchThrow } = signatureArgs(arguments, "ColorScheme.getConcreteColor");
    if (nargs !== 1) matchThrow();

    const colors = this.__resource.colors || [];
    const typeStr = themeColorType.toString();
    const pair = colors.find(c => c.type === typeStr);

    if (pair && pair.color) {
      return makeColorFromApiForSlides(pair.color);
    }

    return null;
  }

  /**
   * getThemeColors() https://developers.google.com/apps-script/reference/slides/color-scheme#getthemecolors
   * @returns {ThemeColorType[]}
   */
  getThemeColors() {
    return Object.keys(ThemeColorType)
      .filter(k => k !== 'UNSUPPORTED')
      .map(k => ThemeColorType[k]);
  }

  /**
   * setConcreteColor(themeColorType, color) https://developers.google.com/apps-script/reference/slides/color-scheme#setconcretecolorthemecolortype,color
   * @param {ThemeColorType} themeColorType
   * @param {FakeColor} color
   * @returns {FakeColorScheme} self
   */
  setConcreteColor(themeColorType, color) {
    const { nargs, matchThrow } = signatureArgs(arguments, "ColorScheme.setConcreteColor");
    if (nargs !== 2) matchThrow();

    const master = this.__masterPage;
    if (!master) throw new Error('Could not find master page for color scheme');

    const presentationId = master.__presentation.getId();
    const typeStr = themeColorType.toString();

    // The API requires ALL theme colors to be present when updating the color scheme.
    // So we fetch the current colors, update the one we want, and send them all back.
    const currentResource = this.__resource;
    const colors = [...(currentResource.colors || [])];

    // Convert the new Color to API format
    const apiColor = {};
    if (color.getColorType().toString() === 'RGB') {
      const rgb = color.asRgbColor();
      apiColor.red = rgb.getRed() / 255;
      apiColor.green = rgb.getGreen() / 255;
      apiColor.blue = rgb.getBlue() / 255;
    } else if (color.getColorType().toString() === 'THEME') {
      apiColor.themeColor = color.asThemeColor().getThemeColorType().toString();
    }

    // Find and update or add the color pair
    const index = colors.findIndex(c => c.type === typeStr);
    if (index !== -1) {
      colors[index] = { type: typeStr, color: apiColor };
    } else {
      colors.push({ type: typeStr, color: apiColor });
    }

    // Ensure we have exactly the right set of colors if possible?
    // The API error said "must have 12 theme colors pairs".
    // Usually these are the standard 12 types.

    const requests = [{
      updatePageProperties: {
        objectId: master.getObjectId(),
        pageProperties: {
          colorScheme: {
            colors: colors
          }
        },
        fields: 'colorScheme'
      }
    }];

    Slides.Presentations.batchUpdate(requests, presentationId);
    return this;
  }

  toString() {
    return 'ColorScheme';
  }
}

// Helper to avoid circular dependency or reusing the spreadsheet-specific one if it differs
const makeColorFromApiForSlides = (apiColor) => {
  const builder = newFakeColorBuilder();
  const rgb = apiColor.rgbColor || (apiColor.red !== undefined ? apiColor : null);
  
  if (rgb) {
    const hex = '#' + [rgb.red, rgb.green, rgb.blue].map(v => {
      const val = Math.round((v || 0) * 255);
      const hex = val.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
    builder.setRgbColor(hex);
  } else if (apiColor.themeColor) {
    const tc = apiColor.themeColor;
    builder.setThemeColor(ThemeColorType[tc]);
  }
  return builder.build();
};
