import { Proxies } from '../../support/proxies.js'


/**
 * create a new FakeColor instance
 * @param  {...any} args 
 * @returns {FakeThemeColor}
 */
export const newFakeThemeColor = (...args) => {
  return Proxies.guard(new FakeThemeColor(...args))
}


class FakeThemeColor {

  constructor(themeColorType) {
    this.__type = 'THEME'
    this.__themeColorType = themeColorType
  }

  toString() {
    return 'ThemeColor'
  }

  /**
   * getColorType() https://developers.google.com/apps-script/reference/base/rgb-color.html#getcolortype
   * Get the type of this color.
   * @returns {ColorType}
   */
  getColorType() {
    return this.__type
  }

  getThemeColorType() {
    return this.__themeColorType
  }

}

