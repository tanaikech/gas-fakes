/**
 * Advanced sheets service
 */
import { Proxies } from '../../support/proxies.js'
import { notYetImplemented } from '../../support/helpers.js'
import { getAuthedClient } from '../spreadsheetapp/shapis.js'
import { newFakeAdvSheetsSpreadsheets } from './fakeadvsheetsspreadsheets.js'

import { Utils } from '../../support/utils.js'


// these are used to construct calls from the sheets advanced api
// the toString() function returns a stringified version

const advClassMaker = (props) => {

  // it seems that the properties are not defined until they are set, so we can simply start with an empty object
  const ob = {}
  if (!props.length) {
    return notYetImplemented()
  }
  // camel
  const capped = props.map(Utils.capital)
  const done = new Set()

  // create property getters and setters
  capped.map((f, i) => {

    if (done.has(f)) {
      console.log('....WARNING duplicate property  in advClassMaker', f)
    }
    done.add(f)
    ob['get' + f] = () => ob[props[i]]
    ob['set' + f] = (arg) => {
      ob[props[i]] = arg
      return ob
    }
  })

  // tostring is a json stringifier
  ob.toString = () => JSON.stringify(props.reduce((p, c) => {
    p[c] = ob[c]
    return p
  }, {}))

  return Proxies.guard(ob)


}


