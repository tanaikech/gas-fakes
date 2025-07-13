import { Proxies } from '../../support/proxies.js'
import { Utils } from '../../support/utils.js'
import { ColorType } from '../enums/sheetsenums.js'
const { validateHex } = Utils

/**
 * create a new FakeRgbColor instance
 * @param  {...any} args 
 * @returns {FakeRgbColor}
 */
export const newFakeRgbColor = (...args) => {
  return Proxies.guard(new FakeRgbColor(...args))
}


class FakeRgbColor {
  constructor(color) {
    this.__color = color
    this.__type = ColorType.RGB
  }
  toString() {
    return 'RgbColor'
  }

  __checkHex() {
    const v = validateHex(this.__color)
    if (!v) throw this.__invalidArg(this.__color)
    return v
  }

  __invalidArg(value) {
    throw new Error(`Invalid argument ${value}`)
  }
  /**
   * asHexString() https://developers.google.com/apps-script/reference/base/rgb-color.html#ashexstring
   * Returns the color as a CSS-style 7 character hexadecimal string (#rrggbb) or 9 character hexadecimal string (#aarrggbb).
   * @returns {string}
   */
  asHexString() {
    return this.__checkHex().hex
  }

  /**
   * getBlue() https://developers.google.com/apps-script/reference/base/rgb-color.html#getblue
   * The blue channel of this color, as a number from 0 to 255.
   * @returns {number}
   */
  getBlue() {
    return this.__checkHex().b
  }
  /**
   * getColorType() https://developers.google.com/apps-script/reference/base/rgb-color.html#getcolortype
   * Get the type of this color.
   * @returns {ColorType}
   */
  getColorType() {
    return this.__type
  }
  /**
   * getGreen() https://developers.google.com/apps-script/reference/base/rgb-color.html#getgreen
   * The green channel of this color, as a number from 0 to 255.
   * @returns {number}
   */
  getGreen() {
    return this.__checkHex().g
  }
  /**
   * getRed() https://developers.google.com/apps-script/reference/base/rgb-color.html#getred
   * The red channel of this color, as a number from 0 to 255.
   * @returns {number}
   */
  getRed() {
    return this.__checkHex().r
  }
}

