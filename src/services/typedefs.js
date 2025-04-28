

/**
 * Settings to control how circular dependencies are resolved with iterative calculation.
 * @typedef {object} IterativeCalculationSettings
 * @property {number} maxIterations
 * @property {number} convergenceThreshold
 */

/**
 * The format of a cell
 * @typedef {object} CellFormat
 * @property {NumberFormat} numberFormat
 * @property {Color} backgroundColor
 * @property {ColorStyle} backgroundColorStyle
 * @property {Borders} borders
 * @property {Padding} padding
 * @property {HorizontalAlign} horizontalAlignment
 * @property {VerticalAlign} verticalAlignment
 * @property {WrapStrategy} wrapStrategy
 * @property {TextDirection} textDirection
 * @property {TextFormat} textFormat
 * @property {HyperlinkDisplayType} hyperlinkDisplayType
 * @property {TextRotation} textRotation
 * 
 */

/**
 * The rotation applied to text in a cell.
 * @typedef {object} TextRotation
 * @property {number} angle
 * @property {boolean} vertical
 */

/**
 * The format of a run of text in a cell. Absent values indicate that the field isn't specified.
 * @typedef {object} TextFormat
 * @property {Color} foregroundColor deprec
 * @property {ColorStyle} foregroundColorStyle
 * @property {string} fontfamily
 * @property {number} fontSize
 * @property {boolean} bold
 * @property {boolean} italic
 * @property {boolean} strikethrough
 * @property {boolean} underline
 * @property {Link} link
 */

/**
 * An external or local reference.
 * @typedef {object} Link
 * @property {string} uri
 */
/**
 * The number format of a cell.
 * @typedef NumberFormat
 * @property {NumberFormatType} type
 * @property {string} pattern
 */

/**
 * The borders of the cell
 * @typedef {object} Borders
 * @property {Border} top
 * @property {Border} bottom
 * @property {Border} left
 * @property {Border} right
 */

/**
 * A border along a cell.
 * @typedef {object} Border 
 * @property {Style} style
 * @property {number} width deprec
 * @property {Color} color deprec
 * @property {ColorStyle} colorStyle
 */

/**
 * The amount of padding around the cell, in pixels. When updating padding, every field must be specified.
 * @typedef {object} Padding
 * @property {number}  top
 * @property {number}  right
 * @property {number}  bottom
 * @property {number}  left
 */

/**
 * Represents spreadsheet theme
 * @typedef {object} SpreadsheetTheme
 * @property {string} primaryFontFamily
 * @property {ThemeColorPair[]} themeColors
 */

/**
 * A pair mapping a spreadsheet theme color type to the concrete color it represents.
 * @typedef {object} ThemeColorPair
 * @property {ThemeColorType} colorType
 * @property {ColorStyle} color
 */

/**
 * A color value.
 * @typedef {Color | ThemeColorType } ColorStyle
 * @property {Color} rgbColor
 * @property {ThemeColorType} themeColor
 */

/**
 * an rgba color
 * @typedef {object} Color
 * @property {number} red
 * @property  {number} green
 * @property {number} blue
 * @property {number} alpha
 */

const nc = ["NUMBER_FORMAT_TYPE_UNSPECIFIED",
  "TEXT",
  "CURRENCY",
  "PERCENT",
  "DATE_TIME",
  "DATE",
  "TIME",
  "SCIENTIFIC",
  "NUMBER"]

/** @type {object} NumberFormatType */
export const NumberFormatType = Object.freeze(Object.fromEntries(nc.map(f => [f, f])))


