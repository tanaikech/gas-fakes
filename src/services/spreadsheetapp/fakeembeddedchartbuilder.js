import { Proxies } from "../../support/proxies.js";
import { signatureArgs } from "../../support/helpers.js";
import { Utils } from "../../support/utils.js";
import { makeSheetsGridRange } from "./sheetrangehelpers.js";
import { newFakeEmbeddedChart } from "./fakeembeddedchart.js";
import { newFakeContainerInfo } from "./fakecontainerinfo.js";
import { ChartEnumMapping } from "./chartenummapping.js";

const { is } = Utils;

/**
 * @returns {FakeEmbeddedChartBuilder}
 */
export const newFakeEmbeddedChartBuilder = (sheet) => {
  return Proxies.guard(new FakeEmbeddedChartBuilder(sheet));
};

/**
 * Builder for embedded charts.
 */
export class FakeEmbeddedChartBuilder {
  constructor(sheet) {
    this.__sheet = sheet;
    this.__apiChart = {
      spec: {
        title: "",
        basicChart: {
          axis: [],
          domains: [],
          series: [],
        },
      },
      position: {
        overlayPosition: {
          anchorCell: {
            sheetId: sheet.getSheetId(),
            rowIndex: 0,
            columnIndex: 0,
          },
          offsetXPixels: 0,
          offsetYPixels: 0,
        },
      },
    };
  }

  setChartId(id) {
    this.__apiChart.chartId = id;
    return this;
  }

  setApiChart(apiChart) {
    this.__apiChart = JSON.parse(JSON.stringify(apiChart));
    return this;
  }

  addRange(range) {
    const { nargs, matchThrow } = signatureArgs(arguments, "EmbeddedChartBuilder.addRange");
    if (nargs !== 1) matchThrow();

    const gridRange = makeSheetsGridRange(range);

    if (this.__apiChart.spec.basicChart.domains.length === 0) {
      this.__apiChart.spec.basicChart.domains.push({
        domain: { sourceRange: { sources: [gridRange] } },
      });
    } else {
      this.__apiChart.spec.basicChart.series.push({
        series: { sourceRange: { sources: [gridRange] } },
      });
    }
    return this;
  }

  setChartType(type) {
    const { nargs, matchThrow } = signatureArgs(arguments, "EmbeddedChartBuilder.setChartType");
    if (nargs !== 1) matchThrow();

    this.__apiChart.spec.basicChart.chartType = type.toString();
    return this;
  }

  getChartType() {
    const spec = this.__apiChart.spec;
    const chartType = Charts.ChartType;
    if (spec.basicChart) return chartType[spec.basicChart.chartType];
    if (spec.pieChart) return chartType.PIE;
    if (spec.bubbleChart) return chartType.BUBBLE;
    if (spec.candlestickChart) return chartType.CANDLESTICK;
    if (spec.orgChart) return chartType.ORG;
    if (spec.waterfallChart) return chartType.WATERFALL;
    if (spec.treemapChart) return chartType.TREE_MAP;
    if (spec.scorecardChart) return chartType.SCORECARD;
    if (spec.histogramChart) return chartType.HISTOGRAM;

    return null;
  }

  setPosition(anchorRowPos, anchorColPos, offsetX, offsetY) {
    const { nargs, matchThrow } = signatureArgs(arguments, "EmbeddedChartBuilder.setPosition");
    if (nargs !== 4) matchThrow();

    this.__apiChart.position.overlayPosition.anchorCell.rowIndex = anchorRowPos - 1;
    this.__apiChart.position.overlayPosition.anchorCell.columnIndex = anchorColPos - 1;
    this.__apiChart.position.overlayPosition.offsetXPixels = offsetX;
    this.__apiChart.position.overlayPosition.offsetYPixels = offsetY;
    return this;
  }

  setOption(option, value) {
    const { nargs, matchThrow } = signatureArgs(arguments, "EmbeddedChartBuilder.setOption");
    if (nargs !== 2) matchThrow();

    if (option === "title") {
      this.__apiChart.spec.title = value;
    } else {
      if (!this.__apiChart.spec.basicChart.options) {
        this.__apiChart.spec.basicChart.options = {};
      }
      this.__apiChart.spec.basicChart.options[option] = value;
    }
    return this;
  }

  build() {
    const { nargs, matchThrow } = signatureArgs(arguments, "EmbeddedChartBuilder.build");
    if (nargs !== 0) matchThrow();

    // Perform translation from GAS internal state to Sheets REST API Spec
    const apiChart = JSON.parse(JSON.stringify(this.__apiChart));
    const spec = apiChart.spec;
    const basic = spec.basicChart;

    // 1. Translate Enums
    if (basic && basic.legendPosition) {
      basic.legendPosition = ChartEnumMapping.Position[basic.legendPosition] || basic.legendPosition;
    }

    if (spec.hiddenDimensionStrategy) {
      spec.hiddenDimensionStrategy = ChartEnumMapping.ChartHiddenDimensionStrategy[spec.hiddenDimensionStrategy] || spec.hiddenDimensionStrategy;
    }

    // Translate background color from Hex to RGB object if present
    if (basic && basic.options?.backgroundColor) {
      const hex = basic.options.backgroundColor;
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        spec.backgroundColorStyle = {
          rgbColor: {
            red: parseInt(result[1], 16) / 255,
            green: parseInt(result[2], 16) / 255,
            blue: parseInt(result[3], 16) / 255
          }
        };
      }
    }

