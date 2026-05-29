import { Proxies } from '../../support/proxies.js';
import { newFakeColorBuilder } from '../common/fakecolorbuilder.js';
import { ThemeColorType } from '../enums/slidesenums.js';

export const newFakeSolidFill = (...args) => {
  return Proxies.guard(new FakeSolidFill(...args));
};

export class FakeSolidFill {
  constructor(fill) {
    this.__fill = fill;
  }

  get __solidFill() {
    return this.__fill.__fill.solidFill || {};
  }

  getAlpha() {
    return this.__solidFill.alpha !== undefined ? this.__solidFill.alpha : 1.0;
  }

  getColor() {
    const apiColor = this.__solidFill.color || {};
    const builder = newFakeColorBuilder();
    
    const rgb = apiColor.rgbColor;
    if (rgb) {
      const hex = '#' + [rgb.red, rgb.green, rgb.blue].map(v => {
        const val = Math.round((v || 0) * 255);
        const hex = val.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
      builder.setRgbColor(hex);
    } else if (apiColor.themeColor) {
      builder.setThemeColor(ThemeColorType[apiColor.themeColor]);
    } else {
      builder.setRgbColor('#FFFFFF');
    }
    return builder.build();
  }

  toString() {
    return 'SolidFill';
  }
}