class FakeAdvSheets {
  constructor() {
    this.client = Proxies.guard(getAuthedClient())
    this.__fakeObjectType = "Sheets"

    const propLists = {
      newGridRange: ['sheetId', 'startRowIndex', 'startColumnIndex', 'endRowIndex', 'endColumnIndex'],
      newCellData: [
        'dataSourceFormula',
        'dataSourceTable',
        'dataValidation',
        'effectiveFormat',
        'effectiveValue',
        'formattedValue',
        'hyperlink',
        'note',
        'pivotTable',
        'textFormatRuns',
        'userEnteredFormat',
        'userEnteredValue'
      ],
      newExtendedValue: ['formulaValue', 'numberValue', 'boolValue', 'errorValue', 'stringValue'],
      newBatchUpdateSpreadsheetRequest: ['requests', 'includeSpreadsheetInResponse', 'responseRanges', 'responseIncludeGridData'],
      newUpdateCellsRequest: ['fields', 'range', 'rows', 'start'],


      newGridData: [
        'columnMetadata',
        'rowData',
        'rowMetadata',
        'startColumn',
        'startRow'
      ],
      newAddBandingRequest: ['bandedRange'],
      newAddChartRequest: ['chart'],
      newAddConditionalFormatRuleRequest: ['rule', 'index'],
      newAddDataSourceRequest: ['dataSource'],
      newAddDimensionGroupRequest: ['range'],
      newAddFilterViewRequest: ['filter'],
      newAddNamedRangeRequest: ['namedRange'],
      newAddProtectedRangeRequest: ['protectedRange'],
      newAddSheetRequest: ['properties'],
      newAddSlicerRequest: ['slicer'],
      newAddTableRequest: ['table'],
      newAppendCellsRequest: [
        `fields`,
        `rows`,
        `sheetId`,
        `tableId`
      ],
      newAppendDimensionRequest: [
        `dimension`,
        `length`,
        `sheetId`,
      ],
      newAutoFillRequest: ['range', 'sourceAndDestination'],
      newAutoResizeDimensionsRequest: ['dataSourceSheetDimensions', 'dimensions'],
      newBandedRange: [
        `rowProperties`,
        `bandedRangeId`,
        `bandedRangeReference`,
        `columnProperties`,
        'range',
      ],
      newBandingProperties: [
        `firstBandColorStyle`,
        `firstBandColor`,
        `footerColor`,
        `footerColorStyle`,
        `headerColor`,
        `headerColorStyle`,
        `secondBandColor`,
        `secondBandColorStyle`
      ],
      newBaselineValueFormat: [
        `comparisonType`,
        `description`,
        `negativeColor`,
        `negativeColorStyle`,
        `position`,
        `positiveColor`,
        `textFormat`,
        `positiveColorStyle`
      ],
      newBasicChartAxis: [
        `viewWindowOptions`,
        `format`,
        `position`,
        `title`,
        `titleTextPosition`
      ],
      newBasicChartDomain: ['domain', 'reversed'],
      newBasicChartSeries: [
        `color`,
        `colorStyle`,
        `dataLabel`,
        `lineStyle`,
        `pointStyle`,
        `series`,
        `styleOverrides`,
        `targetAxis`,
        `type`,
      ],
      newBasicChartSpec: [
        'axis',
        'chartType',
        'compareMode',
        'domains',
        'headerCount',
        'interpolateNulls',
        'legendPosition',
        'lineSmoothing',
        'series',
        'stackedType',
        'threeDimensional',
        'totalDataLabel'
      ],
      newBasicFilter: [
        'sortSpecs',
        'criteria',
        'filterSpecs',
        'range',
        'tableId'
      ],
      newBasicSeriesDataPointStyleOverride: [
        'index',
        'color',
        'colorStyle',
        'pointStyle'
      ],
      newBatchClearValuesByDataFilterRequest: ['dataFilters'],
      newBatchClearValuesRequest: ['ranges'],
      newBatchGetValuesByDataFilterRequest: [
        'valueRenderOption',
        'dataFilters',
        'dateTimeRenderOption',
        'majorDimension'
      ],
      newBatchUpdateValuesByDataFilterRequest: [
        'data',
        'includeValuesInResponse',
        'responseDateTimeRenderOption',
        'responseValueRenderOption',
        'valueInputOption',
      ],
      newBatchUpdateValuesRequest: [
        'data',
        'includeValuesInResponse',
        'responseDateTimeRenderOption',
        'responseValueRenderOption',
        'valueInputOption'
      ],
      newBigQueryDataSourceSpec: ['projectId', 'querySpec', 'tableSpec'],
      newBigQueryQuerySpec: ['rawQuery'],
      newBigQueryTableSpec: ['dataSetId', 'tableId', 'tableProjectId'],
      newBooleanCondition: ['type', 'values'],
      newBooleanRule: ['condition', 'format'],
      newBorder: ['color', 'style', 'width'],
      newBorders: ['bottom', 'left', 'right', 'top'],
      newBubbleChartSpec: [
        'bubbleBorderColor',
        'bubbleBorderColorStyle',
        'bubbleLabels',
        'bubbleMaxRadiusSize',
        'bubbleMinRadiusSize',
        'bubbleOpacity',
        'bubbleSizes',
        'bubbleTextStyle',
        'domain',
        'groupIds',
        'legendPosition',
        'series'
      ],
      newCancelDataSourceRefreshRequest: ['dataSourceId', 'isAll', 'references'],
      newCandlestickChartSpec: ['data', 'domain'],
      newCandlestickData: [
        'closeSeries',
        'highSeries',
        'lowSeries',
        'openSeries',
      ],
      newCandlestickDomain: ['data', 'reversed'],
      newCandlestickSeries: ['data'],
      newCellFormat: [
        'padding',
        'backgroundColor',
        'backgroundColorStyle',
        'borders',
        'horizontalAlignment',
        'hyperlinkDisplayType',
        'numberFormat',
        'textDirection',
        'textFormat',
        'textRotation',
        'verticalAlignment',
        'wrapStrategy'
      ],
      newChartAxisViewWindowOptions: [
        'viewWindowMin',
        'viewWindowMode',
        'viewWindowMax'
      ],
      newChartCustomNumberFormatOptions: ['prefix', 'suffix'],
      newChartData: [
        'aggregateType',
        'columnReference',
        'groupRule',
        'sourceRange'
      ],
      newChartDateTimeRule: ['type'],
      newChartGroupRule: ['dateTimeRule', 'histogramRule'],
      newChartHistogramRule: ['intervalSize', 'maxValue', 'minValue'],
      newChartSourceRange: ['sources'],
      newChartSpec: [
        'altText',
        'backgroundColor',
        'backgroundColorStyle',
        'basicChart',
        'bubbleChart',
        'candlestickChart',
        'dataSourceChartProperties',
        'filterSpecs',
        'fontName',
        'hiddenDimensionStrategy',
        'histogramChart',
        'maximized',
        'orgChart',
        'pieChart',
        'scorecardChart',
        'sortSpecs',
        'subtitle',
        'subtitleTextFormat',
        'subtitleTextPosition',
        'title',
        'titleTextFormat',
        'titleTextPosition',
        'treemapChart',
        'waterfallChart'
      ],
      newChip: ['personProperties', 'richLinkProperties'],
      newChipRun: ['chip', 'startIndex'],
      newClearBasicFilterRequest: ['sheetId'],
      // this one bugs out https://issuetracker.google.com/issues/423737982
      newClearValuesRequest: [],
      newColorStyle: ['rgbColor', 'themeColor'],
      newConditionalFormatRule: ['booleanRule', 'gradientRule', 'ranges'],
      newConditionValue: ['relativeDate', 'userEnteredValue'],
      newCopyPasteRequest: [
        'destination',
        'pasteOrientation',
        'pasteType',
        'source'
      ],
      newCopySheetToAnotherSpreadsheetRequest: ['destinationSpreadsheetId'],
      newCreateDeveloperMetadataRequest: ['developerMetadata'],
      newCutPasteRequest: [
        'destination',
        'pasteType',
        'source'
      ],
      newDataExecutionStatus: [
        'errorCode',
        'errorMessage',
        'lastRefreshTime',
        'state'
      ],
      newDataFilter: ['a1Range', 'gridRange', 'developerMetadataLookup'],
      newDataFilterValueRange: [
        'dataFilter',
        'majorDimension',
        'values'
      ],
      newDataLabel: [
        'customLabelData',
        'placement',
        'textFormat',
        'type',
      ],
      newDataSource: [
        'calculatedColumns',
        'dataSourceId',
        'sheetId',
        'spec',
      ],
      newDataSourceChartProperties: ['dataExecutionStatus', 'dataSourceId'],
      newDataSourceColumn: ['formula', 'reference'],
      newDataSourceColumnReference: ['name'],
      newDataSourceFormula: ['dataExecutionStatus', 'dataSourceId'],
      newDataSourceObjectReference: [
        'chartId',
        'dataSourceFormulaCell',
        'dataSourcePivotTableAnchorCell',
        'dataSourceTableAnchorCell',
        'sheetId'
      ],
      newDataSourceObjectReferences: ['references'],
      newDataSourceParameter: [
        'name',
        'range',
        'namedRangeId'
      ],
      newDataSourceRefreshDailySchedule: ['startTime'],
      newDataSourceRefreshMonthlySchedule: ['daysOfMonth', 'startTime'],
      newDataSourceRefreshSchedule: [
        'dailySchedule',
        'enabled',
        'monthlySchedule',
        'nextRun',
        'refreshScope',
        'weeklySchedule'
      ],
      newDataSourceRefreshWeeklySchedule: ['daysOfWeek', 'startTime'],
      newDataSourceSheetDimensionRange: ['columnReferences', 'sheetId'],
      newDataSourceSheetProperties: [
        'columns',
        'dataExecutionStatus',
        'dataSourceId'
      ],
      newDataSourceSpec: ['bigQuery', 'looker', 'parameters'],
      newDataSourceTable: [
        'columns',
        'columnSelectionType',
        'dataExecutionStatus',
        'dataSourceId',
        'filterSpecs',
        'rowLimit',
        'sortSpecs'
      ],
      newDataValidationRule: [
        'condition',
        'inputMessage',
        'showCustomUi',
        'strict'
      ],
      newDateTimeRule: ['type'],
      newDeleteBandingRequest: ['bandedRangeId'],
      newDeleteConditionalFormatRuleRequest: ['index', 'sheetId'],
      newDeleteDataSourceRequest: ['dataSourceId'],
      newDeleteDeveloperMetadataRequest: ['dataFilter'],
      newDeleteDimensionGroupRequest: ['range'],
      newDeleteDimensionRequest: ['range'],
      newDeleteDuplicatesRequest: ['comparisonColumns', 'range'],
      newDeleteEmbeddedObjectRequest: ['objectId'],
      newDeleteFilterViewRequest: ['filterId'],
      newDeleteNamedRangeRequest: ['namedRangeId'],
      newDeleteProtectedRangeRequest: ['protectedRangeId'],
      newDeleteRangeRequest: ['range', 'shiftDimension'],
      newDeleteSheetRequest: ['sheetId'],
      newDeleteTableRequest: ['tableId'],
      newDeveloperMetadata: [
        'location',
        'metadataId',
        'metadataKey',
        'metadataValue',
        'visibility'
      ],
      newDeveloperMetadataLocation: [
        'locationType',
        'dimensionRange',
        'sheetId',
        'spreadsheet',
      ],
      newDeveloperMetadataLookup: [
        'locationMatchingStrategy',
        'locationType',
        'metadataId',
        'metadataKey',
        'metadataLocation',
        'metadataValue',
        'visibility'
      ],
      newDimensionGroup: ['collapsed', 'depth', 'range'],
      newDimensionProperties: [
        'dataSourceColumnReference',
        'developerMetadata',
        'hiddenByFilter',
        'hiddenByUser',
        'pixelSize'
      ],
      newDimensionRange: [
        'dimension',
        'endIndex',
        'sheetId',
        'startIndex'
      ],
      newDuplicateFilterViewRequest: ['filterId'],
      newDuplicateSheetRequest: [
        'newSheetId',
        'newSheetName',
        'sourceSheetId',
        'insertSheetIndex',
      ],
      newEditors: [
        'domainUsersCanEdit',
        'groups',
        'users'
      ],
      newEmbeddedChart: [
        'border',
        'chartId',
        'spec',
        'position',
      ],
      newEmbeddedObjectBorder: ['color', 'colorStyle'],
      newEmbeddedObjectPosition: [
        'newSheet',
        'overlayPosition',
        'sheetId'
      ],
      newErrorValue: [
        'message',
        'type'
      ],
      newFilterCriteria: [
        'visibleForegroundColorStyle',
        'condition',
        'hiddenValues',
        'visibleBackgroundColor',
        'visibleBackgroundColorStyle',
        'visibleForegroundColor',
      ],
      newFilterSpec: [
        'columnIndex',
        'dataSourceColumnReference',
        'filterCriteria'
      ],
      newFilterView: [
        'namedRangeId',
        'criteria',
        'filterSpecs',
        'filterViewId',
        'range',
        'sortSpecs',
        'tableId',
        'title'
      ],
      newFindReplaceRequest: [
        'allSheets',
        'find',
        'includeFormulas',
        'matchCase',
        'matchEntireCell',
        'range',
        'replacement',
        'searchByRegex',
        'sheetId'
      ],
      newGetSpreadsheetByDataFilterRequest: [
        'dataFilters',
        'excludeTablesInBandedRanges',
        'includeGridData'
      ],
      newGradientRule: ['maxPoint', 'midPoint', 'minPoint'],
      newGridCoordinate: [
        'columnIndex',
        'rowIndex',
        'sheetId'
      ],
      newGridProperties: [
        'columnCount',
        'columnGroupControlAfter',
        'frozenColumnCount',
        'frozenRowCount',
        'hideGridlines',
        'rowCount',
        'rowGroupControlAfter'
      ],
      newHistogramChartSpec: [
        'bucketSize',
        'legendPosition',
        'outlierPercentile',
        'series',
        'showItemDividers'
      ],
      newHistogramRule: ['end', 'interval', 'start'],
      newHistogramSeries: [
        'barColor',
        'barColorStyle',
        'data'
      ],
      newInsertDimensionRequest: ['inheritFromBefore', 'range'],
      newInsertRangeRequest: ['range', 'shiftDimension'],
      newInterpolationPoint: [
        'color',
        'colorStyle',
        'type',
        'value'
      ],
      newInterval: ['endTime', 'startTime'],
      newIterativeCalculationSettings: ['convergenceThreshold', 'maxIterations'],
      newKeyValueFormat: ['position', 'textFormat'],
      newLineStyle: ['type', 'width'],
      newLink: ['uri'],
      newLookerDataSourceSpec: ['explore', 'instanceUri', 'model'],
      newManualRule: ['groups'],
      newManualRuleGroup: ['groupName', 'items'],
      newMergeCellsRequest: ['mergeType', 'range'],
      newMoveDimensionRequest: ['destinationIndex', 'source'],
      newNamedRange: ['name', 'namedRangeId', 'range'],
      newNumberFormat: ['pattern', 'type'],
      newOrgChartSpec: ['labels',
        'nodeColor',
        'nodeColorStyle',
        'nodeSize',
        'parentLabels',
        'selectedNodeColor',
        'selectedNodeColorStyle',
        'tooltips'
      ],
      newOverlayPosition: [
        'anchorCell',
        'heightPixels',
        'offsetXPixels',
        'offsetYPixels',
        'widthPixels'
      ],
      newPadding: ['bottom', 'left', 'right', 'top'],
      newPasteDataRequest: ['coordinate', 'data', 'delimiter', 'html', 'type'],
      newPersonProperties: ['displayFormat', 'email'],
      newPieChartSpec: [
        'domain',
        'legendPosition',
        'pieHole',
        'series',
        'threeDimensional'
      ],
      newPivotFilterCriteria: ['condition', 'visibleByDefault', 'visibleValues'],
      newPivotFilterSpec: [
        'columnOffsetIndex',
        'dataSourceColumnReference',
        'filterCriteria'
      ],
      newPivotGroup: [
        'dataSourceColumnReference',
        'groupLimit',
        'groupRule',
        'label',
        'repeatHeadings',
        'showTotals',
        'sortOrder',
        'sourceColumnOffset',
        'valueBucket',
        'valueMetadata'
      ],
      newPivotGroupLimit: ['applyOrder', 'countLimit'],
      newPivotGroupRule: ['dateTimeRule', 'histogramRule', 'manualRule'],
      newPivotGroupSortValueBucket: ['buckets', 'valuesIndex'],
      newPivotGroupValueMetadata: ['collapsed', 'value'],
      newPivotTable: [
        'columns',
        'criteria',
        'dataExecutionStatus',
        'dataSourceId',
        'filterSpecs',
        'rows',
        'source',
        'valueLayout',
        'values'
      ],
      newPivotValue: [
        'calculatedDisplayType',
        'dataSourceColumnReference',
        'formula',
        'name',
        'sourceColumnOffset',
        'summarizeFunction'
      ],
      newPointStyle: ['shape', 'size'],
      newProtectedRange: [
        'description',
        'editors',
        'namedRangeId',
        'protectedRangeId',
        'range',
        'requestingUserCanEdit',
        'tableId',
        'unprotectedRanges',
        'warningOnly'
      ],
      newRandomizeRangeRequest: ['range'],
      newRefreshDataSourceRequest: ['dataSourceId', 'force', 'isAll', 'references'],
      newRepeatCellRequest: ['cell', 'fields', 'range'],
      newRequest: [
        'addBanding',
        'addChart',
        'addConditionalFormatRule',
        'addDataSource',
        'addDimensionGroup',
        'addFilterView',
        'addNamedRange',
        'addProtectedRange',
        'addSheet',
        'addSlicer',
        'addTable',
        'appendCells',
        'appendDimension',
        'autoFill',
        'autoResizeDimensions',
        'cancelDataSourceRefresh',
        'clearBasicFilter',
        'copyPaste',
        'createDeveloperMetadata',
        'cutPaste',
        'deleteBanding',
        'deleteConditionalFormatRule',
        'deleteDataSource',
        'deleteDeveloperMetadata',
        'deleteDimension',
        'deleteDimensionGroup',
        'deleteDuplicates',
        'deleteEmbeddedObject',
        'deleteFilterView',
        'deleteNamedRange',
        'deleteProtectedRange',
        'deleteRange',
        'deleteSheet',
        'deleteTable',
        'duplicateFilterView',
        'duplicateSheet',
        'findReplace',
        'insertDimension',
        'insertRange',
        'mergeCells',
        'moveDimension',
        'pasteData',
        'randomizeRange',
        'refreshDataSource',
        'repeatCell',
        'setBasicFilter',
        'setDataValidation',
        'sortRange',
        'textToColumns',
        'trimWhitespace',
        'unmergeCells',
        'updateBanding',
        'updateBorders',
        'updateCells',
        'updateChartSpec',
        'updateConditionalFormatRule',
        'updateDataSource',
        'updateDeveloperMetadata',
        'updateDimensionGroup',
        'updateDimensionProperties',
        'updateEmbeddedObjectBorder',
        'updateEmbeddedObjectPosition',
        'updateFilterView',
        'updateNamedRange',
        'updateProtectedRange',
        'updateSheetProperties',
        'updateSlicerSpec',
        'updateSpreadsheetProperties',
        'updateTable'
      ],
      newRichLinkProperties: ['mimeType', 'uri'],
      newRowData: ['values'],
      newScorecardChartSpec: [
        'aggregateType',
        'baselineValueData',
        'baselineValueFormat',
        'customFormatOptions',
        'keyValueData',
        'keyValueFormat',
        'numberFormatSource',
        'scaleFactor'
      ],
      newSearchDeveloperMetadataRequest: ['dataFilters'],
      newSetBasicFilterRequest: ['filter'],
      newSetDataValidationRequest: ['filteredRowsIncluded', 'range', 'rule'],
      newSheet: [
        'bandedRanges',
        'basicFilter',
        'charts',
        'columnGroups',
        'conditionalFormats',
        'data',
        'developerMetadata',
        'filterViews',
        'merges',
        'properties',
        'protectedRanges',
        'rowGroups',
        'slicers',
        'tables'
      ],
      newSheetProperties: [
        'dataSourceSheetProperties',
        'gridProperties',
        'hidden',
        'index',
        'rightToLeft',
        'sheetId',
        'sheetType',
        'tabColor',
        'tabColorStyle',
        'title'
      ],
      newSlicer: ['position', 'slicerId', 'spec'],
      newSlicerSpec: [
        'applyToPivotTables',
        'backgroundColor',
        'backgroundColorStyle',
        'columnIndex',
        'dataRange',
        'filterCriteria',
        'horizontalAlignment',
        'textFormat',
        'title'
      ],
      newSortRangeRequest: ['range', 'sortSpecs'],
      newSortSpec: [
        'backgroundColor',
        'backgroundColorStyle',
        'dataSourceColumnReference',
        'dimensionIndex',
        'foregroundColor',
        'foregroundColorStyle',
        'sortOrder'
      ],
      newSourceAndDestination: ['dimension', 'fillLength', 'source'],
      newSpreadsheet: ['dataSourceSchedules',
        'dataSources',
        'developerMetadata',
        'namedRanges',
        'properties',
        'sheets',
        'spreadsheetId',
        'spreadsheetUrl'
      ],
      newSpreadsheetProperties: [
        'autoRecalc',
        'defaultFormat',
        'importFunctionsExternalUrlAccessAllowed',
        'iterativeCalculationSettings',
        'locale',
        'spreadsheetTheme',
        'timeZone',
        'title'
      ],
      newSpreadsheetTheme: ['primaryFontFamily', 'themeColors'],
      newTable: [
        'columnProperties',
        'name',
        'range',
        'rowsProperties',
        'tableId'
      ],
      newTableColumnDataValidationRule: ['condition'],
      newTableColumnProperties: [
        'columnIndex',
        'columnName',
        'columnType',
        'dataValidationRule'
      ],
      newTableRowsProperties: [
        'firstBandColorStyle',
        'footerColorStyle',
        'headerColorStyle',
        'secondBandColorStyle'
      ],
      newTextFormat: [
        'bold',
        'fontFamily',
        'fontSize',
        'foregroundColor',
        'foregroundColorStyle',
        'italic',
        'link',
        'strikethrough',
        'underline'
      ],
      newTextFormatRun: ['format', 'startIndex'],
      newTextPosition: ['horizontalAlignment'],
      newTextRotation: ['angle', 'vertical'],
      newTextToColumnsRequest: ['delimiter', 'delimiterType', 'source'],
      newThemeColorPair: ['color', 'colorType'],
      newTimeOfDay: ['hours', 'minutes', 'nanos', 'seconds'],
      newTreemapChartColorScale: [
        'maxValueColor',
        'maxValueColorStyle',
        'midValueColor',
        'midValueColorStyle',
        'minValueColor',
        'minValueColorStyle',
        'noDataColor',
        'noDataColorStyle'
      ],
      newTreemapChartSpec: [
        'colorData',
        'colorScale',
        'headerColor',
        'headerColorStyle',
        'hideTooltips',
        'hintedLevels',
        'labels',
        'levels',
        'maxValue',
        'minValue',
        'parentLabels',
        'sizeData',
        'textFormat'
      ],
      newTrimWhitespaceRequest: ['range'],
      newUnmergeCellsRequest: ['range'],
      newUpdateBandingRequest: ['bandedRange', 'fields'],
      newUpdateBordersRequest: [
        'bottom',
        'innerHorizontal',
        'innerVertical',
        'left',
        'range',
        'right',
        'top'
      ],

      newUpdateChartSpecRequest: ['chartId', 'spec'],
      newUpdateConditionalFormatRuleRequest: ['index', 'newIndex', 'rule', 'sheetId'],
      newUpdateDataSourceRequest: ['dataSource', 'fields'],
      newUpdateDeveloperMetadataRequest: ['dataFilters', 'developerMetadata', 'fields'],
      newUpdateDimensionGroupRequest: ['dimensionGroup', 'fields'],
      newUpdateDimensionPropertiesRequest: ['dataSourceSheetRange', 'fields', 'properties', 'range'],
      newUpdateEmbeddedObjectBorderRequest: ['border', 'fields', 'objectId'],
      newUpdateEmbeddedObjectPositionRequest: ['fields', 'newPosition', 'objectId'],
      newUpdateFilterViewRequest: ['fields', 'filter'],
      newUpdateNamedRangeRequest: ['fields', 'namedRange'],
      newUpdateProtectedRangeRequest: ['fields', 'protectedRange'],
      newUpdateSheetPropertiesRequest: ['fields', 'properties'],
      newUpdateSlicerSpecRequest: ['fields', 'slicerId', 'spec'],
      newUpdateSpreadsheetPropertiesRequest: ['fields', 'properties'],
      newUpdateTableRequest: ['fields', 'table'],
      newValueRange: ['majorDimension', 'range', 'values'],
      newWaterfallChartColumnStyle: ['color', 'colorStyle', 'label'],
      newWaterfallChartCustomSubtotal: ['dataIsSubtotal', 'label', 'subtotalIndex'],
      newWaterfallChartDomain: ['data', 'reversed'],
      newWaterfallChartSeries: [
        'customSubtotals',
        'data',
        'dataLabel',
        'hideTrailingSubtotal',
        'negativeColumnsStyle',
        'positiveColumnsStyle',
        'subtotalColumnsStyle'
      ],
      newWaterfallChartSpec: [
        'connectorLineStyle',
        'domain',
        'firstValueIsTotal',
        'hideConnectorLines',
        'series',
        'stackedType',
        'totalDataLabel'
      ]
    }

    Reflect.ownKeys(propLists).forEach(p => {
      this[p] = () => advClassMaker(propLists[p])
    })

  }
  toString() {
    return 'AdvancedServiceIdentifier{name=sheets, version=v4}'
  }
  getVersion() {
    return 'v4'
  }
  get Spreadsheets() {
    return newFakeAdvSheetsSpreadsheets(this)
  }
}

export const newFakeAdvSheets = (...args) => Proxies.guard(new FakeAdvSheets(...args))