const tc = [
  "THEME_COLOR_TYPE_UNSPECIFIED",
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

/** @type {object} ThemeColorType */
export const ThemeColorType = Object.freeze(Object.fromEntries(tc.map(f => [f, f])))

const rc = [
  "RECALCULATION_INTERVAL_UNSPECIFIED",
  "ON_CHANGE",
  "MINUTE",
  "HOUR"]

/** @type {object} RecalculationInterval */
export const RecalculationInterval = Object.freeze(Object.fromEntries(rc.map(f => [f, f])))

/**
 * A named range.
 * @typedef {object} NamedRange
 * @property {string} name
 * @property {GridRange} range
 */

const sc = [
  "SORT_ORDER_UNSPECIFIED",
  "ASCENDING",
  "DESCENDING"
]
/** @type SortOrder */
export const SortOrder = Object.freeze(Object.fromEntries(sc.map(f => [f, f])))

const yc = ["STYLE_UNSPECIFIED",
  "DOTTED",
  "DASHED",
  "SOLID",
  // TODO check this - docs say MEDIUM, API returns SOLID_MEDIUM
  "SOLID_MEDIUM",
  "SOLID_THICK",
  "NONE",
  "DOUBLE"]

/** @type {object} Style */
export const Style = Object.freeze(Object.fromEntries(yc.map(f => [f, f])))

const hc = ["HORIZONTAL_ALIGN_UNSPECIFIED",
  "LEFT",
  "CENTER",
  "RIGHT"]

/** @type {object} HorizontalAlign */
export const HorizontalAlign = Object.freeze(Object.fromEntries(hc.map(f => [f, f])))

const vc = ["VERTICAL_ALIGN_UNSPECIFIED",
  "TOP",
  "MIDDLE",
  "BOTTOM"]

/** @type {object} VerticalAlign */
export const VerticalAlign = Object.freeze(Object.fromEntries(vc.map(f => [f, f])))

const wc = ["WRAP_STRATEGY_UNSPECIFIED",
  "OVERFLOW_CELL",
  "LEGACY_WRAP",
  "CLIP",
  "WRAP"]

/** @type {object} WrapStrategy */
export const WrapStrategy = Object.freeze(Object.fromEntries(wc.map(f => [f, f])))
const dc = [
  "TEXT_DIRECTION_UNSPECIFIED",
  "LEFT_TO_RIGHT",
  "RIGHT_TO_LEFT"
]
/** @type {object} TextDirection */
export const TextDirection = Object.freeze(Object.fromEntries(dc.map(f => [f, f])))

const lc = [
  "HYPERLINK_DISPLAY_TYPE_UNSPECIFIED",
  "LINKED",
  "PLAIN_TEXT"
]
/** @type {object} HyperlinkDisplayType */
export const HyperlinkDisplayType = Object.freeze(Object.fromEntries(lc.map(f => [f, f])))


/**
 * A range on a sheet. All indexes are zero-based. Indexes are half open, i.e. the start index is inclusive and the end index is exclusive -- [startIndex, endIndex). Missing indexes indicate the range is unbounded on that side.
 * @typedef {object} GridRange
 * @property {number} sheetId
 * @property {number} startRowIndex
 * @property {number} endRowIndex
 * @property {number} startColumnIndex
 * @property {number} endColumnIndex
 */

/**
 * The filter criteria associated with a specific column.
 * @typedef {object} FilterSpec
 * @property {FilterCriteria} FilterCriteria
 * @property {number} columnIndex
 * @property {DataSourceColumnReference} dataSourceColumnReference
 */

/**
 * An unique identifier that references a data source column.
 * @typedef {object} DataSourceColumnReference
 * @property {string} name
 */

/**
 * Criteria for showing/hiding rows in a filter or filter view.
 * @typedef {object} FilterCriteria
 * @property {string[]} hiddenValues 
 * @property {BooleanCondition} condition
 * @property {Color} visibleBackgroundColor deprecated
 * @property {ColorStyle} visibleBackgroundColorStyle
 * @property {Color} visibleForegroundColor  deprecated
 * @property {ColorStyle} visibleForegroundColorStyle
 */


/**
 * A sort order associated with a specific column or row.
 * @typedef {object} SortSpec
 * @property {SortOrder} sortOrder
 * @property {Color} foregroundColor deprecated
 * @property {ColorStyle} foregroundColorStyle
 * @property {Color} backgroundColor  deprecated
 * @property {ColorStyle} backgroundColorStyle
 * UNION--
 * @property {number} dimensionIndex  
 * @property {DataSourceColumnReference} dataSourceColumnReference
 * --UNION
 */

/**
 * The position of an embedded object such as a chart.
 * @typedef {object} EmbeddedObjectPosition
 * UNION--
 * @property {number} sheetId The sheet this is on. Set only if the embedded object is on its own sheet. Must be non-negative
 * @property {OverlayPosition} overlayPosition The position at which the object is overlaid on top of a grid.
 * @property {boolean} newSheet If true, the embedded object is put on a new sheet whose ID is chosen for you. Used only when writin
 * --UNION
 */

/**
 * The location an object is overlaid on top of a grid.
 * @typedef {object} OverlayPosition
 * @property {GridCoordinate} anchorCell The cell the object is anchored to.
 * @property {number} offsetXPixels the horizontal offset, in pixels, that the object is offset from the anchor cell
 * @property {number} offsetYPixels The vertical offset, in pixels, that the object is offset from the anchor cell
 * @property {number} widthPixels The width of the object, in pixels. Defaults to 600.
 * @property {number} heightPixels The height of the object, in pixels. Defaults to 371
 */

/**
 * A coordinate in a sheet. All indexes are zero-based.
 * @typedef {object} GridCoordinate
 * @property {number} sheetId
 * @property {number} rowIndex
 * @property {number} columnIndex
 */