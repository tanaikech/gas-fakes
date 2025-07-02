
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { getSheetsPerformance } from '../src/support/sheetscache.js';
import { getPerformance } from '../src/support/filecache.js';
import { maketss, trasher, makeSheetsGridRange, makeExtendedValue, dateToSerial, fillRange } from './testassist.js';
import is from '@sindresorhus/is';


// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsSets = (pack) => {

  const { unit, fixes } = pack || initTests()
  const toTrash = []

  unit.section("Color Name Support", t => { // this test is to verify that the hardcoded theme colors match the live API
    const { sheet } = maketss('color_name_tests', toTrash, fixes);

    // This map contains all 147 standard CSS color names supported by Apps Script.
    const colorNameToHex = {
      'aliceblue': '#f0f8ff', 'antiquewhite': '#faebd7', 'aqua': '#00ffff', 'aquamarine': '#7fffd4', 'azure': '#f0ffff',
      'beige': '#f5f5dc', 'bisque': '#ffe4c4', 'black': '#000000', 'blanchedalmond': '#ffebcd', 'blue': '#0000ff',
      'blueviolet': '#8a2be2', 'brown': '#a52a2a', 'burlywood': '#deb887', 'cadetblue': '#5f9ea0', 'chartreuse': '#7fff00',
      'chocolate': '#d2691e', 'coral': '#ff7f50', 'cornflowerblue': '#6495ed', 'cornsilk': '#fff8dc', 'crimson': '#dc143c',
      'cyan': '#00ffff', 'darkblue': '#00008b', 'darkcyan': '#008b8b', 'darkgoldenrod': '#b8860b', 'darkgray': '#a9a9a9',
      'darkgreen': '#006400', 'darkgrey': '#a9a9a9', 'darkkhaki': '#bdb76b', 'darkmagenta': '#8b008b', 'darkolivegreen': '#556b2f',
      'darkorange': '#ff8c00', 'darkorchid': '#9932cc', 'darkred': '#8b0000', 'darksalmon': '#e9967a', 'darkseagreen': '#8fbc8f',
      'darkslateblue': '#483d8b', 'darkslategray': '#2f4f4f', 'darkslategrey': '#2f4f4f', 'darkturquoise': '#00ced1',
      'darkviolet': '#9400d3', 'deeppink': '#ff1493', 'deepskyblue': '#00bfff', 'dimgray': '#696969', 'dimgrey': '#696969',
      'dodgerblue': '#1e90ff', 'firebrick': '#b22222', 'floralwhite': '#fffaf0', 'forestgreen': '#228b22', 'fuchsia': '#ff00ff',
      'gainsboro': '#dcdcdc', 'ghostwhite': '#f8f8ff', 'gold': '#ffd700', 'goldenrod': '#daa520', 'gray': '#808080',
      'green': '#008000', 'greenyellow': '#adff2f', 'grey': '#808080', 'honeydew': '#f0fff0', 'hotpink': '#ff69b4',
      'indianred': '#cd5c5c', 'indigo': '#4b0082', 'ivory': '#fffff0', 'khaki': '#f0e68c', 'lavender': '#e6e6fa',
      'lavenderblush': '#fff0f5', 'lawngreen': '#7cfc00', 'lemonchiffon': '#fffacd', 'lightblue': '#add8e6', 'lightcoral': '#f08080',
      'lightcyan': '#e0ffff', 'lightgoldenrodyellow': '#fafad2', 'lightgray': '#d3d3d3', 'lightgreen': '#90ee90',
      'lightgrey': '#d3d3d3', 'lightpink': '#ffb6c1', 'lightsalmon': '#ffa07a', 'lightseagreen': '#20b2aa', 'lightskyblue': '#87cefa',
      'lightslategray': '#778899', 'lightslategrey': '#778899', 'lightsteelblue': '#b0c4de', 'lightyellow': '#ffffe0',
      'lime': '#00ff00', 'limegreen': '#32cd32', 'linen': '#faf0e6', 'magenta': '#ff00ff', 'maroon': '#800000',
      'mediumaquamarine': '#66cdaa', 'mediumblue': '#0000cd', 'mediumorchid': '#ba55d3', 'mediumpurple': '#9370db',
      'mediumseagreen': '#3cb371', 'mediumslateblue': '#7b68ee', 'mediumspringgreen': '#00fa9a', 'mediumturquoise': '#48d1cc',
      'mediumvioletred': '#c71585', 'midnightblue': '#191970', 'mintcream': '#f5fffa', 'mistyrose': '#ffe4e1',
      'moccasin': '#ffe4b5', 'navajowhite': '#ffdead', 'navy': '#000080', 'oldlace': '#fdf5e6', 'olive': '#808000',
      'olivedrab': '#6b8e23', 'orange': '#ffa500', 'orangered': '#ff4500', 'orchid': '#da70d6', 'palegoldenrod': '#eee8aa',
      'palegreen': '#98fb98', 'paleturquoise': '#afeeee', 'palevioletred': '#db7093', 'papayawhip': '#ffefd5',
      'peachpuff': '#ffdab9', 'peru': '#cd853f', 'pink': '#ffc0cb', 'plum': '#dda0dd', 'powderblue': '#b0e0e6',
      'purple': '#800080', 'red': '#ff0000', 'rosybrown': '#bc8f8f', 'royalblue': '#4169e1',
      'saddlebrown': '#8b4513', 'salmon': '#fa8072', 'sandybrown': '#f4a460', 'seagreen': '#2e8b57', 'seashell': '#fff5ee',
      'sienna': '#a0522d', 'silver': '#c0c0c0', 'skyblue': '#87ceeb', 'slateblue': '#6a5acd', 'slategray': '#708090',
      'slategrey': '#708090', 'snow': '#fffafa', 'springgreen': '#00ff7f', 'steelblue': '#4682b4', 'tan': '#d2b48c',
      'teal': '#008080', 'thistle': '#d8bfd8', 'tomato': '#ff6347', 'turquoise': '#40e0d0', 'violet': '#ee82ee',
      'wheat': '#f5deb3', 'white': '#ffffff', 'whitesmoke': '#f5f5f5', 'yellow': '#ffff00', 'yellowgreen': '#9acd32'
    };

    const colorNames = Object.keys(colorNameToHex);
    const numColors = colorNames.length;
    const numCols = 15;
    const numRows = Math.ceil(numColors / numCols);

    const range = sheet.getRange(1, 1, numRows, numCols);

    // Create a 2D array of color names for batch setting
    const colors2D = Array.from({ length: numRows }, (_, r) =>
      Array.from({ length: numCols }, (_, c) => {
        const index = r * numCols + c;
        return index < numColors ? colorNames[index] : 'black'; // Pad with black if needed
      })
    );

    // Set backgrounds and font colors in two API calls
    range.setBackgrounds(colors2D);
    range.setFontColors(colors2D);

    const resultBackgrounds = range.getBackgrounds();
    const resultFontColors = range.getFontColors();

    // Verify all colors
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const index = r * numCols + c;
        if (index < numColors) {
          const name = colorNames[index];
          const expectedHex = colorNameToHex[name];
          t.is(resultBackgrounds[r][c], expectedHex, `Background for "${name}" should be ${expectedHex}`);
          t.is(resultFontColors[r][c], expectedHex, `Font color for "${name}" should be ${expectedHex}`);
        }
      }
    }

    // Test case-insensitivity and invalid color name
    const singleCell = sheet.getRange("A1");
    singleCell.setBackground('LIGHTCORAL');
    t.is(singleCell.getBackground(), '#f08080', 'Color names should be case-insensitive');
    // apps script doesnt care - https://issuetracker.google.com/issues/428869869
    t.rxMatch(t.threw(() => singleCell.setBackground('not-a-real-color'))?.message || 'not an error', /Invalid color string/, {
      description: "Should throw for invalid color name",
      skip: !SpreadsheetApp.isFake
    });

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance());
  });
  
  unit.section("Banding Theme Colors Verification", t => { // this test is to verify that the hardcoded theme colors match the live API
    const { sheet } = maketss('banding_theme_verification', toTrash, fixes);
    const range = sheet.getRange("A1:E10");

    const expectedThemeColors = { // these values are taken from running the test on GAS
      LIGHT_GREY: { header: '#bdbdbd', first: '#ffffff', second: '#f3f3f3', footer: '#dedede' },
      CYAN: { header: '#4dd0e1', first: '#ffffff', second: '#e0f7fa', footer: '#a2e8f1' },
      GREEN: { header: '#63d297', first: '#ffffff', second: '#e7f9ef', footer: '#afe9ca' },
      YELLOW: { header: '#f7cb4d', first: '#ffffff', second: '#fef8e3', footer: '#fce8b2' },
      ORANGE: { header: '#f46524', first: '#ffffff', second: '#ffe6dd', footer: '#ffccbc' },
      BLUE: { header: '#5b95f9', first: '#ffffff', second: '#e8f0fe', footer: '#acc9fe' },
      TEAL: { header: '#26a69a', first: '#ffffff', second: '#ddf2f0', footer: '#8cd3cd' },
      GREY: { header: '#78909c', first: '#ffffff', second: '#ebeff1', footer: '#bbc8ce' },
      BROWN: { header: '#cca677', first: '#ffffff', second: '#f8f2eb', footer: '#e6d3ba' },
      LIGHT_GREEN: { header: '#8bc34a', first: '#ffffff', second: '#eef7e3', footer: '#c4e2a0' },
      INDIGO: { header: '#8989eb', first: '#ffffff', second: '#e8e7fc', footer: '#c4c3f7' },
      PINK: { header: '#e91d63', first: '#ffffff', second: '#fddce8', footer: '#f68ab0' },
    };

    for (const themeKey in expectedThemeColors) {
      if (Object.prototype.hasOwnProperty.call(expectedThemeColors, themeKey)) {
        const themeEnum = SpreadsheetApp.BandingTheme[themeKey];
        if (!themeEnum) {
          throw new Error(`BandingTheme enum for ${themeKey} not found in SpreadsheetApp`);
        }

        const expected = expectedThemeColors[themeKey];

        // Test Row Banding
        const rowBanding = range.applyRowBanding(themeEnum, true, true);
        t.is(rowBanding.getHeaderRowColor(), expected.header, `Row Banding - ${themeKey} - Header Color`);
        t.is(rowBanding.getFirstRowColor(), expected.first, `Row Banding - ${themeKey} - First Band Color`);
        t.is(rowBanding.getSecondRowColor(), expected.second, `Row Banding - ${themeKey} - Second Band Color`);
        t.is(rowBanding.getFooterRowColor(), expected.footer, `Row Banding - ${themeKey} - Footer Color`);
        rowBanding.remove();
      }
    }

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance());
  });
  
  unit.section("Banding methods", t => {
    const { sheet } = maketss('banding_methods', toTrash, fixes);
    const range = sheet.getRange("A1:E10");
    range.setValues(fillRange(range, 'data'));

    // 1. Test applyRowBanding and basic getters
    let rowBanding = range.applyRowBanding(SpreadsheetApp.BandingTheme.CYAN, true, true);
    t.is(rowBanding.toString(), "Banding", "applyRowBanding should return a Banding object");
    t.is(rowBanding.getRange().getA1Notation(), "A1:E10", "Banding range should be correct");
    // Check colors for CYAN theme using both object and string getters
    const headerColorObj = rowBanding.getHeaderRowColorObject();
    // The real API resolves theme colors to RGB, so we check conditionally
    if (headerColorObj.getColorType().toString() === 'THEME') {
      t.is(headerColorObj.asThemeColor().getThemeColorType().toString(), "ACCENT3", "Header color object should match CYAN theme");
    }
    t.is(rowBanding.getHeaderRowColor(), '#4dd0e1', "Header color string should match resolved CYAN theme");
    t.is(rowBanding.getFirstRowColorObject().asRgbColor().asHexString(), "#ffffff", "First row color object should be white for CYAN theme");
    t.is(rowBanding.getFirstRowColor(), "#ffffff", "First row color string should be white for CYAN theme");
    t.is(rowBanding.getSecondRowColor(), "#e0f7fa", "Second row color string should match CYAN theme");
    t.truthy(rowBanding.getHeaderRowColorObject(), "Header row color object should exist");
    t.truthy(rowBanding.getFooterRowColorObject(), "Footer row color object should exist");
    t.truthy(rowBanding.getFirstRowColorObject(), "First row color object should exist");
    t.truthy(rowBanding.getSecondRowColorObject(), "Second row color object should exist");
    t.is(rowBanding.getFirstColumnColor(), null, "First column color should be null for row banding");

    // 2. Test color setters and getBandingTheme with custom colors
    rowBanding.setHeaderRowColor('#ff0000'); // red
    t.is(rowBanding.getHeaderRowColor(), '#ff0000', "setHeaderRowColor with hex string");

    const blueColor = SpreadsheetApp.newColor().setRgbColor('#0000ff').build();
    rowBanding.setFirstRowColorObject(blueColor);
    t.is(rowBanding.getFirstRowColorObject().asRgbColor().asHexString(), '#0000ff', "setFirstRowColorObject with Color object");

    // Test that setting essential colors to null throws an error
    t.rxMatch(t.threw(() => rowBanding.setSecondRowColor(null)).message, /Second row color should not be null/);
    t.rxMatch(t.threw(() => rowBanding.setFirstRowColor(null)).message, /First row color should not be null/);

    // Footer and header colors are optional and can be set to null
    rowBanding.setFooterRowColorObject(null);
    t.is(rowBanding.getFooterRowColorObject(), null, "setFooterRowColorObject(null) should clear the color");

    // 4. Test setRange
    const newRange = sheet.getRange("B2:F11");
    rowBanding.setRange(newRange);
    t.is(rowBanding.getRange().getA1Notation(), "B2:F11", "setRange should update the banding range");

    // 5. Test remove
    rowBanding.remove();
    t.is(sheet.getBandings().length, 0, "Banding should be removed");

    // 6. Test Column Banding
    let colBanding = range.applyColumnBanding(SpreadsheetApp.BandingTheme.INDIGO, true, false);
    const colHeaderColorObj = colBanding.getHeaderColumnColorObject();
    // The real API resolves theme colors to RGB, so we check conditionally
    if (colHeaderColorObj.getColorType().toString() === 'THEME') {
      t.is(colHeaderColorObj.asThemeColor().getThemeColorType().toString(), "ACCENT6", "Header color should match INDIGO theme");
    }
    t.is(colBanding.getFirstColumnColor(), "#ffffff", "First column color should be white for INDIGO theme");
    t.is(colBanding.getHeaderColumnColor(), '#8989eb', "Header color string should match resolved INDIGO theme");
    t.is(colBanding.getSecondColumnColor(), "#e8e7fc", "Second column color should match INDIGO theme");
    t.truthy(colBanding.getHeaderColumnColorObject(), "Header column color should exist");
    t.is(colBanding.getFooterColumnColor(), null, "Footer column color should be null after creation without footer");
    t.truthy(colBanding.getFirstColumnColorObject(), "First column color should exist");
    t.truthy(colBanding.getSecondColumnColorObject(), "Second column color should exist");
    t.is(colBanding.getFirstRowColor(), null, "First row color should be null for column banding");

    // 7. Test column color setters
    colBanding.setFirstColumnColor('#ffff00'); // string setter
    t.is(colBanding.getFirstColumnColor(), '#ffff00', "setFirstColumnColor should work");
    const footerColor = SpreadsheetApp.newColor().setRgbColor('#00ffff').build();
    colBanding.setFooterColumnColorObject(footerColor); // object setter
    t.is(colBanding.getFooterColumnColor(), '#00ffff', "setFooterColumnColorObject should add a footer color");

    // 8. Test copyTo()
    const destinationRange = sheet.getRange("G1:K10");
    const copiedBanding = colBanding.copyTo(destinationRange);
    t.is(sheet.getBandings().length, 2, "There should be two bandings after copy");
    t.is(copiedBanding.getRange().getA1Notation(), "G1:K10", "Copied banding should have the destination range");
    t.is(copiedBanding.getFirstColumnColor(), '#ffff00', "Copied banding should have the same custom color as the original");

    // To prove they are distinct objects, modify the copy and check the original is unchanged.
    copiedBanding.setFirstColumnColor('#00ff00'); // green
    t.is(copiedBanding.getFirstColumnColor(), '#00ff00', "Copied banding color should be updated");
    t.is(colBanding.getFirstColumnColor(), '#ffff00', "Original banding color should not change after copy is modified");

    // 9. Test getBandings
    const allBandings = sheet.getBandings();
    t.is(allBandings.length, 2, "There should be two bandings on the sheet");
    t.truthy(allBandings.find(b => b.getRange().getA1Notation() === "A1:E10"), "getBandings should return the original banding");
    t.truthy(allBandings.find(b => b.getRange().getA1Notation() === "G1:K10"), "getBandings should return the copied banding");

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance());
  })


  
  unit.section("Splitting text into columns", t => {
    const { sheet: sv } = maketss('splitting', toTrash, fixes)
    const startAt = sv.getRange("a1:d4")

    const getSplit = (delim) => {
      return [
        [`a1${delim}b1${delim}c1`, '', '', ''],
        [`a2`, '', '', ''],
        [`a3${delim}b3${delim}c3${delim}d3`, '', '', ''],
        [`a4${delim}${delim}c4`, '', '', '']
      ]
    }
    const r1 = startAt.offset(0, 0)
    const source1 = r1.offset(0, 0, r1.getNumRows(), 1)
    const split1 = getSplit (",")
    const expect = split1.map(row => {
      const nr = row[0].toString().split(",")
      return nr.concat(Array.from({ length: row.length - nr.length }).fill(''))
    })

    r1.setValues(split1)
    source1.splitTextToColumns()
    const d1 = r1.getValues()
    t.deepEqual(d1, expect)

    // try a custom delimiter
    const r2 = startAt.offset(5, 1)
    const source2 = r2.offset(0, 0, r2.getNumRows(), 1)
    const split2 = getSplit (":")

    r2.setValues(split2)
    source2.splitTextToColumns(":")
    const d2 = r2.getValues()
    t.deepEqual(d2, expect)

    // finally an enum separator
    const r3 = startAt.offset(10, 2)
    const source3 = r3.offset(0, 0, r2.getNumRows(), 1)
    const split3 = getSplit (" ")

    r3.setValues(split3)
    source3.splitTextToColumns(SpreadsheetApp.TextToColumnsDelimiter.SPACE)
    const d3 = r3.getValues()
    t.deepEqual(d3, expect)


    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })
  unit.section("advanced class maker", t => {
    const { sheet: sv, ss } = maketss('adv classes', toTrash, fixes)
    const spreadsheetId = ss.getId()
    const range = sv.getRange("a1:c4")
    const gr = makeSheetsGridRange(range)

    const sheetId = sv.getSheetId()
    t.is(gr.getSheetId(), sheetId)

    const cdVals = [[true, 2, new Date()], ['cheese', false, 'bar'], [1, 2, 'x'], ['a', new Date("2-DEC-1938 12:23:39.123"), false]]
    const cdrRows = cdVals.map(row =>
      Sheets.newRowData().setValues(row.map(cell => Sheets.newCellData().setUserEnteredValue(makeExtendedValue(cell))))
    )
    const cdrFields = "userEnteredValue"

    const ucr = Sheets.newUpdateCellsRequest()
    ucr.setRows(cdrRows)
      .setFields(cdrFields)
      .setRange(gr)

    t.deepEqual(ucr.getRange(), gr)
    t.is(ucr.getFields(), cdrFields)


    const rubr = Sheets.newBatchUpdateSpreadsheetRequest()
    const rubrt = {
      includeSpreadsheetInResponse: false,
      requests: [{
        updateCells: ucr
      }],
      responseIncludeGridData: false
    }

    rubr.setRequests(rubrt.requests)

    const response = Sheets.Spreadsheets.batchUpdate(rubr, spreadsheetId)
    t.is(response.spreadsheetId, spreadsheetId)
    t.true(is.array(response.replies))

    const tr = `${sv.getName()}!${range.getA1Notation()}`
    const data = Sheets.Spreadsheets.Values.get(spreadsheetId, tr)

    // a bit tricky to compare values as the api returns converted strings
    const valueChecker = (original, cell) => {
      if (is.date(original)) {
        // the api loses some precision so match up to whatever we got from the api
        return dateToSerial(original).toFixed(cell.replace(/.*\./, "").length)
      } else if (is.boolean(original)) {
        return original.toString().toUpperCase()
      } else {
        return original.toString()
      }
    }
    data.values.forEach((row, i) => row.forEach((cell, j) => t.is(valueChecker(cdVals[i][j], cell), cell)))
    t.is(data.majorDimension, "ROWS")
    t.is(sv.getRange(data.range).getA1Notation(), range.getA1Notation())

  })

  unit.section("clearing ranges", t => {
    const { sheet: sv } = maketss('clearing', toTrash, fixes)

    // make a couple of fake validations
    const builder = SpreadsheetApp.newDataValidation()
    const values = [[1, 2], true]
    const dv = builder.requireValueInList(...values).build()
    const cr = sv.getRange("!c2:e5")
    cr.setDataValidation(dv)
    const cbs = cr.getDataValidations()
    t.is(cbs.length, cr.getNumRows())
    t.is(cbs[0].length, cr.getNumColumns())

    cr.clearDataValidations()
    const cbs2 = cr.getDataValidations()
    t.deepEqual(cbs2, fillRange(cr, null))
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })



  // running standalone
  if (!pack) {
    if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())
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

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testSheetsSets()