    // 2. Handle Specialized Spec Blocks
    if (basic && basic.chartType === "PIE") {
      spec.pieChart = {
        domain: basic.domains?.[0]?.domain,
        series: basic.series?.[0]?.series,
        threeDimensional: basic.options?.is3D || false,
        pieHole: basic.options?.pieHole || 0,
      };
      if (basic.legendPosition) spec.pieChart.legendPosition = basic.legendPosition;
      delete spec.basicChart;
    } else if (basic && basic.chartType === "HISTOGRAM") {
      spec.histogramChart = {
        series: [
          {
            data: basic.series?.[0]?.series || basic.domains?.[0]?.domain,
          }
        ],
      };
      if (basic.legendPosition) spec.histogramChart.legendPosition = basic.legendPosition;
      delete spec.basicChart;
    } else if (basic) {
      // Sheets API quirk: even if basicChart.chartType is set, it often defaults to rendering as a LINE 
      // chart unless the series array explicitly mirrors the type.
      basic.series = basic.series || [];
      if (basic.chartType === "COMBO") {
        if (basic.series.length === 0) basic.series.push({ type: "COLUMN" });
      }
      
      basic.series.forEach(s => {
        if (!s.type) s.type = basic.chartType === "COMBO" ? "COLUMN" : basic.chartType;
      });

      // Clean up internal-only 'options' field that the API doesn't recognize
      delete basic.options;
    }

    return newFakeEmbeddedChart(apiChart, this.__sheet);
  }

  // --- Sub-builder coercion methods ---
  asAreaChart() { return this.setChartType("AREA"); }
  asBarChart() { return this.setChartType("BAR"); }
  asColumnChart() { return this.setChartType("COLUMN"); }
  asComboChart() { return this.setChartType("COMBO"); }
  asHistogramChart() { return this.setChartType("HISTOGRAM"); }
  asLineChart() { return this.setChartType("LINE"); }
  asPieChart() { return this.setChartType("PIE"); }
  asScatterChart() { return this.setChartType("SCATTER"); }
  asTableChart() { return this.setChartType("TABLE"); }

  // --- Common Builder Methods ---
  clearRanges() {
    this.__apiChart.spec.basicChart.domains = [];
    this.__apiChart.spec.basicChart.series = [];
    return this;
  }
  
  getContainer() {
    return newFakeContainerInfo(this.__apiChart.position.overlayPosition || {});
  }
  
  getRanges() {
    // In gas-fakes, we don't deeply parse and unwrap ranges back from the API spec for this fake, returning empty array.
    return [];
  }
  
  removeRange(range) { return this; }
  
  setHiddenDimensionStrategy(strategy) {
    this.__apiChart.spec.hiddenDimensionStrategy = strategy ? strategy.toString() : "IGNORE_ROWS";
    return this;
  }
  
  setMergeStrategy(strategy) { return this; }
  setNumHeaders(headers) { return this; }
  setTransposeRowsAndColumns(transpose) { return this; }

  // --- Chart Specific Builder Methods ---
  reverseCategories() { return this; }
  setBackgroundColor(color) { return this.setOption("backgroundColor", color); }
  setColors(colors) { return this; }
  setLegendPosition(position) { 
    this.__apiChart.spec.basicChart.legendPosition = position ? position.toString() : "RIGHT_LEGEND";
    return this; 
  }
  setLegendTextStyle(textStyle) { return this; }
  setPointStyle(pointStyle) { return this; }
  setRange(min, max) { return this; }
  setStacked() { return this; }
  setTitle(title) { 
    this.__apiChart.spec.title = title;
    return this; 
  }
  setTitleTextStyle(textStyle) { return this; }
  setXAxisTextStyle(textStyle) { return this; }
  setXAxisTitle(title) { return this; }
  setXAxisTitleTextStyle(textStyle) { return this; }
  setYAxisTextStyle(textStyle) { return this; }
  setYAxisTitle(title) { return this; }
  setYAxisTitleTextStyle(textStyle) { return this; }
  useLogScale() { return this; }
  set3D() { return this.setOption("is3D", true); }
  enablePaging(enable, pageSize) { return this; }
  enableRtlTable(enable) { return this; }
  enableSorting(enable) { return this; }
  setFirstRowNumber(number) { return this; }
  setInitialSortingAscending(column) { return this; }
  setInitialSortingDescending(column) { return this; }
  showRowNumberColumn(show) { return this; }
  useAlternatingRowStyle(use) { return this; }
  setXAxisLogScale() { return this; }
  setXAxisRange(min, max) { return this; }
  setYAxisLogScale() { return this; }
  setYAxisRange(min, max) { return this; }
  reverseDirection() { return this; }

  toString() {
    const type = this.__apiChart.spec.basicChart?.chartType;
    if (type) {
      // The API uses string constants like "COLUMN", "PIE", "SCATTER".
      // We convert them to CamelCase format like "EmbeddedPieChartBuilder".
      const formattedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      // Handle the underscore in STEPPED_AREA
      const finalType = formattedType.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
      return `Embedded${finalType}ChartBuilder`;
    }

    const hex = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
    return `com.google.apps.maestro.server.beans.trix.impl.ChartPropertyApiEmbeddedChartBuilder@${hex}`;
  }
}
