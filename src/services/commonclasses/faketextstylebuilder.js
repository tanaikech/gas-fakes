import { Proxies } from '../../support/proxies.js'
import { notYetImplemented, signatureArgs } from '../../support/helpers.js'
import { Utils } from '../../support/utils.js'
import { newFakeTextStyle } from './faketextstyle.js'
import { newFakeColorBuilder } from './fakecolorbuilder.js'

const { is, validateHex } = Utils
/**
 * @file
 * @imports ../typedefs.js
 */
/**
 * create a new FakeTextStyleBuilder instance
 * @param  {...any} args 
 * @returns {FakeTextStyleBuilder}
 */
export const newFakeTextStyleBuilder = (...args) => {
  return Proxies.guard(new FakeTextStyleBuilder(...args))
}

/**
 * make a text style from an apiquery
 * @param {import('../typedefs.js').TextFormat} apiResult
 * @returns {FakeTextStyle} a fake text style
 */
export const makeTextStyleFromApi = (apiResult) => {
  // its possible that the api result will be null
  const { 
    foregroundColor = null, 
    foregroundColorStyle = null, 
    fontfamily = null, 
    fontSize = null, 
    bold = null, 
    italic = null, 
    underline = null, 
    strikethrough = null, 
    // this one is ignored as gfar as i can tell
    link = null 
  } = apiResult || {}

  const builder = newFakeTextStyleBuilder()
  // it seems that the default for everything is null if not specified
  builder.setFontFamily(fontfamily)
  builder.setFontSize(fontSize)
  builder.setBold(bold)
  builder.setItalic(italic)
  builder.setUnderline(underline)
  builder.setStrikethrough(strikethrough)
  const cb = newFakeColorBuilder

  // so weird stuff here
  const makeFromRgb = (rgb) => {
    builder.setForegroundColorObject = cb().setRgbColor(rgb).build()
    builder.setForegroundColor = cb().setRgbColor(rgb).build()
  }

  // if we have a foreground color - it'll be rgb and we need to create an rgbcolor object and a colorstyle object
  if (foregroundColor) {
    makeFromRgb(foregroundColor)
  }
  // if we have a color style it could be either a theme or rgb - if its rgb we'll overwrite the colorstyle created above if there was one
  if (foregroundColorStyle) {
    // theme type color
    if (foregroundColorStyle.themeColor) {
      builder.setForeGroundColorObject = newFakeColorBuilder().setThemeColor(foregroundColorStyle.themeColor).build()
    } else if (foregroundColorStyle.rgbColor) {
      makeFromRgb (is.emptyObject(foregroundColorStyle.rgbColor) ? BLACK : robToHex(foregroundColorStyle.rgbColor))
    } else {
      throw new Error("text colorstyle missing both rgbColor and themeColor")
    }
  }
  return builder.build()
}

const nargCheck = (prop, args, req, reqType) => {
  const { nargs, matchThrow } = signatureArgs(args, "TextStyleBuilder." + prop)
  if (nargs !== req) matchThrow()
  if (req === 1 && reqType && !is[reqType](args[0])) matchThrow()
  return {
    nargs, matchThrow
  }
}

class FakeTextStyleBuilder {
  constructor() {
    // all values start as null
    this.__bold = null
    this.__italic = null
    this.__underline = null
    this.__strikethrough = null
    this.__foregroundColor = null
    this.__fontFamily = null
    this.__fontSize = null
    // doesn't seem to be a way to get this one
    this.__link = null
    this.__foregroundColorObject = null

  }

  /**
   * build() https://developers.google.com/apps-script/reference/spreadsheet/text-style-builder#build
   * Creates a text style from this builder.
   * returns {FakeTextStyle}
   */
  build() {
    return newFakeTextStyle(this)
  }

  /**
   * setBold(bold) https://developers.google.com/apps-script/reference/spreadsheet/text-style-builder#setboldbold
   * Sets whether or not the text is bold.
   * @param {boolean} bold 
   * @returns {FakeTextStyleBuilder} self
   */
  setBold(bold) {
    nargCheck('setBold', arguments, 1, 'boolean')
    this.__bold = bold
    return this
  }

  /**
   * setFontFamily(fontFamily) https://developers.google.com/apps-script/reference/spreadsheet/text-style-builder#setfontfamilyfontfamily
   * Sets the text font family, such as "Arial".
   * @param {string} fontFamily 
   * @returns {FakeTextStyleBuilder} self
   */
  setFontFamily(fontFamily) {
    nargCheck('setFontFamily', arguments, 1, "string")
    this.__fontFamily = fontFamily
    return this
  }

  /**
   * setFontSize(fontSize) https://developers.google.com/apps-script/reference/spreadsheet/text-style-builder#setfontsizefontsize
   * Sets the text font size in points.
   * @param {number} fontSize 
   * @returns {FakeTextStyleBuilder} self
   */
  setFontSize(fontSize) {
    nargCheck('setFontSize', arguments, 1, "integer")
    this.__fontSize = fontSize
    return this
  }

  /**
   * setItalic(italic) https://developers.google.com/apps-script/reference/spreadsheet/text-style-builder#setitalicitalic
   * Sets whether or not the text is italic.
   * @param {boolean} italic 
   * @returns {FakeTextStyleBuilder} self
   */
  setItalic(italic) {
    nargCheck('setItalic', arguments, 1, 'boolean')
    this.__italic = italic
    return this
  }

  /**
   * this one is deprecated, but I'll implement it anyway
   * setForeGroundColor(cssString) https://developers.google.com/apps-script/reference/spreadsheet/text-style-builder#setforegroundcolorcssstring https://developers.google.com/apps-script/reference/spreadsheet/text-style-builder#setforegroundcolorobjectcolor
   * Sets the text font color.
   * @param {string} cssString 
   * @returns {FakeTextStyleBuilder} self
   */
  setForeGroundColor(cssString) {
    nargCheck('setForeGroundColor', arguments, 1, "string")
    this.__foregroundColor = validateHex(cssString).hex
    return this
  }

  /**
   * setForegroundColorObject(color) https://developers.google.com/apps-script/reference/spreadsheet/text-style-builder#setforegroundcolorobjectcolor
   * Sets the text font color.
   * @param {FakeColor} foregroundColor 
   * @returns {FakeTextStyleBuilder} self
   */
  setForeGroundColorObject(foregroundColor) {
    nargCheck('setForeGroundColorObject', arguments, 1, "object")
    this.__foregroundColorObject = foregroundColor
    return this
  }

  /**
   * setUnderline(underline) https://developers.google.com/apps-script/reference/spreadsheet/text-style-builder#setunderlineunderline
   * Sets whether or not the text is underline.
   * @param {boolean} underline 
   * @returns {FakeTextStyleBuilder} self
   */
  setUnderline(underline) {
    nargCheck('setUnderline', arguments, 1, 'boolean')
    this.__underline = underline
    return this
  }

  /**
   * setStrikethrough(strikethrough) https://developers.google.com/apps-script/reference/spreadsheet/text-style-builder#setstrikethroughstrikethrough
   * Sets whether or not the text is strikethrough.
   * @param {boolean} strikethrough 
   * @returns {FakeTextStyleBuilder} self
   */
  setStrikethrough(strikethrough) {
    nargCheck('setStrikethrough', arguments, 1, 'boolean')
    this.__strikethrough = strikethrough
    return this
  }

  // this one isnt documented, so I wont implement yet - not sure what it's supposed to do
  copy() {
    return notYetImplemented('TextStyleBuilder.copy')
  }

  toString() {
    return 'TextStyleBuilder'
  }


}

