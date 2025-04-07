import { Proxies } from '../../support/proxies.js'
import { FakeSheet } from './fakesheet.js'
import { SheetUtils } from '../../support/sheetutils.js'

/**
 * @file
 * @imports ../typedefs.js
 */
// private properties are identified with leading __
// this will signal to the proxy handler that it's okay to set them
/**
 * create a new FakeSheet instance
 * @param  {...any} args 
 * @returns {FakeSheetRange}
 */
export const newFakeSheetRange = (...args) => {
  return Proxies.guard(new FakeSheetRange(...args))
}

/**
 * basic fake FakeSheetRange
 * @class FakeSheetRange
 */
export class FakeSheetRange {

  /**
   * @constructor
   * @param {import('../typedefs.js').GridRange} gridRange 
   * @param {FakeSheet} parent the parent
   * @returns {FakeSheetRange}
   */
  constructor(gridRange, parent) {
    console.log (gridRange)
    this.__gridRange = gridRange
    this.__parent = parent
    const props = ['toString',
      'getValues',
      'removeDuplicates',
      'getMergedRanges',
      'setBackgroundObjects',
      'setFontColorObjects',
      'getDataValidation',
      'getDataValidations',
      'setDataValidations',
      'clearDataValidations',
      'protect',
      'setDataValidation',
      'getBackground',
      'getBorder',
      'getColumnIndex',
      'getNumColumns',
      'getTextDirection',
      'setTextDirection',
      'getTextStyle',
      'getFontWeight',
      'getFontFamilies',
      'setFontWeight',
      'getFormulas',
      'setBackground',
      'setHorizontalAlignments',
      'getHorizontalAlignments',
      'createDataSourcePivotTable',
      'setFontLines',
      'getBorders',
      'activate',
      'breakApart',
      'deleteCells',
      'getNextDataCell',
      'getDataRegion',
      'getFormulaR1C1',
      'getFormulasR1C1',
      'getDataSourceFormula',
      'getNumberFormats',
      'getBackgroundColors',
      'insertCells',
      'setFormulas',
      'setFormulaR1C1',
      'setFormulasR1C1',
      'setBackgroundColors',
      'getDisplayValue',
      'getDisplayValues',
      'mergeAcross',
      'mergeVertically',
      'isPartOfMerge',
      'setBackgroundObject',
      'setBackgrounds',
      'getBackgroundObject',
      'getBackgrounds',
      'getBackgroundObjects',
      'setBackgroundRGB',
      'setBorder',
      'activateAsCurrentCell',
      'setFontColor',
      'setFontColorObject',
      'setFontColors',
      'setFontFamilies',
      'setFontLine',
      'setFontSizes',
      'setFontStyle',
      'setFontStyles',
      'setFontWeights',
      'setNumberFormats',
      'setVerticalAlignments',
      'setWrap',
      'setWraps',
      'copyValuesToRange',
      'copyFormatToRange',
      'getGridId',
      'getFontColor',
      'getFontColorObject',
      'getFontColors',
      'getFontColorObjects',
      'getFontLine',
      'getFontLines',
      'getFontSizes',
      'getFontStyle',
      'setComments',
      'getFontWeights',
      'getHorizontalAlignment',
      'getVerticalAlignments',
      'getWrap',
      'getWraps',
      'randomize',
      'isStartColumnBounded',
      'isStartRowBounded',
      'isEndColumnBounded',
      'isEndRowBounded',
      'autoFill',
      'autoFillToNeighbor',
      'setShowHyperlink',
      'getTextRotation',
      'getTextRotations',
      'setTextRotation',
      'setTextRotations',
      'setVerticalText',
      'setTextDirections',
      'getFontStyles',
      'setWrapStrategies',
      'setWrapStrategy',
      'applyColumnBanding',
      'applyRowBanding',
      'splitTextToColumns',
      'getWrapStrategy',
      'getWrapStrategies',
      'createPivotTable',
      'createDataSourceTable',
      'shiftRowGroupDepth',
      'shiftColumnGroupDepth',
      'expandGroups',
      'collapseGroups',
      'getRichTextValue',
      'getRichTextValues',
      'setRichTextValue',
      'setRichTextValues',
      'getTextStyles',
      'setTextStyles',
      'uncheck',
      'insertCheckboxes',
      'removeCheckboxes',
      'isChecked',
      'trimWhitespace',
      'getTextDirections',
      'setValues',
      'getNumRows',
      'copyTo',
      'setTextStyle',
      'getVerticalAlignment',
      'getComments',
      'clearComment',
      'getBandings',
      'addDeveloperMetadata',
      'getDeveloperMetadata',
      'createTextFinder',
      'moveTo',
      'setFontSize',
      'setNotes',
      'setNote',
      'clearNote',
      'getHeight',
      'createFilter',
      'setVerticalAlignment',
      'setHorizontalAlignment',
      'getNotes',
      'getWidth',
      'getCell',
      'getNote',
      'setFontFamily',
      'getDataSourceFormulas',
      'getLastRow',
      'getLastColumn',
      'getDataSourceTables',
      'clearContent',
      'setBackgroundColor',
      'getBackgroundColor',
      'setFormula',
      'getFormula',
      'getDataSourceUrl',
      'getFontSize',
      'getDataTable',
      'clearFormat',
      'getFontFamily',
      'canEdit',
      'createDeveloperMetadataFinder',
      'getDataSourcePivotTables',
      'clear',
      'getValue',
      'isBlank',
      'offset',
      'merge',
      'sort',
      'setValue',
      'check',
      'getFilter',
      'setNumberFormat',
      'getNumberFormat',
      'setComment',
      'getComment']
    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented()
      }
    })

  }
  getA1Notation() {
    return SheetUtils.toRange(
      this.__gridRange.startRowIndex + 1,
      this.__gridRange.startColumnIndex + 1,
      this.__gridRange.endRowIndex,
      this.__gridRange.endColumnIndex
    )
  }

  getEndColumn() {
    return this.__gridRange.endColumnIndex + 1
  }
  getEndRow() {
    return this.__gridRange.endRowIndex + 1
  }
  getSheet() {
    return this.__parent
  }
  getRowIndex() {
    return this.__gridRange.startRowIndex
  }
  getRow() {
    return this.__gridRange.startRowIndex + 1
  }
  getColumn() {
    return this.__gridRange.startColumnIndex + 1
  }

}