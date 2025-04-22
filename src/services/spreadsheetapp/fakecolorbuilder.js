import { Proxies } from '../../support/proxies.js'
import { newFakeColor } from './fakecolor.js'
import { newFakeRgbColor } from './fakergbcolor.js'
import { FakeColorBase } from './fakecolorbase.js'
import { newFakeThemeColor } from './fakethemecolor.js'
/**
 * @file
 * @imports ../typedefs.js
 */
/**
 * create a new FakeColorBuilder instance
 * @param  {...any} args 
 * @returns {FakeColorBuilder}
 */
export const newFakeColorBuilder = (...args) => {
  return Proxies.guard(new FakeColorBuilder(...args))
}


class FakeColorBuilder extends FakeColorBase {
  constructor() {
    super()
  }

  asRgbColor() {
    this.__checkType('RGB', 'RgbColor')
    return newFakeRgbColor(this.__color)
  }

  asThemeColor() {
    this.__checkType('THEME', 'ThemeColor')
    return newFakeThemeColor  (this.__themeColorType)
  }

  /**
   * setRgbColor(cssString) https://developers.google.com/apps-script/reference/spreadsheet/color-builder#setrgbcolorcssstring
   * Sets as RGB color
   * @param {string} cssString The RGB color in CSS notation (such as '#ffffff').
   * @returns {FakeColorBuilder} self
   */
  setRgbColor(cssString) {
    this.__color = cssString
    this.__type = 'RGB'
    return this
  }
  
  /**
   * setThemeColor(themeColorType) https://developers.google.com/apps-script/reference/spreadsheet/color-builder#setthemecolorthemecolortype
   * Sets as theme color.
   * @param {ThemeColorType} The theme color type.
   * @returns {FakeColorBuilder} self
   */
  setThemeColor(themeColorType) {
    this.__themeColorType = themeColorType
    this.__type = 'THEME'
    return this
  }

  build() {
    return newFakeColor(this)
  }
  toString() {
    return 'ColorBuilder'
  }


}

