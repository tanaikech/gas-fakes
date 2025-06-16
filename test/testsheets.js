
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { getSheetsPerformance } from '../src/support/sheetscache.js';
import { maketss, trasher, toHex, rgbToHex, getRandomRgb, getRandomHex, getStuff, BLACK, RED, fillRange, arrMatchesRange, fillRangeFromDomain } from './testassist.js';


// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheets = (pack) => {

  const { unit, fixes } = pack || initTests()
  const toTrash = []


  unit.section("setting and repeating cell formats", t => {

    const { sheet } = maketss('cellsformats', toTrash, fixes)

    const tester = (range, prop, props, domain, nullIs) => {
      // font weight
      console.log(prop, props)
      const rd = fillRangeFromDomain(range, domain)
      range['set' + props](rd)
      const rdn = rd.map(row => row.map(f => is.null(f) ? nullIs : f))
      const cobs = range['get' + props]()
      t.deepEqual(cobs, rdn, props)

      //set all to the same thing
      range['set' + prop](rd[0][0])
      const cob = range['get' + props]()
      t.deepEqual(cob, fillRange(range, rdn[0][0]), props)
      t.is(cobs[0][0], cob[0][0], props)
      t.is(range['get' + prop](), cob[0][0], prop)
    }
    const startAt = sheet.getRange("h9:k12")

    tester(startAt.offset(30, 6), 'VerticalAlignment', 'VerticalAlignments', ['top', 'middle', 'bottom',null], "bottom")
    tester(startAt.offset(30, 6), 'HorizontalAlignment', 'HorizontalAlignments',  ['left', 'center', 'right', 'normal',null], "general")
    tester(startAt.offset(0, 0), 'FontWeight', 'FontWeights', ['bold', 'normal', null], "normal")
    tester(startAt.offset(5, 1), 'FontStyle', 'FontStyles', ['italic', 'normal', null], "normal")
    tester(startAt.offset(10, 2), 'FontSize', 'FontSizes', [10, 8, 4, 5, 20, 11, null], 10)
    tester(startAt.offset(15, 3), 'FontLine', 'FontLines', ['line-through', 'none', 'underline', null], "none")
    tester(startAt.offset(20, 4), 'FontFamily', 'FontFamilies',
      ['Arial,Tahoma,Times New Roman', 'Helvetica', 'Verdana,Sans Serif', 'Courier New'], null)
    tester(startAt.offset(25, 5), 'NumberFormat', 'NumberFormats', ['0.0000', '#,##0.00', '$#.##0.00', null], "0.###############")


    const startAgain = startAt.offset(30, 0)
    // fontcolorobjects
    // these are more complex so i wont bother trying to push them thru standard test
    const fr = startAgain.offset(0, 0)
    const tct = SpreadsheetApp.ThemeColorType
    const td = Object.keys(tct).filter(f => f !== "UNSUPPORTED" && !is.function(tct[f])).map(f => tct[f])
    const rd = fillRangeFromDomain(fr, td)
    const rc = rd.map(row => row.map(f => SpreadsheetApp.newColor().setThemeColor(f).build()))

    const fr2 = startAgain.offset(5, 1)
    fr2.setFontColorObject(rc[0][0])
    const cobs2 = fr2.getFontColorObjects().map(row => row.map(f => f.asThemeColor().getThemeColorType()))
    t.deepEqual(cobs2, fillRange(fr2, rd[0][0]))
    const cob2 = fr2.getFontColorObject().asThemeColor().getThemeColorType()
    t.is(cob2, rc[0][0].asThemeColor().getThemeColorType())

    fr.setFontColorObjects(rc)
    const cobs = fr.getFontColorObjects().map(row => row.map(f => f.asThemeColor().getThemeColorType()))
    t.deepEqual(cobs, rd)

    // try all that with rgb color object
    const fr3 = startAgain.offset(10, 2)
    const rd3 = fillRange(fr3, getRandomHex)
    const rc3 = rd3.map(row => row.map(f => SpreadsheetApp.newColor().setRgbColor(f).build()))
    fr3.setFontColorObjects(rc3)

    const fr4 = startAgain.offset(15, 3)
    fr4.setFontColorObject(rc3[0][0])
    const cobs4 = fr4.getFontColorObjects().map(row => row.map(f => f.asRgbColor().asHexString()))
    t.deepEqual(cobs4, fillRange(fr4, rd3[0][0]))
    const cob4 = fr4.getFontColorObject().asRgbColor().asHexString()
    t.is(cob4, rc3[0][0].asRgbColor().asHexString())

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())

  })

  // this section is kind of redundant now as I've consolodated most of these tests into setting and repearing cell formats
  // however we'll just leave these here as extra tests in any case
  unit.section("assorted cell userenteredformats", t => {
    const { sheet } = maketss('assorted', toTrash, fixes)
    const range = sheet.getRange("b15:e19")
    const nFormat = "0.#"
    const nFormats = fillRange(range, nFormat)
    range.setNumberFormat(nFormat)

    const nf = range.getNumberFormat()
    t.is(nf, nFormat)
    range.setNumberFormats(nFormats)
    const nfs = range.getNumberFormats()

    t.is(nf, nfs[0][0])
    t.is(nfs.length, range.getNumRows())
    t.is(nfs[0].length, range.getNumColumns())
    t.deepEqual(nfs, nFormats)


    const fl = range.getFontLine()
    t.is(fl, 'none')
    t.true(range.getFontLines().flat().every(f => f === fl))

    // newly created sheet has all null borders
    t.is(range.getBorder(), null)

    // default colot and style
    range.setBorder(true, true, true, true, true, true)
    // this doesnt work on GAS
    // const b1 = range.getBorders()
    const b1 = range.getBorder()
    t.is(b1.getTop().getColor().getColorType().toString(), "RGB")
    t.is(b1.getTop().getBorderStyle().toString(), "SOLID")
    t.is(b1.getBottom().getBorderStyle().toString(), "SOLID")
    t.is(b1.getLeft().getBorderStyle().toString(), "SOLID")
    t.is(b1.getRight().getBorderStyle().toString(), "SOLID")
    t.is(b1.getTop().getColor().asRgbColor().asHexString(), BLACK)

    // hopefully we can get something from an offset to mitigate the range.getBorders() thing
    const b0 = range.offset(1, 1, 1, 1).getBorder()

    // this will drop any symbols in the response
    t.deepEqual(JSON.stringify(b0), JSON.stringify(b1))



    // left should remain as before
    const GREEN = '#00ff00'
    range.setBorder(true, null, true, true, true, true, GREEN, SpreadsheetApp.BorderStyle.DASHED)
    const b2 = range.getBorder()
    t.is(b2.getTop().getBorderStyle().toString(), "DASHED")
    t.is(b2.getLeft().getBorderStyle().toString(), "SOLID")
    t.is(b2.getTop().getColor().asRgbColor().asHexString(), GREEN)
    t.is(b2.getLeft().getColor().asRgbColor().asHexString(), BLACK)

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())

  })


  unit.section("cell and font backgrounds, styles and alignments", t => {

    const { sheet } = maketss('cells', toTrash, fixes)

    // text styles - an empty sheet shoud all be defaults
    const range = sheet.getRange("A1:C5")
    const txss = range.getTextStyles()
    const txs = range.getTextStyle()
    t.is(txss.length, range.getNumRows())
    t.is(txss[0].length, range.getNumColumns())
    t.is(txs.toString(), "TextStyle")
    t.is(txs.getFontSize(), 10)
    t.is(txs.getFontFamily(), "arial,sans,sans-serif")
    t.is(txs.isBold(), false)
    t.is(txs.isItalic(), false)
    t.is(txs.isUnderline(), false)
    t.is(txs.isStrikethrough(), false)
    t.is(txs.getForegroundColor(), BLACK)
    t.is(txs.getForegroundColorObject().asRgbColor().asHexString(), BLACK)
    t.true(txss.flat().every(f => f.getFontSize() === txs.getFontSize()))
    t.true(txss.flat().every(f => f.getFontFamily() === txs.getFontFamily()))
    t.true(txss.flat().every(f => f.isBold() === txs.isBold()))
    t.true(txss.flat().every(f => f.isItalic() === txs.isItalic()))
    t.true(txss.flat().every(f => f.isUnderline() === txs.isUnderline()))
    t.true(txss.flat().every(f => f.isStrikethrough() === txs.isStrikethrough()))
    t.true(txss.flat().every(f => f.getForegroundColor() === txs.getForegroundColor()))
    t.true(txss.flat().every(
      f => f.getForegroundColorObject().asRgbColor().asHexString() === txs.getForegroundColorObject().asRgbColor().asHexString()))


    // backgrounds
    const backgrounds = range.getBackgrounds()
    const background = range.getBackground()
    t.true(is.nonEmptyString(background))
    t.true(is.array(backgrounds))

    // these 2 i think have just been renamed - they dont exist in the documentation any more
    t.is(range.getBackgroundColor(), background)
    t.deepEqual(range.getBackgroundColors(), backgrounds)

    t.is(backgrounds.length, range.getNumRows())
    t.is(backgrounds[0].length, range.getNumColumns())
    t.is(backgrounds[0][0], background)
    t.true(backgrounds.flat().every(f => is.nonEmptyString(f)))
    t.is(background.substring(0, 1), '#')
    t.is(background.length, 7)
    t.is(background, '#ffffff', 'newly created sheet will have white background')

    const color = getRandomHex()
    range.setBackground(color)
    t.is(range.getBackground(), color)
    t.true(range.getBackgrounds().flat().every(f => f === color))

    const colorRgb = getRandomRgb()
    const color255 = [Math.round(colorRgb.red * 255), Math.round(colorRgb.green * 255), Math.round(colorRgb.blue * 255)]
    range.setBackgroundRGB(...color255)
    t.is(range.getBackground(), rgbToHex(colorRgb))

    // some random colorsas
    const colors = fillRange(range, getRandomHex)
    const fontColors = fillRange(range, getRandomHex)


    range.setBackgrounds(colors)
    t.deepEqual(range.getBackgrounds(), colors)

    range.setFontColors(fontColors)


    // text rotations
    const rots = range.getTextRotations()
    const rot = range.getTextRotation()
    t.is(rots.length, range.getNumRows())
    t.is(rots[0].length, range.getNumColumns())
    t.true(rots.flat().every(f => f.getDegrees() === 0))
    t.is(rot.getDegrees(), 0)
    t.true(rots.flat().every(f => f.isVertical() === false))
    t.is(rot.isVertical(), false)

    // this is deprec, but we'll implement it anyway
    const fcs = range.getFontColors()
    const fc = range.getFontColor()
    t.is(fcs.length, range.getNumRows())
    t.is(fcs[0].length, range.getNumColumns())
    t.deepEqual(fcs, fontColors)
    t.is(fc, fontColors[0][0])

    // default font family
    const defFamily = "Arial"
    const ffs = range.getFontFamilies()
    const ff = range.getFontFamily()
    t.is(ffs.length, range.getNumRows())
    t.is(ffs[0].length, range.getNumColumns())
    t.true(ffs.flat().every(f => f === ff))
    t.is(ff, defFamily)

    // default font family
    const defFontSize = 10
    const fss = range.getFontSizes()
    const fs = range.getFontSize()
    t.is(fss.length, range.getNumRows())
    t.is(fss[0].length, range.getNumColumns())
    t.true(fss.flat().every(f => f === fs))
    t.is(fs, defFontSize)

    // default wrap
    const defWrap = true
    const fws = range.getWraps()
    const fw = range.getWrap()
    t.is(fws.length, range.getNumRows())
    t.is(fws[0].length, range.getNumColumns())
    t.true(fws.flat().every(f => f === fw))
    t.is(fw, defWrap)

    const defWrapStrategy = "OVERFLOW"
    const wss = range.getWrapStrategies()
    const ws = range.getWrapStrategy()
    t.is(wss.length, range.getNumRows())
    t.is(wss[0].length, range.getNumColumns())
    t.true(wss.flat().every(f => f.toString() === ws.toString()))
    t.is(ws.toString(), defWrapStrategy)



    // the preferred way nowadays
    const fcobs = range.getFontColorObjects()
    const fcob = range.getFontColorObject()
    t.is(fcobs.length, range.getNumRows())
    t.is(fcobs[0].length, range.getNumColumns())
    t.deepEqual(fcobs.flat().map(f => f.asRgbColor().asHexString()), fontColors.flat())
    t.is(fcob.asRgbColor().asHexString(), fontColors[0][0])

    range.setFontColor(getRandomHex())

    // now with rangelists
    const range2 = range.offset(3, 3, 2, 2)
    const rangeList = range.getSheet().getRangeList([range, range2].map(r => r.getA1Notation()))
    rangeList.setBackground(color)
    rangeList.getRanges().forEach(range => t.true(range.getBackgrounds().flat().every(f => f === color)))
    rangeList.getRanges().forEach(range => {
      range.setBackgroundRGB(...color255)
      t.is(range.getBackground(), rgbToHex(colorRgb))
    })

    // now alignments
    const verticalAlignments = range.getVerticalAlignments()
    const verticalAlignment = range.getVerticalAlignment()
    t.is(verticalAlignments.length, range.getNumRows())
    t.is(verticalAlignments[0].length, range.getNumColumns())
    t.true(verticalAlignments.flat().every(f => is.nonEmptyString(f)))
    t.is(verticalAlignments[0][0], verticalAlignment)
    // sometimes this is upper sometimes lower - havent figured out rule yet
    t.is(verticalAlignment.toUpperCase(), 'BOTTOM', 'newly created sheet will have bottom')

    const horizontalAlignments = range.getHorizontalAlignments()
    const horizontalAlignment = range.getHorizontalAlignment()
    t.is(horizontalAlignments.length, range.getNumRows())
    t.is(horizontalAlignments[0].length, range.getNumColumns())
    t.true(horizontalAlignments.flat().every(f => is.nonEmptyString(f)))
    t.is(horizontalAlignments[0][0], horizontalAlignment)
    t.is(horizontalAlignment, 'general', 'newly created sheet will have general')

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())

  })

  unit.section("TODO - currently skipped - range.getBorder() does work on GAS although it's not documented", t => {
    // TODO figure out how to handle thick/medium etc.

    const rt = sb.getRange("a26:b28")

    // the top of of the first row should be null
    // the bottom of the last row should be null
    // the left of the first column should be null
    // the right of last column should be null
    const topRow = rt.offset(0, 0, 1).getBorder()
    const bottomRow = rt.offset(rt.getNumRows() - 1, 1).getBorder()
    const leftCol = rt.offset(0, 0, rt.getNumRows(), 1).getBorder()
    const rightCol = rt.offset(0, rt.getNumColumns() - 1, rt.getNumRows(), 1).getBorder()


    t.is(topRow.getTop().getColor().getColorType().toString(), 'UNSUPPORTED')
    t.is(bottomRow.getBottom().getColor().getColorType().toString(), 'UNSUPPORTED')
    t.is(leftCol.getLeft().getColor().getColorType().toString(), 'UNSUPPORTED')
    t.is(rightCol.getRight().getColor().getColorType().toString(), 'UNSUPPORTED')
    t.is(topRow.getTop().getBorderStyle(), null)
    t.is(bottomRow.getBottom().getBorderStyle(), null)
    t.is(leftCol.getLeft().getBorderStyle(), null)
    t.is(rightCol.getRight().getBorderStyle(), null)


    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())

  }, { skip: true })

  unit.section("text Style objects and builders", t => {

    const builder = SpreadsheetApp.newTextStyle()
    t.is(builder.toString(), "TextStyleBuilder")
    const fontFamily = 'Helvetica'
    builder
      .setFontSize(10)
      .setBold(true)
      .setItalic(true)
      .setUnderline(false)
      .setStrikethrough(false)
      .setFontFamily(fontFamily)
    const textStyle = builder.build()
    t.is(textStyle.toString(), "TextStyle")
    t.is(textStyle.getFontSize(), 10)
    t.is(textStyle.getFontFamily(), fontFamily)
    t.is(textStyle.isBold(), true)
    t.is(textStyle.isItalic(), true)
    t.is(textStyle.isUnderline(), false)
    t.is(textStyle.isStrikethrough(), false)


    t.is(textStyle.getForegroundColor(), null)
    t.is(textStyle.getForegroundColorObject(), null)

    const rgbColor = getRandomHex()
    const rgbBuilder = SpreadsheetApp.newTextStyle()
    rgbBuilder.setForegroundColor(rgbColor)
    const rgbStyle = rgbBuilder.build()
    t.is(rgbStyle.getForegroundColor(), rgbColor)
    t.is(rgbStyle.getForegroundColorObject().asRgbColor().asHexString(), rgbColor)

    const tc = 'ACCENT4'
    const tcb = SpreadsheetApp.newColor()
    tcb.setThemeColor(SpreadsheetApp.ThemeColorType[tc]).build()
    const themeBuilder = SpreadsheetApp.newTextStyle().setForegroundColorObject(tcb).build()
    // strangely enough, if it's a theme color it returns the enum for the colortype
    t.is(themeBuilder.getForegroundColor(), tc)
    t.is(themeBuilder.getForegroundColorObject().asThemeColor().getThemeColorType().toString(), tc)


    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })



  unit.section("color objects and builders", t => {

    const builder = SpreadsheetApp.newColor()
    t.is(builder.toString(), "ColorBuilder")
    t.is(t.threw(() => builder.asThemeColor()).message, "Object is not of type ThemeColor.")
    t.is(t.threw(() => builder.asRgbColor()).message, "Object is not of type RgbColor.")
    t.is(builder.getColorType().toString(), "UNSUPPORTED")
    const rgbColor = getRandomHex()

    builder.setRgbColor(rgbColor)
    t.is(t.threw(() => builder.asThemeColor()).message, "Object is not of type ThemeColor.")
    t.is(builder.getColorType().toString(), "RGB")
    t.is(builder.asRgbColor().toString(), "RgbColor")
    t.is(builder.asRgbColor().asHexString(), rgbColor)
    t.is(builder.asRgbColor().getRed(), parseInt(rgbColor.substring(1, 3), 16))

    const builtRgb = builder.build()
    t.is(builtRgb.toString(), "Color")
    t.is(builtRgb.getColorType().toString(), "RGB")
    t.is(builtRgb.asRgbColor().toString(), "RgbColor")
    t.is(builtRgb.asRgbColor().getGreen(), parseInt(rgbColor.substring(3, 5), 16))
    t.is(builtRgb.asRgbColor().getBlue(), parseInt(rgbColor.substring(5, 7), 16))
    t.is(builtRgb.asRgbColor().getRed(), parseInt(rgbColor.substring(1, 3), 16))
    t.is(t.threw(() => builtRgb.asThemeColor()).message, "Object is not of type ThemeColor.")

    const themeBuilder = SpreadsheetApp.newColor()
    themeBuilder.setThemeColor(SpreadsheetApp.ThemeColorType.ACCENT1)
    t.is(themeBuilder.getColorType().toString(), "THEME")
    t.is(themeBuilder.asThemeColor().getColorType().toString(), "THEME")
    t.is(themeBuilder.asThemeColor().getThemeColorType().toString(), "ACCENT1")
    t.is(t.threw(() => themeBuilder.asRgbColor()).message, "Object is not of type RgbColor.")

    const builtTheme = themeBuilder.build()
    t.is(builtTheme.toString(), "Color")
    t.is(builtTheme.getColorType().toString(), "THEME")
    t.is(builtTheme.asThemeColor().getColorType().toString(), "THEME")
    t.is(t.threw(() => builtTheme.asRgbColor()).message, "Object is not of type RgbColor.")

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })

  unit.section("setting and getting color objects}", t => {
    const { sheet } = maketss('colors', toTrash, fixes)
    const range = sheet.getRange("c6:i12")

    // so we can see the colors better if necessary add some random values
    const stuff = getStuff(range)
    range.setValues(stuff)
    t.deepEqual(range.getValues(), stuff)

    const cts = [
      "TEXT",
      "BACKGROUND",
      "ACCENT1",
      "ACCENT2",
      "ACCENT3",
      "ACCENT4",
      "ACCENT5",
      "ACCENT6",
      "LINK"
    ]

    const colorObjects = Array.from({
      length: range.getNumRows()
    },
      _ => Array.from({
        length: range.getNumColumns()
      }, (_, i) => SpreadsheetApp.newColor().setThemeColor(SpreadsheetApp.ThemeColorType[cts[i % cts.length]]).build()))

    t.true(colorObjects.flat().every(f => f.asThemeColor().getColorType().toString() === "THEME"))
    t.true(colorObjects.flat().every(f => f.getColorType().toString() === "THEME"))

    range.setBackgroundObjects(colorObjects)
    const tobs = range.getBackgroundObjects()
    t.true(tobs.flat().every(f => f.getColorType().toString() === "THEME"))
    t.deepEqual(
      tobs.flat().map(f => f.asThemeColor().getThemeColorType().toString()),
      colorObjects.flat().map(f => f.asThemeColor().getThemeColorType().toString())
    )

    // color objects can be rgb too
    const rgbObjects = Array.from({
      length: range.getNumRows()
    },
      _ => Array.from({
        length: range.getNumColumns()
      }, (_, i) => SpreadsheetApp.newColor().setRgbColor(getRandomHex()).build()))

    const rgbRange = range.offset(range.getNumRows() + 1, 0)
    rgbRange.setBackgroundObjects(rgbObjects)
    const robs = rgbRange.getBackgroundObjects()
    t.true(robs.flat().every(f => f.getColorType().toString() === "RGB"))
    t.deepEqual(robs.flat().map(f => f.asRgbColor().asHexString()), rgbObjects.flat().map(f => f.asRgbColor().asHexString()))


    // and they can be mixed
    const mixedRange = rgbRange.offset(rgbRange.getNumRows() + 1, 0)
    const half = Math.floor(mixedRange.getNumRows() / 2)
    const mixed = colorObjects.slice(0, half).concat(rgbObjects.slice(0, mixedRange.getNumRows() - half))
    mixedRange.setBackgroundObjects(mixed)
    const mobs = mixedRange.getBackgroundObjects()
    t.deepEqual(mobs.flat().map(f => f.getColorType().toString()), mixed.flat().map(f => f.getColorType().toString()))

    const singleColor = getRandomHex()
    const singleColorObj = SpreadsheetApp.newColor().setRgbColor(singleColor).build()
    const singleRange = mixedRange.offset(mixedRange.getNumRows() + 1, 0)
    singleRange.setBackgroundObject(singleColorObj)
    const back1 = singleRange.getBackgrounds()
    t.true(back1.flat().every(f => f === singleColor))
    const sobs = singleRange.getBackgroundObjects()
    t.true(sobs.flat().every(f => f.asRgbColor().asHexString() === singleColor))

    const singleRgbRange = singleRange.offset(singleRange.getNumRows() + 1, 0)
    const singleColorRgbObj = SpreadsheetApp.newColor().setRgbColor(singleColor).build()
    singleRgbRange.setBackgroundObject(singleColorRgbObj)
    const back2 = singleRgbRange.getBackgrounds()
    t.true(back2.flat().every(f => f === singleColor))
    const srobs = singleRange.getBackgroundObjects()
    t.true(srobs.flat().every(f => f.asRgbColor().asHexString() === singleColor))
    t.deepEqual(back1, back2)

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())

  })

  // running standalone
  if (!pack) {
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
    unit.report()

  }

  trasher(toTrash)
  return { unit, fixes }
}

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute" 
// for example node testdrive.js execute
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testSheets()
