
import { newFakeGasenum} from "@mcpher/fake-gasenum";
export const AutoFillSeries = newFakeGasenum(["DEFAULT_SERIES", "ALTERNATE_SERIES"])
export const BandingTheme = newFakeGasenum([
  "LIGHT_GREY", //	Enum	A light grey banding theme.
  "CYAN", //	Enum	A cyan banding theme.,
  "GREEN",  //	Enum	A green banding theme.
  "YELLOW", //	Enum	A yellow banding theme.
  "ORANGE", //	Enum	An orange banding theme.
  "BLUE",  //	Enum	A blue banding theme.
  "TEAL", //	Enum	A teal banding theme.
  "GREY", //	Enum	A grey banding theme.
  "BROWN", //	Enum	A brown banding theme.
  "LIGHT_GREEN", //	Enum	A light green banding theme.
  "INDIGO", //	Enum	An indigo banding theme.
  "PINK" //	Enum	A pink banding theme.
])
export const BooleanCriteria = newFakeGasenum([
  "CELL_EMPTY", //	Enum	The criteria is met when a cell is empty.
  "CELL_NOT_EMPTY", //	Enum	The criteria is met when a cell is not empty.
  "DATE_AFTER", //	Enum	The criteria is met when a date is after the given value.
  "DATE_BEFORE", //	Enum	The criteria is met when a date is before the given value.
  "DATE_EQUAL_TO", //	Enum	The criteria is met when a date is equal to the given value.
  "DATE_NOT_EQUAL_TO", //	Enum	The criteria is met when a date is not equal to the given value.
  "DATE_AFTER_RELATIVE", //	Enum	The criteria is met when a date is after the relative date value.
  "DATE_BEFORE_RELATIVE", //	Enum	The criteria is met when a date is before the relative date value.
  "DATE_EQUAL_TO_RELATIVE", //	Enum	The criteria is met when a date is equal to the relative date value.
  "NUMBER_BETWEEN", //	Enum	The criteria is met when a number that is between the given values.
  "NUMBER_EQUAL_TO", //	Enum	The criteria is met when a number that is equal to the given value.
  "NUMBER_GREATER_THAN", //	Enum	The criteria is met when a number that is greater than the given value.
  "NUMBER_GREATER_THAN_OR_EQUAL_TO", //	Enum	The criteria is met when a number that is greater than or equal to the given value.
  "NUMBER_LESS_THAN", //	Enum	The criteria is met when a number that is less than the given value.
  "NUMBER_LESS_THAN_OR_EQUAL_TO", //	Enum	The criteria is met when a number that is less than or equal to the given value.
  "NUMBER_NOT_BETWEEN", //	Enum	The criteria is met when a number that is not between the given values.
  "NUMBER_NOT_EQUAL_TO", //	Enum	The criteria is met when a number that is not equal to the given value.
  "TEXT_CONTAINS", //	Enum	The criteria is met when the input contains the given value.
  "TEXT_DOES_NOT_CONTAIN", //	Enum	The criteria is met when the input does not contain the given value.
  "TEXT_EQUAL_TO", //	Enum	The criteria is met when the input is equal to the given value.
  "TEXT_NOT_EQUAL_TO", //	Enum	The criteria is met when the input is not equal to the given value.
  "TEXT_STARTS_WITH", //	Enum	The criteria is met when the input begins with the given value.
  "TEXT_ENDS_WITH", //	Enum	The criteria is met when the input ends with the given value.
  "CUSTOM_FORMULA" //	Enum	The criteria is met when the input makes the given formula evaluate to true.
])
export const BorderStyle = newFakeGasenum([
  "DOTTED", //	Enum	Dotted line borders.
  "DASHED", //	Enum	Dashed line borders.
  "SOLID", //	Enum	Thin solid line borders.
  "SOLID_MEDIUM", //	Enum	Medium solid line borders.
  "SOLID_THICK", //	Enum	Thick solid line borders.
  "DOUBLE", //	Enum	Two solid line borders.
])
export const ColorType = newFakeGasenum([
  "UNSUPPORTED", //	Enum	A color type that is not supported.
  "RGB", //	Enum	A color defined by red, green, blue color channels.
  "THEME" //	Enum	A color that refers to an entry in the theme's color scheme.
])
export const CopyPasteType = newFakeGasenum([
  "PASTE_NORMAL", //	Enum	Paste values, formulas, formats and merges.
  "PASTE_NO_BORDERS", //	Enum	Paste values, formulas, formats and merges but without borders.
  "PASTE_FORMAT", //	Enum	Paste the format only.
  "PASTE_FORMULA", //	Enum	Paste the formulas only.
  "PASTE_DATA_VALIDATION", //	Enum	Paste the data validation only.
  "PASTE_VALUES", //	Enum	Paste the values ONLY without formats, formulas or merges.
  "PASTE_CONDITIONAL_FORMATTING", //	Enum	Paste the color rules only.
  "PASTE_COLUMN_WIDTHS" //	Enum	Paste the column widths only.
])
export const DataExecutionErrorCode = newFakeGasenum([
  "DATA_EXECUTION_ERROR_CODE_UNSUPPORTED", //	Enum	A data execution error code that is not supported in Apps Script.
  "NONE", //	Enum	The data execution has no error.
  "TIME_OUT", //	Enum	The data execution timed out. Please update the data source specification.
  "TOO_MANY_ROWS", //	Enum	The data execution returns more rows than the limit. Please update the data source specification.
  "TOO_MANY_COLUMNS", //	Enum	The data execution returns more columns than the limit. Please update the data source specification.
  "TOO_MANY_CELLS", //	Enum	The data execution returns more cells than the limit. Please update the data source specification.
  "ENGINE", //	Enum	Data execution engine error. Use DataExecutionStatus.getErrorMessage() for details.
  "PARAMETER_INVALID", //	Enum	Invalid data execution parameter. The source cell must exist and contain only a number or text. Please update the data source specification.
  "UNSUPPORTED_DATA_TYPE", //	Enum	The data execution returns unsupported data type. Please update the data source specification.
  "For", // BigQuery, ARRAY or STRUCT type is not supported.

  "DUPLICATE_COLUMN_NAMES", //	Enum	The data execution returns duplicate column names. Please update the data source specification.
  "INTERRUPTED", //	Enum	The data execution is interrupted. Please refresh later.
  "OTHER", //	Enum	Other errors.
  "TOO_MANY_CHARS_PER_CELL", //	Enum	The data execution returns values that exceed the maximum characters allowed in a single cell. Please update the data source specification.
  "DATA_NOT_FOUND", //	Enum	The database referenced by the data source is not found. Please update the data source specification.
  "PERMISSION_DENIED", //	Enum	The user does not have access to the database referenced by the data source. Please update the data source specification or contact the owner of the billing project to request access.
])
export const DataExecutionState = newFakeGasenum([
  "DATA_EXECUTION_STATE_UNSUPPORTED", //	Enum	A data execution state is not supported in Apps Script.
  "RUNNING", //	Enum	The data execution has started and is running.
  "SUCCESS", //	Enum	The data execution is completed and successful.
  "ERROR", //	Enum	The data execution is completed and has errors.
  "NOT_STARTED", //	Enum	The data execution has not started.
])
export const DataSourceParameterType = newFakeGasenum([
  "DATA_SOURCE_PARAMETER_TYPE_UNSUPPORTED", //	Enum	A data source parameter type that is not supported in Apps Script.
  "CELL", //	Enum	The data source parameter is valued based on a cell.
])
export const DataSourceRefreshScope = newFakeGasenum([
  "DATA_SOURCE_REFRESH_SCOPE_UNSUPPORTED", //	Enum	The data source refresh scope is unsupported.
  "ALL_DATA_SOURCES", //	Enum	The refresh applies to all data sources in the spreadsheet.
])
export const DataSourceType = newFakeGasenum([
  "DATA_SOURCE_TYPE_UNSUPPORTED", //	Enum	A data source type that is not supported in Apps Script.
  "BIGQUERY", //	Enum	A BigQuery data source.
  "LOOKER", //	Enum	A Looker data source.
])

