import { Proxies } from '../../support/proxies.js'
import { FakeColorBase } from './fakecolorbase.js'
import { newFakeRgbColor } from './fakergbcolor.js'
import { newFakeThemeColor } from './fakethemecolor.js'



/**
 * create a new FakeColor instance
 * @param  {...any} args 
 * @returns {FakeColor}
 */
export const newFakeColor = (...args) => {
  return Proxies.guard(new FakeColor(...args))
}


class FakeColor extends FakeColorBase {
  constructor(builder) {
    super()
    this.__type = builder.__type
    this.__color = builder.__color
    this.__themeColorType = builder.__themeColorType
  }
  asRgbColor() {
    this.__checkType('RGB', 'RgbColor')
    return newFakeRgbColor(this.__color)
  }
  asThemeColor() {
    this.__checkType('THEME', 'ThemeColor')
    return newFakeThemeColor(this.__themeColorType)
  }
  toString() {
    return 'Color'
  }


}

