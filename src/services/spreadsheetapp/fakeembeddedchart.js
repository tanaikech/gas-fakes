import { Proxies } from "../../support/proxies.js";
import { notYetImplemented, signatureArgs } from "../../support/helpers.js";
import { batchUpdate } from "./sheetrangehelpers.js";
import { newFakeEmbeddedChartBuilder } from "./fakeembeddedchartbuilder.js";
import { newFakeContainerInfo } from "./fakecontainerinfo.js";

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
    ];
    props.forEach((f) => {
      this[f] = () => notYetImplemented(f);
    });
  }

  /**
   * Returns information about where the chart is positioned within a sheet.
   * @returns {FakeContainerInfo}
   */
  getContainerInfo() {
    return newFakeContainerInfo(this.__apiChart.position?.overlayPosition);
  }

  /**
   * Returns the ranges that this chart uses for its source data.
   * @returns {FakeSheetRange[]}
   */
  getRanges() {
    const { nargs, matchThrow } = signatureArgs(arguments, "EmbeddedChart.getRanges");
    if (nargs !== 0) matchThrow();

    const ranges = [];
    const spec = this.__apiChart.spec;

    const extractRanges = (chartData) => {
      if (chartData?.sourceRange?.sources) {
        chartData.sourceRange.sources.forEach((gridRange) => {
          const sheet = this.__sheet.getParent().getSheetById(gridRange.sheetId);
          if (sheet) {
            const numRows = (gridRange.endRowIndex !== undefined ? gridRange.endRowIndex : sheet.getMaxRows()) - gridRange.startRowIndex;
            const numCols = (gridRange.endColumnIndex !== undefined ? gridRange.endColumnIndex : sheet.getMaxColumns()) - gridRange.startColumnIndex;
            ranges.push(
              sheet.getRange(
                gridRange.startRowIndex + 1,
                gridRange.startColumnIndex + 1,
                numRows,
                numCols
              )
            );
          }
        });
      }
    };

    if (spec.basicChart) {
      spec.basicChart.domains?.forEach((d) => extractRanges(d.domain));
      spec.basicChart.series?.forEach((s) => extractRanges(s.series));
    }
    if (spec.pieChart) {
      extractRanges(spec.pieChart.domain);
      spec.pieChart.series?.forEach((s) => extractRanges(s.series));
    }
    if (spec.bubbleChart) {
      extractRanges(spec.bubbleChart.domain);
      extractRanges(spec.bubbleChart.series);
      extractRanges(spec.bubbleChart.ids);
      extractRanges(spec.bubbleChart.labels);
      extractRanges(spec.bubbleChart.sizes);
    }
    if (spec.candlestickChart) {
      spec.candlestickChart.data?.forEach((d) => {
        extractRanges(d.highSeries?.series);
        extractRanges(d.lowSeries?.series);
        extractRanges(d.openSeries?.series);
        extractRanges(d.closeSeries?.series);
      });
    }
    if (spec.histogramChart) {
      spec.histogramChart.series?.forEach((s) => extractRanges(s.data));
    }
    if (spec.orgChart) {
      extractRanges(spec.orgChart.labels);
      extractRanges(spec.orgChart.parentLabels);
      extractRanges(spec.orgChart.tooltips);
    }
    if (spec.scorecardChart) {
      extractRanges(spec.scorecardChart.keyValueData);
      extractRanges(spec.scorecardChart.baselineValueData);
    }
    if (spec.treemapChart) {
      extractRanges(spec.treemapChart.labels);
      extractRanges(spec.treemapChart.parentLabels);
      extractRanges(spec.treemapChart.sizeData);
      extractRanges(spec.treemapChart.colorData);
    }
    if (spec.waterfallChart) {
      extractRanges(spec.waterfallChart.domain?.domain);
      spec.waterfallChart.series?.forEach((s) => extractRanges(s.data));
    }

    return ranges;
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
   * Returns the options of this chart.
   * @returns {object}
   */
  getOptions() {
    return {
      get: (key) => {
        if (key === "title") return this.__apiChart.spec.title;
        return this.__apiChart.spec.basicChart?.options?.[key];
      }
    };
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
