import { Proxies } from "../../support/proxies.js";
import { notYetImplemented, signatureArgs } from "../../support/helpers.js";
import { batchUpdate } from "./sheetrangehelpers.js";
import { newFakeEmbeddedChartBuilder } from "./fakeembeddedchartbuilder.js";

/**
 * @returns {FakeEmbeddedChart}
 */
export const newFakeEmbeddedChart = (apiChart, sheet) => {
  return Proxies.guard(new FakeEmbeddedChart(apiChart, sheet));
};

/**
 * Represents a chart that has been embedded into a spreadsheet.
 */
export class FakeEmbeddedChart {
  /**
   * @param {object} apiChart The EmbeddedChart object from Sheets API
   * @param {FakeSheet} sheet The parent sheet
   */
  constructor(apiChart, sheet) {
    this.__apiChart = apiChart;
    this.__sheet = sheet;

    const props = [
      "getAs",
      "getBlob",
      "getContainerInfo",
      "getOptions",
    ];
    props.forEach((f) => {
      this[f] = () => notYetImplemented(f);
    });
  }

  /**
   * Returns the ID of this chart.
   * @returns {number}
   */
  getChartId() {
    return this.__apiChart.chartId;
  }

  /**
   * Returns the ID of this chart (alias for getChartId).
   * @returns {string}
   */
  getId() {
    return this.getChartId().toString();
  }

  /**
   * Returns the type of this chart.
   * @returns {ChartType}
   */
  getType() {
    // Basic mapping from speculate chart type to GAS ChartType
    // This is a simplification.
    const spec = this.__apiChart.spec;
    if (spec.basicChart) return SpreadsheetApp.ChartType[spec.basicChart.chartType];
    if (spec.pieChart) return SpreadsheetApp.ChartType.PIE;
    if (spec.bubbleChart) return SpreadsheetApp.ChartType.BUBBLE;
    if (spec.candlestickChart) return SpreadsheetApp.ChartType.CANDLESTICK;
    if (spec.orgChart) return SpreadsheetApp.ChartType.ORG;
    if (spec.waterfallChart) return SpreadsheetApp.ChartType.WATERFALL;
    if (spec.treemapChart) return SpreadsheetApp.ChartType.TREE_MAP;
    if (spec.scorecardChart) return SpreadsheetApp.ChartType.SCORECARD;
    if (spec.histogramChart) return SpreadsheetApp.ChartType.HISTOGRAM;

    return null;
  }

  /**
   * Returns a builder to modify this chart.
   * @returns {FakeEmbeddedChartBuilder}
   */
  modify() {
    return newFakeEmbeddedChartBuilder(this.__sheet).setChartId(this.getChartId()).setApiChart(this.__apiChart);
  }

  /**
   * Deletes the chart from the sheet.
   */
  remove() {
    const request = {
      deleteEmbeddedObject: {
        objectId: this.getChartId(),
      },
    };
    batchUpdate({ spreadsheet: this.__sheet.getParent(), requests: [request] });
  }

  toString() {
    return "EmbeddedChart";
  }
}
