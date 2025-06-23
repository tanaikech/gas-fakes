import { Proxies } from '../../support/proxies.js'
import { Utils } from '../../support/utils.js'
import { newFakeTextStyle } from './faketextstyle.js'
import { newFakeColorBuilder } from './fakecolorbuilder.js'
import { signatureArgs } from '../../support/helpers.js'
const { is, validateHex, robToHex, unCapital, BLACK } = Utils


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
 * @param {TextFormat} apiResult
 * @returns {FakeTextStyle} a fake text style
 */
export const makeTextStyleFromApi = (apiResult) => {
  // its possible that the api result will be null
  const {
    foregroundColor = null,
    foregroundColorStyle = null,
    fontFamily = null,
    fontSize = null,
    bold = null,
    italic = null,
    underline = null,
    strikethrough = null,
    // need to see what's going on here 
    link = null
  } = apiResult || {}

  const builder = newFakeTextStyleBuilder()

  // it seems that the default for everything is null if not specified
  builder.setFontFamily(fontFamily)
  builder.setFontSize(fontSize)

  builder.setBold(bold)
  builder.setItalic(italic)
  builder.setUnderline(underline)
  builder.setStrikethrough(strikethrough)


  // the API appears to return both an rgb and a style
  // the builder should sort out any conflicts between the hex value and the color object provided

  // if we have a foreground color 
  const rgbPresent = is.nonEmptyObject(foregroundColor)
  if (rgbPresent) {
    builder.setForegroundColor(robToHex(foregroundColor))
  }

  // if we have a color style 
  if (is.nonEmptyObject(foregroundColorStyle)) {
    if (foregroundColorStyle.themeColor) {
      const tc = SpreadsheetApp.ThemeColorType[foregroundColorStyle.themeColor]
      if (!tc) {
        throw new Error(`got a bad theme color type ${foregroundColorStyle.themeColor}`)
      }
      builder.setForegroundColorObject(newFakeColorBuilder().setThemeColor(tc).build())
    } else if (foregroundColorStyle.rgbColor) {
      builder.setForegroundColorObject(
        newFakeColorBuilder().setRgbColor(robToHex(foregroundColorStyle.rgbColor)).build())
    } else {
      throw new Error("text colorstyle missing both rgbColor and themeColor")
    }
  }

  if (!rgbPresent && is.null(foregroundColorStyle)) {
    // in this case there is no specifically entered userenteredformat
    // perhaps it would be better to get the effectiveformat, but Apps Script doesn't appear to do that
    // instead it always returns the userenteredformat, even though there isnt one
    // so we'll use the default - this means that if something is say , red because of the theme applied globally, we'll still return black
    builder.setForegroundColor(BLACK)
  }

  // make a textStyle - 
  return builder.build()
}

const nargCheck = (prop, args, req, reqType) => {
  const { nargs, matchThrow } = signatureArgs(args, "TextStyleBuilder." + prop)
  if (nargs !== req) matchThrow()
  // null is always allowed for this builder

  if (!is.null(args[0]) && req === 1 && reqType && !is[unCapital(reqType)](args[0])) matchThrow()
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

    // setup defaults - we have to do this here because in GAS, defaults appear to be only set on building
    this.__bold = Boolean(this.__bold)
    this.__italic = Boolean(this.__italic)
    this.__underline = Boolean(this.__underline)
    this.__strikethrough = Boolean(this.__strikethrough)
    this.__fontSize = this.__fontSize || 10
    this.__fontFamily = this.__fontFamily || "arial,sans,sans-serif"


    // we didnt get a color hex, so pick it up from the color object
    const defRgbFromCob = () => {
      if (this.__foregroundColorObject.getColorType().toString() === 'THEME') {
        // if it's not rgb then we use the theme value
        this.__foregroundColor = this.__foregroundColorObject.asThemeColor().getThemeColorType().toString()
      } else if (this.__foregroundColorObject.getColorType().toString() === 'RGB') {
        this.__foregroundColor = this.__foregroundColorObject.asRgbColor().asHexString()
      } else {
        throw new Error(`unexpected color type ${this.__foregroundColorObject.getColorType().toString()}`)
      }
    }

    // we didnt get a color object so set an RGB type one from the provided hex
    const defCobFromRgb = () => {
      this.__foregroundColorObject = newFakeColorBuilder().setRgbColor(this.__foregroundColor).build()
    }

    if (is.nonEmptyObject(this.__foregroundColorObject) && is.nonEmptyString(this.__foregroundColor)) {
      // both are defined - so foreground color is already set to hex string 
      // TODO - which takes precedence? - assume I need to redefine foreground color based on the color object?
      defRgbFromCob()

    } else if (is.nonEmptyObject(this.__foregroundColorObject)) {
      // only the object is defined, so derive the rgb color from it if it's rgb color type
      // or strangely - a theme color returns the enum value for the themecolortype
      defRgbFromCob()

    } else if (is.nonEmptyString(this.__foregroundColor)) {
      // only the hex is defined, so derive a color object based on that
      defCobFromRgb()

    } else if (is.null(this.__foregroundColorObject) && is.null(this.__foregroundColor)) {
      // they are both null so we need to leave as null

    } else {
      throw new Error(`unexpected color object ${typeof this.__foregroundColorObject} and color hex ${typeof this.__foregroundColor} combination`)
    }
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
   * setForegroundColor(cssString) https://developers.google.com/apps-script/reference/spreadsheet/text-style-builder#setforegroundcolorcssstring https://developers.google.com/apps-script/reference/spreadsheet/text-style-builder#setforegroundcolorobjectcolor
   * Sets the text font color.
   * @param {string} cssString 
   * @returns {FakeTextStyleBuilder} self
   */
  setForegroundColor(cssString) {
    nargCheck('setForegroundColor', arguments, 1, "string")
    this.__foregroundColor = validateHex(cssString).hex
    return this
  }

  /**
   * setForegroundColorObject(color) https://developers.google.com/apps-script/reference/spreadsheet/text-style-builder#setforegroundcolorobjectcolor
   * Sets the text font color.
   * @param {FakeColor} foregroundColor 
   * @returns {FakeTextStyleBuilder} self
   */
  setForegroundColorObject(foregroundColor) {
    nargCheck('setForegroundColorObject', arguments, 1, "Object")
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

  __newBuilder() {
    return newFakeTextStyleBuilder()
  }

  toString() {
    return 'TextStyleBuilder'
  }


}

