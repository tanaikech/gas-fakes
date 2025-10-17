# [Charts](https://developers.google.com/apps-script/reference/charts)

This service allows users to create charts using Google Charts Tools and render them server side. If you want to render charts in a web browser, use the Google Charts API instead.

## Class: [AreaChartBuilder](https://developers.google.com/apps-script/reference/charts/area-chart-builder)

Builder for area charts. For more details, see the Google Charts documentation.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [build()](https://developers.google.com/apps-script/reference/charts/area-chart-builder#build()) | Builds the chart. | [Chart](#class-chart) | A Chart object, which can be embedded into documents, UI elements, or used as a static image. | not started |  |
| [reverseCategories()](https://developers.google.com/apps-script/reference/charts/area-chart-builder#reverseCategories()) | Reverses the drawing of series in the domain axis. For vertical-range charts (such as line, area or column charts), this means the horizontal axis is drawn from right to left. For horizontal-range charts (such as bar charts), this means the vertical axis is drawn from top to bottom. For pie charts, this means the slices are drawn counterclockwise. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setBackgroundColor(String)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setBackgroundColor(String)) | Sets the background color for the chart. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setColors(String)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setColors(String)) | Sets the colors for the lines in the chart. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataSourceUrl(String)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setDataSourceUrl(String)) | Sets the data source URL that is used to pull data in from an external source, such as Google Sheets. If a data source URL and a DataTable are provided, the data source URL is ignored. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataTable(DataTableBuilder)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setDataTable(DataTableBuilder)) | Sets the data table to use for the chart using a DataTableBuilder. This is a convenience method for setting the data table without needing to call build(). | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataTable(DataTableSource)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setDataTable(DataTableSource)) | Sets the data table which contains the lines for the chart, as well as the X-axis labels. The first column should be a string, and contain the horizontal axis labels. Any number of columns can follow, all must be numeric. Each column is displayed as a separate line. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataViewDefinition(DataViewDefinition)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setDataViewDefinition(DataViewDefinition)) | Sets the data view definition to use for the chart. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setDimensions(Integer,Integer)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setDimensions(Integer,Integer)) |  |  |  | not started |  |
| [setLegendPosition(Position)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setLegendPosition(Position)) | Sets the position of the legend with respect to the chart. By default, there is no legend. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setLegendTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setLegendTextStyle(TextStyle)) | Sets the text style of the chart legend. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setOption(String,Object)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setOption(String,Object)) |  |  |  | not started |  |
| [setPointStyle(PointStyle)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setPointStyle(PointStyle)) | Sets the style for points in the line. By default, points have no particular styles, and only the line is visible. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setRange(Number,Number)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setRange(Number,Number)) |  |  |  | not started |  |
| [setStacked()](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setStacked()) | Uses stacked lines, meaning that line and bar values are stacked (accumulated). By default, there is no stacking. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setTitle(String)) | Sets the title of the chart. The title is displayed centered above the chart. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setTitleTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setTitleTextStyle(TextStyle)) | Sets the text style of the chart title. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setXAxisTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setXAxisTextStyle(TextStyle)) | Sets the horizontal axis text style. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setXAxisTitle(String)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setXAxisTitle(String)) | Adds a title to the horizontal axis. The title is centered and appears below the axis value labels. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setXAxisTitleTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setXAxisTitleTextStyle(TextStyle)) | Sets the horizontal axis title text style. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setYAxisTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setYAxisTextStyle(TextStyle)) | Sets the vertical axis text style. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setYAxisTitle(String)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setYAxisTitle(String)) | Adds a title to the vertical axis. The title is centered and appears to the left of the value labels. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [setYAxisTitleTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/area-chart-builder#setYAxisTitleTextStyle(TextStyle)) | Sets the vertical axis title text style. | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |
| [useLogScale()](https://developers.google.com/apps-script/reference/charts/area-chart-builder#useLogScale()) | Makes the range axis into a logarithmic scale (requires all values to be positive). The range axis are the vertical axis for vertical charts (such as line, area, or column) and the horizontal axis for horizontal charts (such as bar). | [AreaChartBuilder](#class-areachartbuilder) | This builder, useful for chaining. | not started |  |

## Class: [BarChartBuilder](https://developers.google.com/apps-script/reference/charts/bar-chart-builder)

Builder for bar charts. For more details, see the Google Charts documentation.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [build()](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#build()) | Builds the chart. | [Chart](#class-chart) | A Chart object, which can be embedded into documents, UI elements, or used as a static image. | not started |  |
| [reverseCategories()](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#reverseCategories()) | Reverses the drawing of series in the domain axis. For vertical-range charts (such as line, area or column charts), this means the horizontal axis is drawn from right to left. For horizontal-range charts (such as bar charts), this means the vertical axis is drawn from top to bottom. For pie charts, this means the slices are drawn counterclockwise. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [reverseDirection()](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#reverseDirection()) | Reverses the direction in which the bars grow along the horizontal axis. By default, values grow from left to right. Calling this method causes them to grow from right to left. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setBackgroundColor(String)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setBackgroundColor(String)) | Sets the background color for the chart. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setColors(String)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setColors(String)) | Sets the colors for the lines in the chart. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataSourceUrl(String)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setDataSourceUrl(String)) | Sets the data source URL that is used to pull data in from an external source, such as Google Sheets. If a data source URL and a DataTable are provided, the data source URL is ignored. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataTable(DataTableBuilder)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setDataTable(DataTableBuilder)) | Sets the data table to use for the chart using a DataTableBuilder. This is a convenience method for setting the data table without needing to call build(). | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataTable(DataTableSource)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setDataTable(DataTableSource)) | Sets the data table which contains the lines for the chart, as well as the X-axis labels. The first column should be a string, and contain the horizontal axis labels. Any number of columns can follow, all must be numeric. Each column is displayed as a separate line. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataViewDefinition(DataViewDefinition)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setDataViewDefinition(DataViewDefinition)) | Sets the data view definition to use for the chart. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setDimensions(Integer,Integer)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setDimensions(Integer,Integer)) |  |  |  | not started |  |
| [setLegendPosition(Position)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setLegendPosition(Position)) | Sets the position of the legend with respect to the chart. By default, there is no legend. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setLegendTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setLegendTextStyle(TextStyle)) | Sets the text style of the chart legend. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setOption(String,Object)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setOption(String,Object)) |  |  |  | not started |  |
| [setRange(Number,Number)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setRange(Number,Number)) |  |  |  | not started |  |
| [setStacked()](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setStacked()) | Uses stacked lines, meaning that line and bar values are stacked (accumulated). By default, there is no stacking. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setTitle(String)) | Sets the title of the chart. The title is displayed centered above the chart. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setTitleTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setTitleTextStyle(TextStyle)) | Sets the text style of the chart title. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setXAxisTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setXAxisTextStyle(TextStyle)) | Sets the horizontal axis text style. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setXAxisTitle(String)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setXAxisTitle(String)) | Adds a title to the horizontal axis. The title is centered and appears below the axis value labels. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setXAxisTitleTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setXAxisTitleTextStyle(TextStyle)) | Sets the horizontal axis title text style. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setYAxisTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setYAxisTextStyle(TextStyle)) | Sets the vertical axis text style. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setYAxisTitle(String)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setYAxisTitle(String)) | Adds a title to the vertical axis. The title is centered and appears to the left of the value labels. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [setYAxisTitleTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#setYAxisTitleTextStyle(TextStyle)) | Sets the vertical axis title text style. | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |
| [useLogScale()](https://developers.google.com/apps-script/reference/charts/bar-chart-builder#useLogScale()) | Makes the range axis into a logarithmic scale (requires all values to be positive). The range axis are the vertical axis for vertical charts (such as line, area, or column) and the horizontal axis for horizontal charts (such as bar). | [BarChartBuilder](#class-barchartbuilder) | This builder, useful for chaining. | not started |  |

## Class: [Chart](https://developers.google.com/apps-script/reference/charts/chart)

A Chart object, which can be converted to a static image. For charts embedded in spreadsheets, see EmbeddedChart.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getAs(String)](https://developers.google.com/apps-script/reference/charts/chart#getAs(String)) | Return the data inside this object as a blob converted to the specified content type. This method adds the appropriate extension to the filename—for example, "myfile.pdf". However, it assumes that the part of the filename that follows the last period (if any) is an existing extension that should be replaced. Consequently, "ShoppingList.12.25.2014" becomes "ShoppingList.12.25.pdf". | Blob | The data as a blob. | not started |  |
| [getBlob()](https://developers.google.com/apps-script/reference/charts/chart#getBlob()) | Return the data inside this object as a blob. | Blob | The data as a blob. | not started |  |
| [getOptions()](https://developers.google.com/apps-script/reference/charts/chart#getOptions()) | Returns the options for this chart, such as height, colors, and axes. | [ChartOptions](#class-chartoptions) | The options for this chart, such as height, colors, and axes. | not started |  |

## Class: [ChartOptions](https://developers.google.com/apps-script/reference/charts/chart-options)

Exposes options currently configured for a Chart, such as height, color, etc.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [get(String)](https://developers.google.com/apps-script/reference/charts/chart-options#get(String)) | Returns a configured option for this chart. | Object | The value currently set for the specified option or null if the option was not set. | not started |  |
| [getOrDefault(String)](https://developers.google.com/apps-script/reference/charts/chart-options#getOrDefault(String)) | Returns a configured option for this chart. If the chart option is not set, returns the default value of this option if available, or returns null if the default value is not available. | Object | The value currently set for the specified option. If the option was not set and the default value is available, returns the default value. | not started |  |

## Class: [Charts](https://developers.google.com/apps-script/reference/charts/charts)

Entry point for creating Charts in scripts.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [newAreaChart()](https://developers.google.com/apps-script/reference/charts/charts#newAreaChart()) | Starts building an area chart, as described in the Google Chart Tools documentation. | [AreaChartBuilder](#class-areachartbuilder) | An AreaChartBuilder, which can be used to build an area chart. | not started |  |
| [newBarChart()](https://developers.google.com/apps-script/reference/charts/charts#newBarChart()) | Starts building a bar chart, as described in the Google Chart Tools documentation. | [BarChartBuilder](#class-barchartbuilder) | A BarChartBuilder, which can be used to build a bar chart. | not started |  |
| [newColumnChart()](https://developers.google.com/apps-script/reference/charts/charts#newColumnChart()) | Starts building a column chart, as described in the Google Chart Tools documentation. | [ColumnChartBuilder](#class-columnchartbuilder) | A ColumnChartBuilder, which can be used to build a column chart. | not started |  |
| [newDataTable()](https://developers.google.com/apps-script/reference/charts/charts#newDataTable()) | Creates an empty data table, which can have its values set manually. | [DataTableBuilder](#class-datatablebuilder) | A DataTableBuilder, which can hold data for charts. | not started |  |
| [newDataViewDefinition()](https://developers.google.com/apps-script/reference/charts/charts#newDataViewDefinition()) | Creates a new data view definition. | [DataViewDefinitionBuilder](#class-dataviewdefinitionbuilder) | A DataViewDefinitionBuilder, which can be used to build a data view definition. | not started |  |
| [newLineChart()](https://developers.google.com/apps-script/reference/charts/charts#newLineChart()) | Starts building a line chart, as described in the Google Chart Tools documentation. | [LineChartBuilder](#class-linechartbuilder) | A LineChartBuilder, which can be used to build a line chart. | not started |  |
| [newPieChart()](https://developers.google.com/apps-script/reference/charts/charts#newPieChart()) | Starts building a pie chart, as described in the Google Chart Tools documentation. | [PieChartBuilder](#class-piechartbuilder) | A PieChartBuilder, which can be used to build a pie chart. | not started |  |
| [newScatterChart()](https://developers.google.com/apps-script/reference/charts/charts#newScatterChart()) | Starts building a scatter chart, as described in the Google Chart Tools documentation. | [ScatterChartBuilder](#class-scatterchartbuilder) | A ScatterChartBuilder, which can be used to build a scatter chart. | not started |  |
| [newTableChart()](https://developers.google.com/apps-script/reference/charts/charts#newTableChart()) | Starts building a table chart, as described in the Google Chart Tools documentation. | [TableChartBuilder](#class-tablechartbuilder) | A TableChartBuilder, which can be used to build a table chart. | not started |  |
| [newTextStyle()](https://developers.google.com/apps-script/reference/charts/charts#newTextStyle()) | Creates a new text style builder. | [TextStyleBuilder](#class-textstylebuilder) | A TextStyleBuilder, which can be used to build a text style configuration object. | not started |  |

## Class: [ColumnChartBuilder](https://developers.google.com/apps-script/reference/charts/column-chart-builder)

Builder for column charts. For more details, see the Google Charts documentation.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [build()](https://developers.google.com/apps-script/reference/charts/column-chart-builder#build()) | Builds the chart. | [Chart](#class-chart) | A Chart object, which can be embedded into documents, UI elements, or used as a static image. | not started |  |
| [reverseCategories()](https://developers.google.com/apps-script/reference/charts/column-chart-builder#reverseCategories()) | Reverses the drawing of series in the domain axis. For vertical-range charts (such as line, area or column charts), this means the horizontal axis is drawn from right to left. For horizontal-range charts (such as bar charts), this means the vertical axis is drawn from top to bottom. For pie charts, this means the slices are drawn counterclockwise. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setBackgroundColor(String)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setBackgroundColor(String)) | Sets the background color for the chart. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setColors(String)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setColors(String)) | Sets the colors for the lines in the chart. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataSourceUrl(String)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setDataSourceUrl(String)) | Sets the data source URL that is used to pull data in from an external source, such as Google Sheets. If a data source URL and a DataTable are provided, the data source URL is ignored. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataTable(DataTableBuilder)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setDataTable(DataTableBuilder)) | Sets the data table to use for the chart using a DataTableBuilder. This is a convenience method for setting the data table without needing to call build(). | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataTable(DataTableSource)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setDataTable(DataTableSource)) | Sets the data table which contains the lines for the chart, as well as the X-axis labels. The first column should be a string, and contain the horizontal axis labels. Any number of columns can follow, all must be numeric. Each column is displayed as a separate line. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataViewDefinition(DataViewDefinition)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setDataViewDefinition(DataViewDefinition)) | Sets the data view definition to use for the chart. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setDimensions(Integer,Integer)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setDimensions(Integer,Integer)) |  |  |  | not started |  |
| [setLegendPosition(Position)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setLegendPosition(Position)) | Sets the position of the legend with respect to the chart. By default, there is no legend. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setLegendTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setLegendTextStyle(TextStyle)) | Sets the text style of the chart legend. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setOption(String,Object)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setOption(String,Object)) |  |  |  | not started |  |
| [setRange(Number,Number)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setRange(Number,Number)) |  |  |  | not started |  |
| [setStacked()](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setStacked()) | Uses stacked lines, meaning that line and bar values are stacked (accumulated). By default, there is no stacking. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setTitle(String)) | Sets the title of the chart. The title is displayed centered above the chart. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setTitleTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setTitleTextStyle(TextStyle)) | Sets the text style of the chart title. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setXAxisTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setXAxisTextStyle(TextStyle)) | Sets the horizontal axis text style. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setXAxisTitle(String)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setXAxisTitle(String)) | Adds a title to the horizontal axis. The title is centered and appears below the axis value labels. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setXAxisTitleTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setXAxisTitleTextStyle(TextStyle)) | Sets the horizontal axis title text style. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setYAxisTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setYAxisTextStyle(TextStyle)) | Sets the vertical axis text style. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setYAxisTitle(String)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setYAxisTitle(String)) | Adds a title to the vertical axis. The title is centered and appears to the left of the value labels. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [setYAxisTitleTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/column-chart-builder#setYAxisTitleTextStyle(TextStyle)) | Sets the vertical axis title text style. | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |
| [useLogScale()](https://developers.google.com/apps-script/reference/charts/column-chart-builder#useLogScale()) | Makes the range axis into a logarithmic scale (requires all values to be positive). The range axis are the vertical axis for vertical charts (such as line, area, or column) and the horizontal axis for horizontal charts (such as bar). | [ColumnChartBuilder](#class-columnchartbuilder) | This builder, useful for chaining. | not started |  |

## Class: [DataTable](https://developers.google.com/apps-script/reference/charts/data-table)

A Data Table to be used in charts. A DataTable can come from sources such as Google Sheets or specified data-table URLs, or can be filled in by hand. This class intentionally has no methods: a DataTable can be passed around, but not manipulated directly.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |

## Class: [DataTableBuilder](https://developers.google.com/apps-script/reference/charts/data-table-builder)

Builder of DataTable objects. Building a data table consists of first specifying its columns, and then adding its rows, one at a time. Example:

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [addColumn(ColumnType,String)](https://developers.google.com/apps-script/reference/charts/data-table-builder#addColumn(ColumnType,String)) |  |  |  | not started |  |
| [addRow(Object)](https://developers.google.com/apps-script/reference/charts/data-table-builder#addRow(Object)) | Adds a row to the data table. | [DataTableBuilder](#class-datatablebuilder) | this builder, for chaining. | not started |  |
| [build()](https://developers.google.com/apps-script/reference/charts/data-table-builder#build()) | Builds and returns a data table. | [DataTable](#class-datatable) | the data table | not started |  |
| [setValue(Integer,Integer,Object)](https://developers.google.com/apps-script/reference/charts/data-table-builder#setValue(Integer,Integer,Object)) |  |  |  | not started |  |

## Class: [DataViewDefinition](https://developers.google.com/apps-script/reference/charts/data-view-definition)

A data view definition for visualizing chart data.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |

## Class: [DataViewDefinitionBuilder](https://developers.google.com/apps-script/reference/charts/data-view-definition-builder)

Builder for DataViewDefinition objects.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [build()](https://developers.google.com/apps-script/reference/charts/data-view-definition-builder#build()) | Builds and returns the data view definition object that was built using this builder. | [DataViewDefinition](#class-dataviewdefinition) | A data view definition object that was built using this builder. | not started |  |
| [setColumns(Object)](https://developers.google.com/apps-script/reference/charts/data-view-definition-builder#setColumns(Object)) | Sets the indexes of the columns to include in the data view as well as specifying role-column information. This subset of column indexes refer to the columns of the data source that the data view is derived from. | [DataViewDefinitionBuilder](#class-dataviewdefinitionbuilder) | This builder, useful for chaining. | not started |  |

## Class: [LineChartBuilder](https://developers.google.com/apps-script/reference/charts/line-chart-builder)

Builder for line charts. For more details, see the Google Charts documentation.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [build()](https://developers.google.com/apps-script/reference/charts/line-chart-builder#build()) | Builds the chart. | [Chart](#class-chart) | A Chart object, which can be embedded into documents, UI elements, or used as a static image. | not started |  |
| [reverseCategories()](https://developers.google.com/apps-script/reference/charts/line-chart-builder#reverseCategories()) | Reverses the drawing of series in the domain axis. For vertical-range charts (such as line, area or column charts), this means the horizontal axis is drawn from right to left. For horizontal-range charts (such as bar charts), this means the vertical axis is drawn from top to bottom. For pie charts, this means the slices are drawn counterclockwise. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setBackgroundColor(String)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setBackgroundColor(String)) | Sets the background color for the chart. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setColors(String)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setColors(String)) | Sets the colors for the lines in the chart. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setCurveStyle(CurveStyle)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setCurveStyle(CurveStyle)) | Sets the style to use for curves in the chart. See CurveStyle for allowed curve styles. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataSourceUrl(String)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setDataSourceUrl(String)) | Sets the data source URL that is used to pull data in from an external source, such as Google Sheets. If a data source URL and a DataTable are provided, the data source URL is ignored. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataTable(DataTableBuilder)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setDataTable(DataTableBuilder)) | Sets the data table to use for the chart using a DataTableBuilder. This is a convenience method for setting the data table without needing to call build(). | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataTable(DataTableSource)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setDataTable(DataTableSource)) | Sets the data table which contains the lines for the chart, as well as the X-axis labels. The first column should be a string, and contain the horizontal axis labels. Any number of columns can follow, all must be numeric. Each column is displayed as a separate line. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataViewDefinition(DataViewDefinition)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setDataViewDefinition(DataViewDefinition)) | Sets the data view definition to use for the chart. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setDimensions(Integer,Integer)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setDimensions(Integer,Integer)) |  |  |  | not started |  |
| [setLegendPosition(Position)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setLegendPosition(Position)) | Sets the position of the legend with respect to the chart. By default, there is no legend. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setLegendTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setLegendTextStyle(TextStyle)) | Sets the text style of the chart legend. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setOption(String,Object)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setOption(String,Object)) |  |  |  | not started |  |
| [setPointStyle(PointStyle)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setPointStyle(PointStyle)) | Sets the style for points in the line. By default, points have no particular styles, and only the line is visible. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setRange(Number,Number)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setRange(Number,Number)) |  |  |  | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setTitle(String)) | Sets the title of the chart. The title is displayed centered above the chart. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setTitleTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setTitleTextStyle(TextStyle)) | Sets the text style of the chart title. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setXAxisTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setXAxisTextStyle(TextStyle)) | Sets the horizontal axis text style. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setXAxisTitle(String)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setXAxisTitle(String)) | Adds a title to the horizontal axis. The title is centered and appears below the axis value labels. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setXAxisTitleTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setXAxisTitleTextStyle(TextStyle)) | Sets the horizontal axis title text style. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setYAxisTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setYAxisTextStyle(TextStyle)) | Sets the vertical axis text style. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setYAxisTitle(String)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setYAxisTitle(String)) | Adds a title to the vertical axis. The title is centered and appears to the left of the value labels. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [setYAxisTitleTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/line-chart-builder#setYAxisTitleTextStyle(TextStyle)) | Sets the vertical axis title text style. | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |
| [useLogScale()](https://developers.google.com/apps-script/reference/charts/line-chart-builder#useLogScale()) | Makes the range axis into a logarithmic scale (requires all values to be positive). The range axis are the vertical axis for vertical charts (such as line, area, or column) and the horizontal axis for horizontal charts (such as bar). | [LineChartBuilder](#class-linechartbuilder) | This builder, useful for chaining. | not started |  |

## Class: [NumberRangeFilterBuilder](https://developers.google.com/apps-script/reference/charts/number-range-filter-builder)

A builder for number range filter controls.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [setMaxValue(Integer)](https://developers.google.com/apps-script/reference/charts/number-range-filter-builder#setMaxValue(Integer)) | Sets the maximum allowed value for the range lower extent. If undefined, the value is inferred from the contents of the DataTable managed by the control. | [NumberRangeFilterBuilder](#class-numberrangefilterbuilder) | This builder, useful for chaining. | not started |  |
| [setMinValue(Integer)](https://developers.google.com/apps-script/reference/charts/number-range-filter-builder#setMinValue(Integer)) | Sets the minimum allowed value for the range lower extent. If undefined, the value is inferred from the contents of the DataTable managed by the control. | [NumberRangeFilterBuilder](#class-numberrangefilterbuilder) | This builder, useful for chaining. | not started |  |
| [setOrientation(Orientation)](https://developers.google.com/apps-script/reference/charts/number-range-filter-builder#setOrientation(Orientation)) | Sets the slider orientation. | [NumberRangeFilterBuilder](#class-numberrangefilterbuilder) | This builder, useful for chaining. | not started |  |
| [setShowRangeValues(Boolean)](https://developers.google.com/apps-script/reference/charts/number-range-filter-builder#setShowRangeValues(Boolean)) | Sets whether to have labels next to the slider displaying extents of the selected range. | [NumberRangeFilterBuilder](#class-numberrangefilterbuilder) | This builder, useful for chaining. | not started |  |
| [setTicks(Integer)](https://developers.google.com/apps-script/reference/charts/number-range-filter-builder#setTicks(Integer)) | Sets the number of ticks (fixed positions in a range bar) a number range filter slider thumbs can fall in. | [NumberRangeFilterBuilder](#class-numberrangefilterbuilder) | This builder, useful for chaining. | not started |  |

## Class: [PieChartBuilder](https://developers.google.com/apps-script/reference/charts/pie-chart-builder)

A builder for pie charts. For more details, see the Google Charts documentation.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [build()](https://developers.google.com/apps-script/reference/charts/pie-chart-builder#build()) | Builds the chart. | [Chart](#class-chart) | A Chart object, which can be embedded into documents, UI elements, or used as a static image. | not started |  |
| [reverseCategories()](https://developers.google.com/apps-script/reference/charts/pie-chart-builder#reverseCategories()) | Reverses the drawing of series in the domain axis. For vertical-range charts (such as line, area or column charts), this means the horizontal axis is drawn from right to left. For horizontal-range charts (such as bar charts), this means the vertical axis is drawn from top to bottom. For pie charts, this means the slices are drawn counterclockwise. | [PieChartBuilder](#class-piechartbuilder) | This builder, useful for chaining. | not started |  |
| [set3D()](https://developers.google.com/apps-script/reference/charts/pie-chart-builder#set3D()) | Sets the chart to be three-dimensional. | [PieChartBuilder](#class-piechartbuilder) | This builder, useful for chaining. | not started |  |
| [setBackgroundColor(String)](https://developers.google.com/apps-script/reference/charts/pie-chart-builder#setBackgroundColor(String)) | Sets the background color for the chart. | [PieChartBuilder](#class-piechartbuilder) | This builder, useful for chaining. | not started |  |
| [setColors(String)](https://developers.google.com/apps-script/reference/charts/pie-chart-builder#setColors(String)) | Sets the colors for the lines in the chart. | [PieChartBuilder](#class-piechartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataSourceUrl(String)](https://developers.google.com/apps-script/reference/charts/pie-chart-builder#setDataSourceUrl(String)) | Sets the data source URL that is used to pull data in from an external source, such as Google Sheets. If a data source URL and a DataTable are provided, the data source URL is ignored. | [PieChartBuilder](#class-piechartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataTable(DataTableBuilder)](https://developers.google.com/apps-script/reference/charts/pie-chart-builder#setDataTable(DataTableBuilder)) | Sets the data table to use for the chart using a DataTableBuilder. This is a convenience method for setting the data table without needing to call build(). | [PieChartBuilder](#class-piechartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataTable(DataTableSource)](https://developers.google.com/apps-script/reference/charts/pie-chart-builder#setDataTable(DataTableSource)) | Sets the data table which contains the lines for the chart, as well as the X-axis labels. The first column should be a string, and contain the horizontal axis labels. Any number of columns can follow, all must be numeric. Each column is displayed as a separate line. | [PieChartBuilder](#class-piechartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataViewDefinition(DataViewDefinition)](https://developers.google.com/apps-script/reference/charts/pie-chart-builder#setDataViewDefinition(DataViewDefinition)) | Sets the data view definition to use for the chart. | [PieChartBuilder](#class-piechartbuilder) | This builder, useful for chaining. | not started |  |
| [setDimensions(Integer,Integer)](https://developers.google.com/apps-script/reference/charts/pie-chart-builder#setDimensions(Integer,Integer)) |  |  |  | not started |  |
| [setLegendPosition(Position)](https://developers.google.com/apps-script/reference/charts/pie-chart-builder#setLegendPosition(Position)) | Sets the position of the legend with respect to the chart. By default, there is no legend. | [PieChartBuilder](#class-piechartbuilder) | This builder, useful for chaining. | not started |  |
| [setLegendTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/pie-chart-builder#setLegendTextStyle(TextStyle)) | Sets the text style of the chart legend. | [PieChartBuilder](#class-piechartbuilder) | This builder, useful for chaining. | not started |  |
| [setOption(String,Object)](https://developers.google.com/apps-script/reference/charts/pie-chart-builder#setOption(String,Object)) |  |  |  | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/charts/pie-chart-builder#setTitle(String)) | Sets the title of the chart. The title is displayed centered above the chart. | [PieChartBuilder](#class-piechartbuilder) | This builder, useful for chaining. | not started |  |
| [setTitleTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/pie-chart-builder#setTitleTextStyle(TextStyle)) | Sets the text style of the chart title. | [PieChartBuilder](#class-piechartbuilder) | This builder, useful for chaining. | not started |  |

## Class: [ScatterChartBuilder](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder)

Builder for scatter charts. For more details, see the Google Charts documentation.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [build()](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#build()) | Builds the chart. | [Chart](#class-chart) | A Chart object, which can be embedded into documents, UI elements, or used as a static image. | not started |  |
| [setBackgroundColor(String)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setBackgroundColor(String)) | Sets the background color for the chart. | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setColors(String)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setColors(String)) | Sets the colors for the lines in the chart. | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataSourceUrl(String)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setDataSourceUrl(String)) | Sets the data source URL that is used to pull data in from an external source, such as Google Sheets. If a data source URL and a DataTable are provided, the data source URL is ignored. | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataTable(DataTableBuilder)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setDataTable(DataTableBuilder)) | Sets the data table to use for the chart using a DataTableBuilder. This is a convenience method for setting the data table without needing to call build(). | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataTable(DataTableSource)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setDataTable(DataTableSource)) | Sets the data table which contains the lines for the chart, as well as the X-axis labels. The first column should be a string, and contain the horizontal axis labels. Any number of columns can follow, all must be numeric. Each column is displayed as a separate line. | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataViewDefinition(DataViewDefinition)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setDataViewDefinition(DataViewDefinition)) | Sets the data view definition to use for the chart. | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setDimensions(Integer,Integer)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setDimensions(Integer,Integer)) |  |  |  | not started |  |
| [setLegendPosition(Position)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setLegendPosition(Position)) | Sets the position of the legend with respect to the chart. By default, there is no legend. | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setLegendTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setLegendTextStyle(TextStyle)) | Sets the text style of the chart legend. | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setOption(String,Object)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setOption(String,Object)) |  |  |  | not started |  |
| [setPointStyle(PointStyle)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setPointStyle(PointStyle)) | Sets the style for points in the line. By default, points have no particular styles, and only the line is visible. | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setTitle(String)) | Sets the title of the chart. The title is displayed centered above the chart. | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setTitleTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setTitleTextStyle(TextStyle)) | Sets the text style of the chart title. | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setXAxisLogScale()](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setXAxisLogScale()) | Makes the horizontal axis into a logarithmic scale (requires all values to be positive). | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setXAxisRange(Number,Number)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setXAxisRange(Number,Number)) |  |  |  | not started |  |
| [setXAxisTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setXAxisTextStyle(TextStyle)) | Sets the horizontal axis text style. | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setXAxisTitle(String)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setXAxisTitle(String)) | Adds a title to the horizontal axis. The title is centered and appears below the axis value labels. | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setXAxisTitleTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setXAxisTitleTextStyle(TextStyle)) | Sets the horizontal axis title text style. | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setYAxisLogScale()](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setYAxisLogScale()) | Makes the vertical axis into a logarithmic scale (requires all values to be positive). | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setYAxisRange(Number,Number)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setYAxisRange(Number,Number)) |  |  |  | not started |  |
| [setYAxisTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setYAxisTextStyle(TextStyle)) | Sets the vertical axis text style. | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setYAxisTitle(String)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setYAxisTitle(String)) | Adds a title to the vertical axis. The title is centered and appears to the left of the value labels. | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |
| [setYAxisTitleTextStyle(TextStyle)](https://developers.google.com/apps-script/reference/charts/scatter-chart-builder#setYAxisTitleTextStyle(TextStyle)) | Sets the vertical axis title text style. | [ScatterChartBuilder](#class-scatterchartbuilder) | This builder, useful for chaining. | not started |  |

## Class: [StringFilterBuilder](https://developers.google.com/apps-script/reference/charts/string-filter-builder)

A builder for string filter controls.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [setCaseSensitive(Boolean)](https://developers.google.com/apps-script/reference/charts/string-filter-builder#setCaseSensitive(Boolean)) | Sets whether matching should be case sensitive or not. | [StringFilterBuilder](#class-stringfilterbuilder) | This builder, useful for chaining. | not started |  |
| [setMatchType(MatchType)](https://developers.google.com/apps-script/reference/charts/string-filter-builder#setMatchType(MatchType)) | Sets whether the control should match exact values only (MatchType.EXACT), prefixes starting from the beginning of the value (MatchType.PREFIX), or any substring (MatchType.ANY). | [StringFilterBuilder](#class-stringfilterbuilder) | This builder, useful for chaining. | not started |  |
| [setRealtimeTrigger(Boolean)](https://developers.google.com/apps-script/reference/charts/string-filter-builder#setRealtimeTrigger(Boolean)) | Sets whether the control should match any time a key is pressed or only when the input field 'changes' (loss of focus or pressing the Enter key). | [StringFilterBuilder](#class-stringfilterbuilder) | This builder, useful for chaining. | not started |  |

## Class: [TableChartBuilder](https://developers.google.com/apps-script/reference/charts/table-chart-builder)

A builder for table charts. For more details, see the Google Charts documentation.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [build()](https://developers.google.com/apps-script/reference/charts/table-chart-builder#build()) | Builds the chart. | [Chart](#class-chart) | A Chart object, which can be embedded into documents, UI elements, or used as a static image. | not started |  |
| [enablePaging(Boolean)](https://developers.google.com/apps-script/reference/charts/table-chart-builder#enablePaging(Boolean)) | Sets whether to enable paging through the data. | [TableChartBuilder](#class-tablechartbuilder) | This builder, useful for chaining. | not started |  |
| [enablePaging(Integer,Integer)](https://developers.google.com/apps-script/reference/charts/table-chart-builder#enablePaging(Integer,Integer)) |  |  |  | not started |  |
| [enablePaging(Integer)](https://developers.google.com/apps-script/reference/charts/table-chart-builder#enablePaging(Integer)) | Enables paging and sets the number of rows in each page. | [TableChartBuilder](#class-tablechartbuilder) | This builder, useful for chaining. | not started |  |
| [enableRtlTable(Boolean)](https://developers.google.com/apps-script/reference/charts/table-chart-builder#enableRtlTable(Boolean)) | Adds basic support for right-to-left languages (such as Arabic or Hebrew) by reversing the column order of the table, so that column zero is the right-most column, and the last column is the left-most column. | [TableChartBuilder](#class-tablechartbuilder) | This builder, useful for chaining. | not started |  |
| [enableSorting(Boolean)](https://developers.google.com/apps-script/reference/charts/table-chart-builder#enableSorting(Boolean)) | Sets whether to sort columns when the user clicks a column heading. | [TableChartBuilder](#class-tablechartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataSourceUrl(String)](https://developers.google.com/apps-script/reference/charts/table-chart-builder#setDataSourceUrl(String)) | Sets the data source URL that is used to pull data in from an external source, such as Google Sheets. If a data source URL and a DataTable are provided, the data source URL is ignored. | [TableChartBuilder](#class-tablechartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataTable(DataTableBuilder)](https://developers.google.com/apps-script/reference/charts/table-chart-builder#setDataTable(DataTableBuilder)) | Sets the data table to use for the chart using a DataTableBuilder. This is a convenience method for setting the data table without needing to call build(). | [TableChartBuilder](#class-tablechartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataTable(DataTableSource)](https://developers.google.com/apps-script/reference/charts/table-chart-builder#setDataTable(DataTableSource)) | Sets the data table which contains the lines for the chart, as well as the X-axis labels. The first column should be a string, and contain the horizontal axis labels. Any number of columns can follow, all must be numeric. Each column is displayed as a separate line. | [TableChartBuilder](#class-tablechartbuilder) | This builder, useful for chaining. | not started |  |
| [setDataViewDefinition(DataViewDefinition)](https://developers.google.com/apps-script/reference/charts/table-chart-builder#setDataViewDefinition(DataViewDefinition)) | Sets the data view definition to use for the chart. | [TableChartBuilder](#class-tablechartbuilder) | This builder, useful for chaining. | not started |  |
| [setDimensions(Integer,Integer)](https://developers.google.com/apps-script/reference/charts/table-chart-builder#setDimensions(Integer,Integer)) |  |  |  | not started |  |
| [setFirstRowNumber(Integer)](https://developers.google.com/apps-script/reference/charts/table-chart-builder#setFirstRowNumber(Integer)) | Sets the row number for the first row in the data table. | [TableChartBuilder](#class-tablechartbuilder) | This builder, useful for chaining. | not started |  |
| [setInitialSortingAscending(Integer)](https://developers.google.com/apps-script/reference/charts/table-chart-builder#setInitialSortingAscending(Integer)) | Sets the index of the column according to which the table should be initially sorted (ascending). | [TableChartBuilder](#class-tablechartbuilder) | This builder, useful for chaining. | not started |  |
| [setInitialSortingDescending(Integer)](https://developers.google.com/apps-script/reference/charts/table-chart-builder#setInitialSortingDescending(Integer)) | Sets the index of the column according to which the table should be initially sorted (descending). | [TableChartBuilder](#class-tablechartbuilder) | This builder, useful for chaining. | not started |  |
| [setOption(String,Object)](https://developers.google.com/apps-script/reference/charts/table-chart-builder#setOption(String,Object)) |  |  |  | not started |  |
| [showRowNumberColumn(Boolean)](https://developers.google.com/apps-script/reference/charts/table-chart-builder#showRowNumberColumn(Boolean)) | Sets whether to show the row number as the first column of the table. | [TableChartBuilder](#class-tablechartbuilder) | This builder, useful for chaining. | not started |  |
| [useAlternatingRowStyle(Boolean)](https://developers.google.com/apps-script/reference/charts/table-chart-builder#useAlternatingRowStyle(Boolean)) | Sets whether alternating color style is assigned to odd and even rows of a table chart. | [TableChartBuilder](#class-tablechartbuilder) | This builder, useful for chaining. | not started |  |

## Class: [TextStyle](https://developers.google.com/apps-script/reference/charts/text-style)

A text style configuration object. Used in charts options to configure text style for elements that accepts it, such as title, horizontal axis, vertical axis, legend and tooltip.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getColor()](https://developers.google.com/apps-script/reference/charts/text-style#getColor()) | Gets the color of the text style. | String | The CSS value for the color (such as "blue" or "#00f"). | not started |  |
| [getFontName()](https://developers.google.com/apps-script/reference/charts/text-style#getFontName()) | Gets the font name of the text style. | String | The font name. | not started |  |
| [getFontSize()](https://developers.google.com/apps-script/reference/charts/text-style#getFontSize()) | Gets the font size of the text style. | Number | The font size in pixels. | not started |  |

## Class: [TextStyleBuilder](https://developers.google.com/apps-script/reference/charts/text-style-builder)

A builder used to create TextStyle objects. It allows configuration of the text's properties such as name, color, and size.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [build()](https://developers.google.com/apps-script/reference/charts/text-style-builder#build()) | Builds and returns a text style configuration object that was built using this builder. | [TextStyle](#class-textstyle) | A text style object built using this builder. | not started |  |
| [setColor(String)](https://developers.google.com/apps-script/reference/charts/text-style-builder#setColor(String)) | Sets the color of the text style. | [TextStyleBuilder](#class-textstylebuilder) | This builder, useful for chaining. | not started |  |
| [setFontName(String)](https://developers.google.com/apps-script/reference/charts/text-style-builder#setFontName(String)) | Sets the font name of the text style. | [TextStyleBuilder](#class-textstylebuilder) | This builder, useful for chaining. | not started |  |
| [setFontSize(Number)](https://developers.google.com/apps-script/reference/charts/text-style-builder#setFontSize(Number)) | Sets the font size of the text style. | [TextStyleBuilder](#class-textstylebuilder) | This builder, useful for chaining. | not started |  |

## Enum: [ChartHiddenDimensionStrategy](https://developers.google.com/apps-script/reference/charts/chart-hidden-dimension-strategy)

An enumeration of how hidden dimensions in a source are expressed in a chart.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| IGNORE_BOTH | Default; charts skips any hidden columns and hidden rows. | not started |  |
| IGNORE_COLUMNS | Charts skips hidden columns only. | not started |  |
| IGNORE_ROWS | Charts skips hidden rows only. | not started |  |
| SHOW_BOTH | Charts does not skip hidden columns or hidden rows. | not started |  |

## Enum: [ChartMergeStrategy](https://developers.google.com/apps-script/reference/charts/chart-merge-strategy)

An enumeration of how multiple ranges in the source are expressed in a chart.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| MERGE_COLUMNS | Default. Charts merges the columns of multiple ranges. | not started |  |
| MERGE_ROWS | Charts merges the rows of multiple ranges. | not started |  |

## Enum: [ChartType](https://developers.google.com/apps-script/reference/charts/chart-type)

Chart types supported by the Charts service.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| AREA | Area chart | not started |  |
| BAR | Bar chart | not started |  |
| BUBBLE | Bubble chart. | not started |  |
| CANDLESTICK | Candlestick chart. | not started |  |
| COLUMN | Column chart | not started |  |
| COMBO | Combo chart | not started |  |
| GAUGE | Gauge chart. | not started |  |
| GEO | Geo chart. | not started |  |
| HISTOGRAM | Histogram | not started |  |
| LINE | Line chart | not started |  |
| ORG | Org chart. | not started |  |
| PIE | Pie chart | not started |  |
| RADAR | Radar chart. | not started |  |
| SCATTER | Scatter chart | not started |  |
| SPARKLINE | Sparkline chart. | not started |  |
| STEPPED_AREA | Stepped area chart. | not started |  |
| TABLE | Table chart | not started |  |
| TIMELINE | Timeline chart. | not started |  |
| TREEMAP | Treemap chart. | not started |  |
| WATERFALL | Waterfall chart. | not started |  |

## Enum: [ColumnType](https://developers.google.com/apps-script/reference/charts/column-type)

An enumeration of the valid data types for columns in a DataTable.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| DATE | Corresponds to date values. | not started |  |
| NUMBER | Corresponds to number values. | not started |  |
| STRING | Corresponds to string values. | not started |  |

## Enum: [CurveStyle](https://developers.google.com/apps-script/reference/charts/curve-style)

An enumeration of the styles for curves in a chart.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| NORMAL | Straight lines without curve. | not started |  |
| SMOOTH | The angles of the line are smoothed. | not started |  |

## Enum: [MatchType](https://developers.google.com/apps-script/reference/charts/match-type)

An enumeration of how a string value should be matched. Matching a string is a boolean operation. Given a string, a match term (string), and a match type, the operation outputs true in the following cases:

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| ANY | Match any substring | not started |  |
| EXACT | Match exact values only | not started |  |
| getName() | Returns the name of the match type to be used in the options JSON. | not started |  |
| PREFIX | Match prefixes starting from the beginning of the value | not started |  |

## Enum: [Orientation](https://developers.google.com/apps-script/reference/charts/orientation)

An enumeration of the orientation of an object.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| HORIZONTAL | Horizontal orientation. | not started |  |
| VERTICAL | Vertical orientation. | not started |  |

## Enum: [PickerValuesLayout](https://developers.google.com/apps-script/reference/charts/picker-values-layout)

An enumeration of how to display selected values in picker widget.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| ASIDE | Selected values display in a single text line next to the value picker widget. | not started |  |
| BELOW | Selected values display in a single text line below the widget. | not started |  |
| BELOW_STACKED | Selected values display in a column below the widget. | not started |  |
| BELOW_WRAPPING | Similar to below, but entries that cannot fit in the picker wrap to a new line. | not started |  |

## Enum: [PointStyle](https://developers.google.com/apps-script/reference/charts/point-style)

An enumeration of the styles of points in a line.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| HUGE | Use largest sized line points. | not started |  |
| LARGE | Use large sized line points. | not started |  |
| MEDIUM | Use medium sized line points. | not started |  |
| NONE | Do not display line points. | not started |  |
| TINY | Use tiny line points. | not started |  |

## Enum: [Position](https://developers.google.com/apps-script/reference/charts/position)

An enumeration of legend positions within a chart.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| BOTTOM | Below the chart. | not started |  |
| NONE | No legend is displayed. | not started |  |
| RIGHT | To the right of the chart. | not started |  |
| TOP | Above the chart. | not started |  |

## Interface: [DataTableSource](https://developers.google.com/apps-script/reference/charts/data-table-source)

Interface for objects that can represent their data as a DataTable.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| getDataTable() | Return the data inside this object as a DataTable. | not started |  |

