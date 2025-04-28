import { Proxies } from '../../support/proxies.js'
import { newNummery } from '../../support/nummery.js'
import { newFakeColorBuilder } from '../commonclasses/fakecolorbuilder.js'
import { Utils } from '../../support/utils.js'
import { isNonEmptyObject } from '@sindresorhus/is'
const {is, robToHex} = Utils
const BLACK = '#000000'


/**
 * create a new FakeBorder instance
 * @param  {...any} args 
 * @returns {FakeBorder}
 */
export const newFakeBorder = (...args) => {
  return Proxies.guard(new FakeBorder(...args))
}
// https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/cells#Border
class FakeBorder {
  /**
   * @param {FakeColor} color
   * @param {object} p result from sheets border query
   * @param {import('../typedefs.js').Style} p.style border style 
   * @param {number} width border width
   * @param {Color} color ...to be discovered
   * @param {ColorStyle} colorStyle {rgbColor|themeColor}
   * @returns {FakeBorder} a border
   */
  constructor({color, style, width, colorStyle }) {
    this.__borderStyle = newNummery(style)

    // TODO not sure what to do with this information yet
    // since width is part of the definition of borderstyle
    this.__width = width

    // if both colorstyle and color are provided, colorstyle takes precendence
    // i think there is some legacy stuff being handled with this multiple option returns
    // so it's likely that the colorStyle will always be returned
    const colorBuilder = newFakeColorBuilder()
    if (colorStyle && is.nonEmptyObject(colorStyle)) {

      if (colorStyle.themeColor) {
        // TODO whats the default theme ?
        colorBuilder.setThemeColor(colorStyle.themeColor) 
      } else if (colorStyle.rgbColor) {
        const rgb = is.emptyObject(colorStyle.rgbColor) ? BLACK : robToHex(colorStyle.rgbColor)
        colorBuilder.setRgbColor(rgb)
      } else {
        throw new Error("border colorstyle missing both rgbColor and themeColor")
      }

    } else if (color && isNonEmptyObject(color)) {
      // in this case its just an rgbcolor - and I think only here for legacy - i doubt if this will ever be called
      colorBuilder.setColor(robToHex(color))

    } else {
      throw new Error ('neither color not colorStyle specified for border')
    }
    this.__color = colorBuilder.build()
  }
  /**
   * @returns  {import('../typedefs.js').Style} borderStyle border style 
   */
  getBorderStyle() {
    return this.__borderStyle
  }
  /**
   * @returns {FakeColor}
   */
  getColor() {
    return this.__color
  }
  toString() {
    return 'Border'
  }
}