export const DataValidationCriteria = newFakeGasenum([
  "DATE_AFTER", //	Enum	Requires a date that is after the given value.
  "DATE_BEFORE", //	Enum	Requires a date that is before the given value.
  "DATE_BETWEEN", //	Enum	Requires a date that is between the given values.
  "DATE_EQUAL_TO", //	Enum	Requires a date that is equal to the given value.
  "DATE_IS_VALID_DATE", //	Enum	Requires a date.
  "DATE_NOT_BETWEEN", //	Enum	Requires a date that is not between the given values.
  "DATE_ON_OR_AFTER", //	Enum	Require a date that is on or after the given value.
  "DATE_ON_OR_BEFORE", //	Enum	Requires a date that is on or before the given value.
  "NUMBER_BETWEEN", //	Enum	Requires a number that is between the given values.
  "NUMBER_EQUAL_TO", //	Enum	Requires a number that is equal to the given value.
  "NUMBER_GREATER_THAN", //	Enum	Require a number that is greater than the given value.
  "NUMBER_GREATER_THAN_OR_EQUAL_TO", //	Enum	Requires a number that is greater than or equal to the given value.
  "NUMBER_LESS_THAN", //	Enum	Requires a number that is less than the given value.
  "NUMBER_LESS_THAN_OR_EQUAL_TO", //	Enum	Requires a number that is less than or equal to the given value.
  "NUMBER_NOT_BETWEEN", //	Enum	Requires a number that is not between the given values.
  "NUMBER_NOT_EQUAL_TO", //	Enum	Requires a number that is not equal to the given value.
  "TEXT_CONTAINS", //	Enum	Requires that the input contains the given value.
  "TEXT_DOES_NOT_CONTAIN", //	Enum	Requires that the input does not contain the given value.
  "TEXT_EQUAL_TO", //	Enum	Requires that the input is equal to the given value.
  "TEXT_IS_VALID_EMAIL", //	Enum	Requires that the input is in the form of an email address.
  "TEXT_IS_VALID_URL", //	Enum	Requires that the input is in the form of a URL.
  "VALUE_IN_LIST", //	Enum	Requires that the input is equal to one of the given values.
  "VALUE_IN_RANGE", //	Enum	Requires that the input is equal to a value in the given range.
  "CUSTOM_FORMULA", //	Enum	Requires that the input makes the given formula evaluate to true.
  "CHECKBOX", //	Enum	Requires that the input is a custom value or a boolean; rendered as a checkbox.
  // these are not documented, but required to support datavalidation
  "DATE_AFTER_RELATIVE", //	Enum	The criteria is met when a date is after the relative date value.
  "DATE_BEFORE_RELATIVE", //	Enum	The criteria is met when a date is before the relative date value.
  "DATE_EQUAL_TO_RELATIVE", //	Enum	The criteria is met when a date is equal to the relative date value. 
])
export const DateTimeGroupingRuleType = newFakeGasenum([
  "UNSUPPORTED", //	Enum	A date-time grouping rule type that is not supported.
  "SECOND", //	Enum	Group date-time by second, from 0 to 59.
  "MINUTE", //	Enum	Group date-time by minute, from 0 to 59.
  "HOUR", //	Enum	Group date-time by hour using a 24-hour system, from 0 to 23.
  "HOUR_MINUTE", //	Enum	Group date-time by hour and minute using a 24-hour system, for example 19:45.
  "HOUR_MINUTE_AMPM", //	Enum	Group date-time by hour and minute using a 12-hour system, for example 7:45 PM.
  "DAY_OF_WEEK", //	Enum	Group date-time by day of week, for example Sunday.
  "DAY_OF_YEAR", //	Enum	Group date-time by day of year, from 1 to 366.
  "DAY_OF_MONTH", //	Enum	Group date-time by day of month, from 1 to 31.
  "DAY_MONTH", //	Enum	Group date-time by day and month, for example 22-Nov.
  "MONTH", //	Enum	Group date-time by month, for example Nov.
  "QUARTER", //	Enum	Group date-time by quarter, for example Q1 (which represents Jan-Mar).
  "YEAR", //	Enum	Group date-time by year, for example 2008.
  "YEAR_MONTH", //	Enum	Group date-time by year and month, for example 2008-Nov.
  "YEAR_QUARTER", //	Enum	Group date-time by year and quarter, for example 2008 Q4 .
  "YEAR_MONTH_DAY", //	Enum	Group date-time by year, month, and day, for example 2008-11-22.
])
export const DeveloperMetadataLocationType = newFakeGasenum([
  "SPREADSHEET", //	Enum	The location type for developer metadata associated with the top-level spreadsheet.
  "SHEET", //	Enum	The location type for developer metadata associated with a whole sheet.
  "ROW", //	Enum	The location type for developer metadata associated with a row.
  "COLUMN", //	Enum	The location type for developer metadata associated with a column.
])
export const DeveloperMetadataVisibility = newFakeGasenum([
  "DOCUMENT", //	Enum	Document-visible metadata is accessible from any developer project with access to the document.
  "PROJECT", //	Enum	Project-visible metadata is only visible to and accessible by the developer project that created the metadata. Do not use project-visible developer metadata as a security mechanism or to store secrets. It can be exposed to users with view access to the document.  
])
export const Dimension = newFakeGasenum([
  "COLUMNS", //	Enum	The column (vertical) dimension.
  "ROWS", //	Enum	The row (horizontal) dimension.
])
export const Direction = newFakeGasenum([
  "UP", //	Enum	The direction of decreasing row indices.
  "DOWN", //	Enum	The direction of increasing row indices.
  "PREVIOUS", //	Enum	The direction of decreasing column indices.
  "NEXT", //	Enum	The direction of increasing column indices.
])
export const FrequencyType = newFakeGasenum([
  "FREQUENCY_TYPE_UNSUPPORTED", //	Enum	The frequency type is unsupported.
  "DAILY", //	Enum	Refresh daily.
  "WEEKLY", //	Enum	Refresh weekly, on given days of the week.
  "MONTHLY", //	Enum	Refresh monthly, on given days of the month.
])
export const GroupControlTogglePosition = newFakeGasenum([
  "BEFORE", //	Enum	The position where the control toggle is before the group (at lower indices).
  "AFTER", //	Enum	The position where the control toggle is after the group (at higher indices).
])
export const InterpolationType = newFakeGasenum([
  "NUMBER", //	Enum	Use the number as as specific interpolation point for a gradient condition.
  "PERCENT", //	Enum	Use the number as a percentage interpolation point for a gradient condition.
  "PERCENTILE", //	Enum	Use the number as a percentile interpolation point for a gradient condition.
  "MIN", //	Enum	Infer the minimum number as a specific interpolation point for a gradient condition.
  "MAX", //	Enum	Infer the maximum number as a specific interpolation point for a gradient condition.
])
export const PivotTableSummarizeFunction = newFakeGasenum([
  "CUSTOM", //	Enum	A custom function, this value is only valid for calculated fields.
  "SUM", //	Enum	The SUM function
  "COUNTA", //	Enum	The COUNTA function
  "COUNT", //	Enum	The COUNT function
  "COUNTUNIQUE", //	Enum	The COUNTUNIQUE function
  "AVERAGE", //	Enum	The AVERAGE function
  "MAX", //	Enum	The MAX function
  "MIN", //	Enum	The MIN function
  "MEDIAN", //	Enum	The MEDIAN function
  "PRODUCT", //	Enum	The PRODUCT function
  "STDEV", //	Enum	The STDEV function
  "STDEVP", //	Enum	The STDEVP function
  "VAR", //	Enum	The VAR function
  "VARP", //	Enum	The VARP function
])
export const PivotValueDisplayType = newFakeGasenum([
  "DEFAULT", //	Enum	Default. Displays pivot values as the actual value and not as a function of another value.
  "PERCENT_OF_ROW_TOTAL", //	Enum	Displays pivot values as a percent of the total for that row.
  "PERCENT_OF_COLUMN_TOTAL", //	Enum	Displays pivot values as a percent of the total for that column.
  "PERCENT_OF_GRAND_TOTAL", //	Enum	Displays pivot values as a percent of the grand total.  
])
export const ProtectionType = newFakeGasenum([
  "RANGE", //	Enum	Protection for a range.
  "SHEET", //	Enum	Protection for a sheet.  
])
export const RecalculationInterval = newFakeGasenum([
  "ON_CHANGE", //	Enum	Recalculate only when values are changed.
  "MINUTE", //	Enum	Recalculate when values are changed, and every minute.
  "HOUR", //	Enum	Recalculate when values are changed, and every hour.
])
export const RelativeDate = newFakeGasenum([
  "TODAY", //	Enum	Dates compared against the current date.
  "TOMORROW", //	Enum	Dates compared against the date after the current date.
  "YESTERDAY", //	Enum	Dates compared against the date before the current date.
  "PAST_WEEK", //	Enum	Dates that fall within the past week period.
  "PAST_MONTH", //	Enum	Dates that fall within the past month period.
  "PAST_YEAR", //	Enum	Dates that fall within the past year period.
])
export const SheetType = newFakeGasenum([
  "GRID", //	Enum	A sheet containing a grid. This is the default type.
  "OBJECT", //	Enum	A sheet containing a single embedded object such as an EmbeddedChart.
  "DATASOURCE", //	Enum	A sheet containing a DataSource.
])
export const SortOrder = newFakeGasenum([
  "ASCENDING", //	Enum	Ascending sort order.
  "DESCENDING", //	Enum	Descending sort order.
])
export const TextDirection = newFakeGasenum([
  "LEFT_TO_RIGHT", //	Enum	Left-to-right text direction.
  "RIGHT_TO_LEFT", //	Enum	Right-to-left text direction.
])
export const TextToColumnsDelimiter = newFakeGasenum([
  "COMMA", //	Enum	"," delimiter.
  "SEMICOLON", //	Enum	";" delimiter.
  "PERIOD", //	Enum	"." delimiter.
  "SPACE", //	Enum	" " delimiter.
])
export const ThemeColorType = newFakeGasenum([
  "UNSUPPORTED", //	Enum	Represents a theme color that is not supported.
  "TEXT", //	Enum	Represents the text color.
  "BACKGROUND", //	Enum	Represents the color to use for chart's background.
  "ACCENT1", //	Enum	Represents the first accent color.
  "ACCENT2", //	Enum	Represents the second accent color.
  "ACCENT3", //	Enum	Represents the third accent color.
  "ACCENT4", //	Enum	Represents the fourth accent color.
  "ACCENT5", //	Enum	Represents the fifth accent color.
  "ACCENT6", //	Enum	Represents the sixth accent color.
  "HYPERLINK", //	Enum	Represents the color to use for hyperlinks.
])
export const ValueType = newFakeGasenum([
  "IMAGE", //	Enum	The value type when the cell contains an image.
])
export const WrapStrategy = newFakeGasenum([
  "WRAP", //	Enum	Wrap lines that are longer than the cell width onto a new line. Single words that are longer than a line are wrapped at the character level.
  "OVERFLOW", //	Enum	Overflow lines into the next cell, so long as that cell is empty. If the next cell over is non-empty, this behaves the same as CLIP.
  "CLIP", //	Enum	Clip lines that are longer than the cell width.
])