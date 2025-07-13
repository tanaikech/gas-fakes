import { Proxies } from '../../support/proxies.js'
import { newFakeColorBuilder } from '../common/fakecolorbuilder.js'
import { Utils } from '../../support/utils.js'
import { BorderStyle } from '../enums/sheetsenums.js'
const {is, robToHex, BLACK} = Utils



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
   * @param {BorderStyle} p.style border style 
   * @param {number} width border width
   * @param {Color} color ...to be discovered
   * @param {ColorStyle} colorStyle {rgbColor|themeColor}
   * @returns {FakeBorder} a border
   */
  // it's possible that the border info will be null
  // we need to produce various defaults to support the object type
  // rules deduced from GAS tests seem to be
  // color -  an UNSUPPORTED colorType - this is the default 
  // borderStyle - null
  constructor(apiResult) {
    const {color, style, width, colorStyle } = apiResult || {}

    // the border style dotted/dashed etc
    this.__borderStyle = null
    if (style) {
      if (!BorderStyle[style]){
        throw new Error(`unknown border style ${style} received from api`)
      }
      this.__borderStyle = BorderStyle[style]
    }

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

    } else if (color && is.nonEmptyMap(color)) {
      // in this case its just an rgbcolor - and I think only here for legacy - i doubt if this will ever be called
      colorBuilder.setColor(robToHex(color))

    } else if (!apiResult) {
      // this can happen if we got a null from the API so we allow the builder to create an UNSUPPORTED type
      // no action required here
    } else {
      throw new Error ('no color types were provided for border')
    }
    this.__color = colorBuilder.build()
  }
  /**
   * @returns  {BorderStyle} borderStyle border style 
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