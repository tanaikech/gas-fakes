/**
 * @file
 * @imports ../typedefs.js
 */
/**
 * create a new FakeColor instance
 * @param  {...any} args 
 * @returns {FakeRgbColor}
 */
export const FakeRgbColor = (...args) => {
  return Proxies.guard(new FakeRgbColor(...args))
}


class FakeRgbColor {
  constructor(color) {
    this.__color = color
  }
  /**
   * asHexString() https://developers.google.com/apps-script/reference/base/rgb-color.html#ashexstring
   * Returns the color as a CSS-style 7 character hexadecimal string (#rrggbb) or 9 character hexadecimal string (#aarrggbb).
   * @returns {string}
   */
  asHexString() {
    return this.__color
  }
  /**
   * getBlue() https://developers.google.com/apps-script/reference/base/rgb-color.html#getblue
   * The blue channel of this color, as a number from 0 to 255.
   * @returns {number}
   */
  getBlue() {
    return this.__color
  }
  /**
   * getColorType() https://developers.google.com/apps-script/reference/base/rgb-color.html#getcolortype
   * Get the type of this color.
   * @returns {ColorType}
   */
  getColorType() {
    return this.__color
  }
  /**
   * getGreen() https://developers.google.com/apps-script/reference/base/rgb-color.html#getgreen
   * The green channel of this color, as a number from 0 to 255.
   * @returns {number}
   */
  getGreen() {
    return this.__color
  }
  /**
   * getRed() https://developers.google.com/apps-script/reference/base/rgb-color.html#getred
   * The red channel of this color, as a number from 0 to 255.
   * @returns {number}
   */
  getRed() {
    return this.__color
  }
}

