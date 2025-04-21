/**
 * @file
 * @imports ../typedefs.js
 */
/**
 * create a new FakeColor instance
 * @param  {...any} args 
 * @returns {FakeThemeColor}
 */
export const FakeThemeColor = (...args) => {
  return Proxies.guard(new FakeThemeColor(...args))
}


class FakeThemeColor {
  constructor(color) {
    this.__color = color
  }
  /**
   * getColorType() https://developers.google.com/apps-script/reference/spreadsheet/theme-color#getcolortype
   * Get the type of this color.
   * @returns {ColorType}
   */
  getColorType() {
    return this.__color
  }
  /**
   * getThemeColorType() https://developers.google.com/apps-script/reference/spreadsheet/theme-color#getthemecolortype
   * Get the theme color type of this color.
   * @returns {ThemeColorType}
   */
  getThemeColorType() {
    return this.__color
  }

}

