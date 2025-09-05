# Spreadsheet Service Progress
**Documentation:** [Spreadsheet Service](https://developers.google.com/apps-script/reference/spreadsheet)
---
## [SpreadsheetApp](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app)
Allows scripts to create, access, and modify Google Sheets files.
75% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [create(name, rows, columns)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#create(String,Integer,Integer)) | [Spreadsheet](#spreadsheet) | Completed | |
| [getActive()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#getActive()) | [Spreadsheet](#spreadsheet) | Not Started | |
| [getActiveSpreadsheet()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#getActiveSpreadsheet()) | [Spreadsheet](#spreadsheet) | Not Started | |
| [openById(id)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#openById(String)) | [Spreadsheet](#spreadsheet) | Completed | |
| [openByUrl(url)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#openByUrl(String)) | [Spreadsheet](#spreadsheet) | Completed | |
| [newColor()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newColor()) | [ColorBuilder](#colorbuilder) | Completed | |
| [newConditionalFormatRule()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newConditionalFormatRule()) | [ConditionalFormatRuleBuilder](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder) | Not Started | |
| [newDataValidation()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newDataValidation()) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [newFilterCriteria()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newFilterCriteria()) | [FilterCriteriaBuilder](#filtercriteriabuilder) | Completed | |
| [newRichTextValue()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newRichTextValue()) | [RichTextValueBuilder](#richtextvaluebuilder) | Completed | |
| [newTextStyle()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newTextStyle()) | [TextStyleBuilder](#textstylebuilder) | Completed | |

---
## [Spreadsheet](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet)
Represents a Google Sheets file.
68% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [addEditor(emailAddress)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#addEditor(String)) | [Spreadsheet](#spreadsheet) | Completed | |
| [addEditors(emailAddresses)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#addEditors(String)) | [Spreadsheet](#spreadsheet) | Completed | |
| [addViewer(emailAddress)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#addViewer(String)) | [Spreadsheet](#spreadsheet) | Completed | |
| [addViewers(emailAddresses)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#addViewers(String)) | [Spreadsheet](#spreadsheet) | Completed | |
| [appendRow(rowContents)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#appendRow(Object)) | [Sheet](#sheet) | Completed | |
| [copy(name)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#copy(String)) | [Spreadsheet](#spreadsheet) | Not Started | |
| [deleteActiveSheet()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#deleteActiveSheet()) | [Sheet](#sheet) | Not Started | |
| [deleteSheet(sheet)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#deleteSheet(Sheet)) | void | Not Started | |
| [duplicateActiveSheet()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#duplicateActiveSheet()) | [Sheet](#sheet) | Not Started | |
| [getActiveCell()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getActiveCell()) | [Range](#range) | Not Started | |
| [getActiveRange()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getActiveRange()) | [Range](#range) | Not Started | |
| [getActiveRangeList()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getActiveRangeList()) | [RangeList](#rangelist) | Not Started | |
| [getActiveSheet()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getActiveSheet()) | [Sheet](#sheet) | Not Started | |
| [getBandings()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getBandings()) | [Banding[]](#banding) | Not Started | |
| [getNamedRanges()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getNamedRanges()) | [NamedRange[]](#namedrange) | Completed | |
| [getRangeByName(name)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getRangeByName(String)) | [Range](#range) | Completed | |
| [getSheets()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getSheets()) | [Sheet[]](#sheet) | Completed | |
| [getSheetByName(name)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getSheetByName(String)) | [Sheet](#sheet) | Completed | |
| [getSheetId()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getSheetId()) | Integer | Completed | |
| [getSpreadsheetLocale()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getSpreadsheetLocale()) | String | Not Started | |
| [getSpreadsheetTheme()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getSpreadsheetTheme()) | [SpreadsheetTheme](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-theme) | Not Started | |
| [getSpreadsheetTimeZone()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getSpreadsheetTimeZone()) | String | Not Started | |
| [getUrl()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getUrl()) | String | Completed | |
| [insertSheet()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#insertSheet()) | [Sheet](#sheet) | Completed | |
| [moveActiveSheet(pos)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#moveActiveSheet(Integer)) | void | Not Started | |
| [removeEditor(emailAddress)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#removeEditor(String)) | [Spreadsheet](#spreadsheet) | Completed | |
| [removeNamedRange(name)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#removeNamedRange(String)) | void | Not Started | |
| [removeViewer(emailAddress)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#removeViewer(String)) | [Spreadsheet](#spreadsheet) | Completed | |
| [rename(newName)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#rename(String)) | void | Not Started | |
| [renameActiveSheet(newName)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#renameActiveSheet(String)) | void | Not Started | |
| [setActiveSheet(sheet)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#setActiveSheet(Sheet)) | [Sheet](#sheet) | Not Started | |
| [setNamedRange(name, range)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#setNamedRange(String,Range)) | [NamedRange](#namedrange) | Completed | |
| [setSpreadsheetLocale(locale)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#setSpreadsheetLocale(String)) | void | Not Started | |
| [setSpreadsheetTheme(theme)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#setSpreadsheetTheme(SpreadsheetTheme)) | void | Not Started | |
| [setSpreadsheetTimeZone(timezone)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#setSpreadsheetTimeZone(String)) | void | Not Started | |
| [toast(msg)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#toast(String)) | void | Not Started | |

---
## [Sheet](https://developers.google.com/apps-script/reference/spreadsheet/sheet)
Represents a sheet in a spreadsheet.
92% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [activate()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#activate()) | [Sheet](#sheet) | Not Started | |
| [appendRow(rowContents)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#appendRow(Object)) | [Sheet](#sheet) | Completed | |
| [autoResizeColumn(columnPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#autoResizeColumn(Integer)) | [Sheet](#sheet) | Completed | |
| [autoResizeColumns(startColumn, numColumns)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#autoResizeColumns(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [clear()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#clear()) | [Sheet](#sheet) | Completed | |
| [clearContents()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#clearContents()) | [Sheet](#sheet) | Completed | |
| [clearFormats()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#clearFormats()) | [Sheet](#sheet) | Completed | |
| [clearNotes()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#clearNotes()) | [Sheet](#sheet) | Completed | |
| [copyTo(spreadsheet)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#copyTo(Spreadsheet)) | [Sheet](#sheet) | Not Started | |
| [createDeveloperMetadataFinder()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#createDeveloperMetadataFinder()) | [DeveloperMetadataFinder](#developermetadatafinder) | Completed | |
| [createTextFinder(findText)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#createTextFinder(String)) | [TextFinder](#textfinder) | Completed | |
| [deleteColumn(columnPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#deleteColumn(Integer)) | [Sheet](#sheet) | Completed | |
| [deleteColumns(columnPosition, howMany)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#deleteColumns(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [deleteRow(rowPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#deleteRow(Integer)) | [Sheet](#sheet) | Completed | |
| [deleteRows(rowPosition, howMany)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#deleteRows(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [getBandings()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getBandings()) | [Banding[]](#banding) | Completed | |
| [getColumnWidth(columnPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getColumnWidth(Integer)) | Integer | Completed | |
| [getDataRange()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getDataRange()) | [Range](#range) | Completed | |
| [getDeveloperMetadata()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getDeveloperMetadata()) | [DeveloperMetadata[]](#developermetadata) | Completed | |
| [getFilter()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getFilter()) | [Filter](#filter) | Completed | |
| [getIndex()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getIndex()) | Integer | Completed | |
| [getLastColumn()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getLastColumn()) | Integer | Completed | |
| [getLastRow()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getLastRow()) | Integer | Completed | |
| [getMaxColumns()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getMaxColumns()) | Integer | Completed | |
| [getMaxRows()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getMaxRows()) | Integer | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getName()) | String | Completed | |
| [getNamedRanges()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getNamedRanges()) | [NamedRange[]](#namedrange) | Completed | |
| [getParent()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getParent()) | [Spreadsheet](#spreadsheet) | Completed | |
| [getPivotTables()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getPivotTables()) | [PivotTable[]](#pivottable) | Completed | |
| [getProtections(type)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getProtections(ProtectionType)) | [Protection[]](#protection) | Completed | |
| [getRange(a1Notation)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getRange(String)) | [Range](#range) | Completed | |
| [getRangeList(a1Notations)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getRangeList(String)) | [RangeList](#rangelist) | Completed | |
| [getRowHeight(rowPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getRowHeight(Integer)) | Integer | Completed | |
| [getSheetId()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getSheetId()) | Integer | Completed | |
| [getSheetName()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getSheetName()) | String | Completed | |
| [getType()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getType()) | [SheetType](https://developers.google.com/apps-script/reference/spreadsheet/sheet-type) | Completed | |
| [hideColumn(column)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#hideColumn(Range)) | void | Completed | |
| [hideColumns(columnIndex, numColumns)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#hideColumns(Integer,Integer)) | void | Completed | |
| [hideRow(row)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#hideRow(Range)) | void | Completed | |
| [hideRows(rowIndex, numRows)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#hideRows(Integer,Integer)) | void | Completed | |
| [hideSheet()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#hideSheet()) | [Sheet](#sheet) | Completed | |
| [insertColumnAfter(afterPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertColumnAfter(Integer)) | [Sheet](#sheet) | Completed | |
| [insertColumnBefore(beforePosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertColumnBefore(Integer)) | [Sheet](#sheet) | Completed | |
| [insertColumns(columnIndex, numColumns)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertColumns(Integer,Integer)) | void | Completed | |
| [insertColumnsAfter(afterPosition, howMany)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertColumnsAfter(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [insertColumnsBefore(beforePosition, howMany)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertColumnsBefore(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [insertRowAfter(afterPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertRowAfter(Integer)) | [Sheet](#sheet) | Completed | |
| [insertRowBefore(beforePosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertRowBefore(Integer)) | [Sheet](#sheet) | Completed | |
| [insertRows(rowIndex, numRows)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertRows(Integer,Integer)) | void | Completed | |
| [insertRowsAfter(afterPosition, howMany)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertRowsAfter(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [insertRowsBefore(beforePosition, howMany)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertRowsBefore(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [isColumnHiddenByUser(columnPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#isColumnHiddenByUser(Integer)) | Boolean | Completed | |
| [isRowHiddenByFilter(rowPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#isRowHiddenByFilter(Integer)) | Boolean | Completed | |
| [isRowHiddenByUser(rowPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#isRowHiddenByUser(Integer)) | Boolean | Completed | |
| [isSheetHidden()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#isSheetHidden()) | Boolean | Completed | |
| [moveColumns(columnSpec, destinationIndex)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#moveColumns(Range,Integer)) | void | Completed | |
| [moveRows(rowSpec, destinationIndex)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#moveRows(Range,Integer)) | void | Completed | |
| [protect()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#protect()) | [Protection](#protection) | Completed | |
| [setColumnWidth(columnPosition, width)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setColumnWidth(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [setColumnWidths(startColumn, numColumns, width)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setColumnWidths(Integer,Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [setFrozenColumns(columns)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setFrozenColumns(Integer)) | void | Completed | |
| [setFrozenRows(rows)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setFrozenRows(Integer)) | void | Completed | |
| [setName(name)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setName(String)) | [Sheet](#sheet) | Completed | |
| [setRowHeight(rowPosition, height)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setRowHeight(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [setRowHeights(startRow, numRows, height)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setRowHeights(Integer,Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [setRowHeightsForced(startRow, numRows, height)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setRowHeightsForced(Integer,Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [showSheet()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#showSheet()) | [Sheet](#sheet) | Completed | |
| [sort(columnPosition, ascending)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#sort(Integer,Boolean)) | [Sheet](#sheet) | Completed | |
| [unhideColumn(column)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#unhideColumn(Range)) | void | Completed | |
| [unhideRow(row)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#unhideRow(Range)) | void | Completed | |

---
## [Range](https://developers.google.com/apps-script/reference/spreadsheet/range)
Represents a range of cells in a sheet.
96% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [activate()](https://developers.google.com/apps-script/reference/spreadsheet/range#activate()) | [Range](#range) | Not Started | |
| [addDeveloperMetadata(key, value, visibility)](https://developers.google.com/apps-script/reference/spreadsheet/range#addDeveloperMetadata(String,Object,DeveloperMetadataVisibility)) | [Range](#range) | Completed | |
| [applyColumnBanding(bandingTheme, header, footer)](https://developers.google.com/apps-script/reference/spreadsheet/range#applyColumnBanding(BandingTheme,Boolean,Boolean)) | [Banding](#banding) | Completed | |
| [applyRowBanding(bandingTheme, header, footer)](https://developers.google.com/apps-script/reference/spreadsheet/range#applyRowBanding(BandingTheme,Boolean,Boolean)) | [Banding](#banding) | Completed | |
| [autoFill(destination, series)](https://developers.google.com/apps-script/reference/spreadsheet/range#autoFill(Range,AutoFillSeries)) | void | Completed | |
| [autoFillToNeighbor(series)](https://developers.google.com/apps-script/reference/spreadsheet/range#autoFillToNeighbor(AutoFillSeries)) | void | Completed | |
| [breakApart()](https://developers.google.com/apps-script/reference/spreadsheet/range#breakApart()) | [Range](#range) | Completed | |
| [canEdit()](https://developers.google.com/apps-script/reference/spreadsheet/range#canEdit()) | Boolean | Completed | |
| [check()](https://developers.google.com/apps-script/reference/spreadsheet/range#check()) | [Range](#range) | Completed | |
| [clear()](https://developers.google.com/apps-script/reference/spreadsheet/range#clear()) | [Range](#range) | Completed | |
| [clearContent()](https://developers.google.com/apps-script/reference/spreadsheet/range#clearContent()) | [Range](#range) | Completed | |
| [clearDataValidations()](https://developers.google.com/apps-script/reference/spreadsheet/range#clearDataValidations()) | [Range](#range) | Completed | |
| [clearFormat()](https://developers.google.com/apps-script/reference/spreadsheet/range#clearFormat()) | [Range](#range) | Completed | |
| [clearNote()](https://developers.google.com/apps-script/reference/spreadsheet/range#clearNote()) | [Range](#range) | Completed | |
| [collapseGroups()](https://developers.google.com/apps-script/reference/spreadsheet/range#collapseGroups()) | [Range](#range) | Completed | |
| [copyTo(destination, copyPasteType, transposed)](https://developers.google.com/apps-script/reference/spreadsheet/range#copyTo(Range,CopyPasteType,Boolean)) | void | Completed | |
| [copyValuesToRange(gridId, column, columnEnd, row, rowEnd)](https://developers.google.com/apps-script/reference/spreadsheet/range#copyValuesToRange(Integer,Integer,Integer,Integer,Integer)) | void | Completed | |
| [createDeveloperMetadataFinder()](https://developers.google.com/apps-script/reference/spreadsheet/range#createDeveloperMetadataFinder()) | [DeveloperMetadataFinder](#developermetadatafinder) | Completed | |
| [createFilter()](https://developers.google.com/apps-script/reference/spreadsheet/range#createFilter()) | [Filter](#filter) | Completed | |
| [createPivotTable(sourceData)](https://developers.google.com/apps-script/reference/spreadsheet/range#createPivotTable(Range)) | [PivotTable](#pivottable) | Completed | |
| [deleteCells(shiftDimension)](https://developers.google.com/apps-script/reference/spreadsheet/range#deleteCells(Dimension)) | [Range](#range) | Completed | |
| [expandGroups()](https://developers.google.com/apps-script/reference/spreadsheet/range#expandGroups()) | [Range](#range) | Completed | |
| [getA1Notation()](https://developers.google.com/apps-script/reference/spreadsheet/range#getA1Notation()) | String | Completed | |
| [getBackground()](https://developers.google.com/apps-script/reference/spreadsheet/range#getBackground()) | String | Completed | |
| [getBackgrounds()](https://developers.google.com/apps-script/reference/spreadsheet/range#getBackgrounds()) | String[][] | Completed | |
| [getBandings()](https://developers.google.com/apps-script/reference/spreadsheet/range#getBandings()) | [Banding[]](#banding) | Completed | |
| [getCell(row, column)](https://developers.google.com/apps-script/reference/spreadsheet/range#getCell(Integer,Integer)) | [Range](#range) | Completed | |
| [getColumn()](https://developers.google.com/apps-script/reference/spreadsheet/range#getColumn()) | Integer | Completed | |
| [getDataRegion(dimension)](https://developers.google.com/apps-script/reference/spreadsheet/range#getDataRegion(Dimension)) | [Range](#range) | Completed | |
| [getDataSourceUrl()](https://developers.google.com/apps-script/reference/spreadsheet/range#getDataSourceUrl()) | String | Not Started | |
| [getDataTable()](https://developers.google.com/apps-script/reference/spreadsheet/range#getDataTable()) | [DataTable](#datatable) | Completed | |
| [getDataValidation()](https://developers.google.com/apps-script/reference/spreadsheet/range#getDataValidation()) | [DataValidation](#datavalidation) | Completed | |
| [getDataValidations()](https://developers.google.com/apps-script/reference/spreadsheet/range#getDataValidations()) | [DataValidation[][]](#datavalidation) | Completed | |
| [getDeveloperMetadata()](https://developers.google.com/apps-script/reference/spreadsheet/range#getDeveloperMetadata()) | [DeveloperMetadata[]](#developermetadata) | Completed | |
| [getDisplayValue()](https://developers.google.com/apps-script/reference/spreadsheet/range#getDisplayValue()) | String | Completed | |
| [getDisplayValues()](https://developers.google.com/apps-script/reference/spreadsheet/range#getDisplayValues()) | String[][] | Completed | |
| [getFilter()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFilter()) | [Filter](#filter) | Completed | |
| [getFontColor()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontColor()) | String | Completed | |
| [getFontColors()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontColors()) | String[][] | Completed | |
| [getFontFamilies()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontFamilies()) | String[][] | Completed | |
| [getFontFamily()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontFamily()) | String | Completed | |
| [getFontLine()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontLine()) | String | Completed | |
| [getFontLines()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontLines()) | String[][] | Completed | |
| [getFontSize()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontSize()) | Integer | Completed | |
| [getFontSizes()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontSizes()) | Integer[][] | Completed | |
| [getFontStyle()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontStyle()) | String | Completed | |
| [getFontStyles()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontStyles()) | String[][] | Completed | |
| [getFontWeight()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontWeight()) | String | Completed | |
| [getFontWeights()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontWeights()) | String[][] | Completed | |
| [getFormula()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFormula()) | String | Completed | |
| [getFormulas()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFormulas()) | String[][] | Completed | |
| [getFormulasR1C1()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFormulasR1C1()) | String[][] | Completed | |
| [getGridId()](https://developers.google.com/apps-script/reference/spreadsheet/range#getGridId()) | Integer | Completed | |
| [getHeight()](https://developers.google.com/apps-script/reference/spreadsheet/range#getHeight()) | Integer | Completed | |
| [getHorizontalAlignment()](https://developers.google.com/apps-script/reference/spreadsheet/range#getHorizontalAlignment()) | String | Completed | |
| [getHorizontalAlignments()](https://developers.google.com/apps-script/reference/spreadsheet/range#getHorizontalAlignments()) | String[][] | Completed | |
| [getLastColumn()](https://developers.google.com/apps-script/reference/spreadsheet/range#getLastColumn()) | Integer | Completed | |
| [getLastRow()](https://developers.google.com/apps-script/reference/spreadsheet/range#getLastRow()) | Integer | Completed | |
| [getMergedRanges()](https://developers.google.com/apps-script/reference/spreadsheet/range#getMergedRanges()) | [Range[]](#range) | Completed | |
| [getNextDataCell(direction)](https://developers.google.com/apps-script/reference/spreadsheet/range#getNextDataCell(Direction)) | [Range](#range) | Completed | |
| [getNote()](https://developers.google.com/apps-script/reference/spreadsheet/range#getNote()) | String | Completed | |
| [getNotes()](https://developers.google.com/apps-script/reference/spreadsheet/range#getNotes()) | String[][] | Completed | |
| [getNumColumns()](https://developers.google.com/apps-script/reference/spreadsheet/range#getNumColumns()) | Integer | Completed | |
| [getNumRows()](https://developers.google.com/apps-script/reference/spreadsheet/range#getNumRows()) | Integer | Completed | |
| [getNumberFormat()](https://developers.google.com/apps-script/reference/spreadsheet/range#getNumberFormat()) | String | Completed | |
| [getNumberFormats()](https://developers.google.com/apps-script/reference/spreadsheet/range#getNumberFormats()) | String[][] | Completed | |
| [getRow()](https://developers.google.com/apps-script/reference/spreadsheet/range#getRow()) | Integer | Completed | |
| [getRowIndex()](https://developers.google.com/apps-script/reference/spreadsheet/range#getRowIndex()) | Integer | Completed | |
| [getSheet()](https://developers.google.com/apps-script/reference/spreadsheet/range#getSheet()) | [Sheet](#sheet) | Completed | |
| [getTextDirection()](https://developers.google.com/apps-script/reference/spreadsheet/range#getTextDirection()) | [TextDirection](https://developers.google.com/apps-script/reference/spreadsheet/text-direction) | Completed | |
| [getTextDirections()](https://developers.google.com/apps-script/reference/spreadsheet/range#getTextDirections()) | [TextDirection[][]](https://developers.google.com/apps-script/reference/spreadsheet/text-direction) | Completed | |
| [getTextRotation()](https://developers.google.com/apps-script/reference/spreadsheet/range#getTextRotation()) | [TextRotation](https://developers.google.com/apps-script/reference/spreadsheet/text-rotation) | Completed | |
| [getTextRotations()](https://developers.google.com/apps-script/reference/spreadsheet/range#getTextRotations()) | [TextRotation[][]](https://developers.google.com/apps-script/reference/spreadsheet/text-rotation) | Completed | |
| [getTextStyle()](https://developers.google.com/apps-script/reference/spreadsheet/range#getTextStyle()) | [TextStyle](#textstyle) | Completed | |
| [getTextStyles()](https://developers.google.com/apps-script/reference/spreadsheet/range#getTextStyles()) | [TextStyle[][]](#textstyle) | Completed | |
| [getValue()](https://developers.google.com/apps-script/reference/spreadsheet/range#getValue()) | Object | Completed | |
| [getValues()](https://developers.google.com/apps-script/reference/spreadsheet/range#getValues()) | Object[][] | Completed | |
| [getVerticalAlignment()](https://developers.google.com/apps-script/reference/spreadsheet/range#getVerticalAlignment()) | String | Completed | |
| [getVerticalAlignments()](https://developers.google.com/apps-script/reference/spreadsheet/range#getVerticalAlignments()) | String[][] | Completed | |
| [getWidth()](https://developers.google.com/apps-script/reference/spreadsheet/range#getWidth()) | Integer | Completed | |
| [getWrap()](https://developers.google.com/apps-script/reference/spreadsheet/range#getWrap()) | Boolean | Completed | |
| [getWraps()](https://developers.google.com/apps-script/reference/spreadsheet/range#getWraps()) | Boolean[][] | Completed | |
| [getWrapStrategies()](https://developers.google.com/apps-script/reference/spreadsheet/range#getWrapStrategies()) | [WrapStrategy[][]](https://developers.google.com/apps-script/reference/spreadsheet/wrap-strategy) | Completed | |
| [getWrapStrategy()](https://developers.google.com/apps-script/reference/spreadsheet/range#getWrapStrategy()) | [WrapStrategy](https://developers.google.com/apps-script/reference/spreadsheet/wrap-strategy) | Completed | |
| [insertCheckboxes()](https://developers.google.com/apps-script/reference/spreadsheet/range#insertCheckboxes()) | [Range](#range) | Completed | |
| [isChecked()](https://developers.google.com/apps-script/reference/spreadsheet/range#isChecked()) | Boolean | Not Started | |
| [isEndColumnBounded()](https://developers.google.com/apps-script/reference/spreadsheet/range#isEndColumnBounded()) | Boolean | Completed | |
| [isEndRowBounded()](https://developers.google.com/apps-script/reference/spreadsheet/range#isEndRowBounded()) | Boolean | Completed | |
| [isPartOfMerge()](https://developers.google.com/apps-script/reference/spreadsheet/range#isPartOfMerge()) | Boolean | Completed | |
| [isStartColumnBounded()](https://developers.google.com/apps-script/reference/spreadsheet/range#isStartColumnBounded()) | Boolean | Completed | |
| [isStartRowBounded()](https://developers.google.com/apps-script/reference/spreadsheet/range#isStartRowBounded()) | Boolean | Completed | |
| [merge()](https://developers.google.com/apps-script/reference/spreadsheet/range#merge()) | [Range](#range) | Completed | |
| [mergeAcross()](https://developers.google.com/apps-script/reference/spreadsheet/range#mergeAcross()) | [Range](#range) | Completed | |
| [mergeVertically()](https://developers.google.com/apps-script/reference/spreadsheet/range#mergeVertically()) | [Range](#range) | Completed | |
| [moveTo(target)](https://developers.google.com/apps-script/reference/spreadsheet/range#moveTo(Range)) | void | Completed | |
| [offset(rowOffset, columnOffset, numRows, numColumns)](https://developers.google.com/apps-script/reference/spreadsheet/range#offset(Integer,Integer,Integer,Integer)) | [Range](#range) | Completed | |
| [protect()](https://developers.google.com/apps-script/reference/spreadsheet/range#protect()) | [Protection](#protection) | Completed | |
| [randomize()](https://developers.google.com/apps-script/reference/spreadsheet/range#randomize()) | [Range](#range) | Completed | |
| [removeCheckboxes()](https://developers.google.com/apps-script/reference/spreadsheet/range#removeCheckboxes()) | [Range](#range) | Completed | |
| [removeDuplicates()](https://developers.google.com/apps-script/reference/spreadsheet/range#removeDuplicates()) | [Range](#range) | Completed | |
| [setBackground(color)](https://developers.google.com/apps-script/reference/spreadsheet/range#setBackground(String)) | [Range](#range) | Completed | |
| [setBackgrounds(color)](https://developers.google.com/apps-script/reference/spreadsheet/range#setBackgrounds(String)) | [Range](#range) | Completed | |
| [setBackgroundRGB(red, green, blue)](https://developers.google.com/apps-script/reference/spreadsheet/range#setBackgroundRGB(Integer,Integer,Integer)) | [Range](#range) | Completed | |
| [setBorder(top, left, bottom, right, vertical, horizontal, color, style)](https://developers.google.com/apps-script/reference/spreadsheet/range#setBorder(Boolean,Boolean,Boolean,Boolean,Boolean,Boolean,String,BorderStyle)) | [Range](#range) | Not Started | |
| [setDataValidation(rule)](https://developers.google.com/apps-script/reference/spreadsheet/range#setDataValidation(DataValidation)) | [Range](#range) | Completed | |
| [setDataValidations(rules)](https://developers.google.com/apps-script/reference/spreadsheet/range#setDataValidations(DataValidation)) | [Range](#range) | Completed | |
| [setFontColor(color)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontColor(String)) | [Range](#range) | Completed | |
| [setFontColors(colors)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontColors(Object)) | [Range](#range) | Completed | |
| [setFontFamilies(fontFamilies)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontFamilies(Object)) | [Range](#range) | Completed | |
| [setFontFamily(fontFamily)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontFamily(String)) | [Range](#range) | Completed | |
| [setFontLine(fontLine)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontLine(String)) | [Range](#range) | Completed | |
| [setFontLines(fontLines)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontLines(Object)) | [Range](#range) | Completed | |
| [setFontSize(fontSize)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontSize(Integer)) | [Range](#range) | Completed | |
| [setFontSizes(fontSizes)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontSizes(Object)) | [Range](#range) | Completed | |
| [setFontStyle(fontStyle)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontStyle(String)) | [Range](#range) | Completed | |
| [setFontStyles(fontStyles)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontStyles(Object)) | [Range](#range) | Completed | |
| [setFontWeight(fontWeight)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontWeight(String)) | [Range](#range) | Completed | |
| [setFontWeights(fontWeights)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontWeights(Object)) | [Range](#range) | Completed | |
| [setFormula(formula)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFormula(String)) | [Range](#range) | Completed | |
| [setFormulas(formulas)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFormulas(Object)) | [Range](#range) | Completed | |
| [setFormulasR1C1(formulas)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFormulasR1C1(Object)) | [Range](#range) | Completed | |
| [setHorizontalAlignment(alignment)](https://developers.google.com/apps-script/reference/spreadsheet/range#setHorizontalAlignment(String)) | [Range](#range) | Completed | |
| [setHorizontalAlignments(alignments)](https://developers.google.com/apps-script/reference/spreadsheet/range#setHorizontalAlignments(Object)) | [Range](#range) | Completed | |
| [setNote(note)](https://developers.google.com/apps-script/reference/spreadsheet/range#setNote(String)) | [Range](#range) | Completed | |
| [setNotes(notes)](https://developers.google.com/apps-script/reference/spreadsheet/range#setNotes(Object)) | [Range](#range) | Completed | |
| [setNumberFormat(numberFormat)](https://developers.google.com/apps-script/reference/spreadsheet/range#setNumberFormat(String)) | [Range](#range) | Completed | |
| [setNumberFormats(numberFormats)](https://developers.google.com/apps-script/reference/spreadsheet/range#setNumberFormats(Object)) | [Range](#range) | Completed | |
| [setTextDirection(direction)](https://developers.google.com/apps-script/reference/spreadsheet/range#setTextDirection(TextDirection)) | [Range](#range) | Completed | |
| [setTextDirections(directions)](https://developers.google.com/apps-script/reference/spreadsheet/range#setTextDirections(Object)) | [Range](#range) | Completed | |
| [setTextRotation(degrees)](https://developers.google.com/apps-script/reference/spreadsheet/range#setTextRotation(Integer)) | [Range](#range) | Completed | |
| [setTextRotations(rotations)](https://developers.google.com/apps-script/reference/spreadsheet/range#setTextRotations(Object)) | [Range](#range) | Completed | |
| [setTextStyle(style)](https://developers.google.com/apps-script/reference/spreadsheet/range#setTextStyle(TextStyle)) | [Range](#range) | Completed | |
| [setTextStyles(styles)](https://developers.google.com/apps-script/reference/spreadsheet/range#setTextStyles(Object)) | [Range](#range) | Completed | |
| [setValue(value)](https://developers.google.com/apps-script/reference/spreadsheet/range#setValue(Object)) | [Range](#range) | Completed | |
| [setValues(values)](https://developers.google.com/apps-script/reference/spreadsheet/range#setValues(Object)) | [Range](#range) | Completed | |
| [setVerticalAlignment(alignment)](https://developers.google.com/apps-script/reference/spreadsheet/range#setVerticalAlignment(String)) | [Range](#range) | Completed | |
| [setVerticalAlignments(alignments)](https://developers.google.com/apps-script/reference/spreadsheet/range#setVerticalAlignments(Object)) | [Range](#range) | Completed | |
| [setWrap(isWrapEnabled)](https://developers.google.com/apps-script/reference/spreadsheet/range#setWrap(Boolean)) | [Range](#range) | Completed | |
| [setWrapStrategies(strategies)](https://developers.google.com/apps-script/reference/spreadsheet/range#setWrapStrategies(Object)) | [Range](#range) | Completed | |
| [setWrapStrategy(strategy)](https://developers.google.com/apps-script/reference/spreadsheet/range#setWrapStrategy(WrapStrategy)) | [Range](#range) | Completed | |
| [setWraps(isWrapEnabled)](https://developers.google.com/apps-script/reference/spreadsheet/range#setWraps(Object)) | [Range](#range) | Completed | |
| [shiftColumnGroupDepth(delta)](https://developers.google.com/apps-script/reference/spreadsheet/range#shiftColumnGroupDepth(Integer)) | [Range](#range) | Completed | |
| [shiftRowGroupDepth(delta)](https://developers.google.com/apps-script/reference/spreadsheet/range#shiftRowGroupDepth(Integer)) | [Range](#range) | Completed | |
| [sort(sortSpecObj)](https://developers.google.com/apps-script/reference/spreadsheet/range#sort(Object)) | [Range](#range) | Completed | |
| [splitTextToColumns(delimiter)](https://developers.google.com/apps-script/reference/spreadsheet/range#splitTextToColumns(String)) | void | Not Started | |
| [trimWhitespace()](https://developers.google.com/apps-script/reference/spreadsheet/range#trimWhitespace()) | [Range](#range) | Not Started | |
| [uncheck()](https://developers.google.com/apps-script/reference/spreadsheet/range#uncheck()) | [Range](#range) | Completed | |

---
## [ColorBuilder](https://developers.google.com/apps-script/reference/spreadsheet/color-builder)
Builds a color. 
100% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [build()](https://developers.google.com/apps-script/reference/spreadsheet/color-builder#build()) | [Color](#color) | Completed | |
| [setRgbColor(cssString)](https://developers.google.com/apps-script/reference/spreadsheet/color-builder#setRgbColor(String)) | [ColorBuilder](#colorbuilder) | Completed | |
| [setThemeColor(themeColorType)](https://developers.google.com/apps-script/reference/spreadsheet/color-builder#setThemeColor(ThemeColorType)) | [ColorBuilder](#colorbuilder) | Completed | |

---
## [Color](https://developers.google.com/apps-script/reference/spreadsheet/color)
A color, such as for a range background.
100% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [asRgbColor()](https://developers.google.com/apps-script/reference/spreadsheet/color#asRgbColor()) | [RgbColor](https://developers.google.com/apps-script/reference/base/rgb-color) | Completed | |
| [asThemeColor()](https://developers.google.com/apps-script/reference/spreadsheet/color#asThemeColor()) | [ThemeColor](https://developers.google.com/apps-script/reference/spreadsheet/theme-color) | Completed | |
| [getColorType()](https://developers.google.com/apps-script/reference/spreadsheet/color#getColorType()) | [ColorType](https://developers.google.com/apps-script/reference/spreadsheet/color-type) | Completed | |

---
## Enums
| Enum | Status |
| --- | --- |
| [AutoFillSeries](https://developers.google.com/apps-script/reference/spreadsheet/auto-fill-series) | Completed |
| [BandingTheme](https://developers.google.com/apps-script/reference/spreadsheet/banding-theme) | Completed |
| [BooleanCriteria](https://developers.google.com/apps-script/reference/spreadsheet/boolean-criteria) | Completed |
| [BorderStyle](https://developers.google.com/apps-script/reference/spreadsheet/border-style) | Completed |
| [ColorType](https://developers.google.com/apps-script/reference/spreadsheet/color-type) | Completed |
| [CopyPasteType](https://developers.google.com/apps-script/reference/spreadsheet/copy-paste-type) | Completed |
| [DataExecutionErrorCode](https://developers.google.com/apps-script/reference/spreadsheet/data-execution-error-code) | Completed |
| [DataExecutionState](https://developers.google.com/apps-script/reference/spreadsheet/data-execution-state) | Completed |
| [DataSourceParameterType](https://developers.google.com/apps-script/reference/spreadsheet/data-source-parameter-type) | Completed |
| [DataSourceRefreshScope](https://developers.google.com/apps-script/reference/spreadsheet/data-source-refresh-scope) | Completed |
| [DataSourceType](https://developers.google.com/apps-script/reference/spreadsheet/data-source-type) | Completed |
| [DataValidationCriteria](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-criteria) | Completed |
| [DateTimeGroupingRuleType](https://developers.google.com/apps-script/reference/spreadsheet/date-time-grouping-rule-type) | Completed |
| [DeveloperMetadataLocationType](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata-location-type) | Completed |
| [DeveloperMetadataVisibility](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata-visibility) | Completed |
| [Dimension](https://developers.google.com/apps-script/reference/spreadsheet/dimension) | Completed |
| [Direction](https://developers.google.com/apps-script/reference/spreadsheet/direction) | Completed |
| [FrequencyType](https://developers.google.com/apps-script/reference/spreadsheet/frequency-type) | Completed |
| [GroupControlTogglePosition](https://developers.google.com/apps-script/reference/spreadsheet/group-control-toggle-position) | Completed |
| [InterpolationType](https://developers.google.com/apps-script/reference/spreadsheet/interpolation-type) | Completed |
| [PivotTableSummarizeFunction](https://developers.google.com/apps-script/reference/spreadsheet/pivot-table-summarize-function) | Completed |
| [PivotValueDisplayType](https://developers.google.com/apps-script/reference/spreadsheet/pivot-value-display-type) | Completed |
| [ProtectionType](https://developers.google.com/apps-script/reference/spreadsheet/protection-type) | Completed |
| [RecalculationInterval](https://developers.google.com/apps-script/reference/spreadsheet/recalculation-interval) | Completed |
| [RelativeDate](https://developers.google.com/apps-script/reference/spreadsheet/relative-date) | Completed |
| [SheetType](https://developers.google.com/apps-script/reference/spreadsheet/sheet-type) | Completed |
| [SortOrder](https://developers.google.com/apps-script/reference/spreadsheet/sort-order) | Completed |
| [TextDirection](https://developers.google.com/apps-script/reference/spreadsheet/text-direction) | Completed |
| [TextToColumnsDelimiter](https://developers.google.com/apps-script/reference/spreadsheet/text-to-columns-delimiter) | Completed |
| [ThemeColorType](https://developers.google.com/apps-script/reference/spreadsheet/theme-color-type) | Completed |
| [ValueType](https://developers.google.com/apps-script/reference/spreadsheet/value-type) | Completed |
| [WrapStrategy](https://developers.google.com/apps-script/reference/spreadsheet/wrap-strategy) | Completed |