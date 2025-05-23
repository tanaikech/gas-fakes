import { Proxies } from '../../support/proxies.js'
import { newFakeColor } from './fakecolor.js'
import { newFakeRgbColor } from './fakergbcolor.js'
import { FakeColorBase } from './fakecolorbase.js'
import { newFakeThemeColor } from './fakethemecolor.js'
import { signatureArgs } from '../../support/helpers.js'
import { Utils} from '../../support/utils.js'
import { ThemeColorType } from '../enums/sheetsenums.js'
const { is, robToHex } = Utils


/**
 * create a new FakeColorBuilder instance
 * @param  {...any} args 
 * @returns {FakeColorBuilder}
 */
export const newFakeColorBuilder = (...args) => {
  return Proxies.guard(new FakeColorBuilder(...args))
}

export const makeColorFromApi = (apiResult) => {
  const builder = newFakeColorBuilder()
  if (apiResult.themeColor) {
    builder.setThemeColor(ThemeColorType[apiResult.themeColor])
  } else if (apiResult.rgbColor) {
    builder.setRgbColor(robToHex(apiResult.rgbColor))
  }
  return builder.build()
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

    const {nargs, matchThrow} = signatureArgs(arguments, "SpreadsheetApp.ColorBuilder.setRgbColor")
    if (nargs !== 1 || !is.string(cssString)) matchThrow()
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

    const {nargs, matchThrow} = signatureArgs(arguments, "SpreadsheetApp.ColorBuilder.setThemeColor")
    if (nargs !== 1 || !is.object(themeColorType)) matchThrow()
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

