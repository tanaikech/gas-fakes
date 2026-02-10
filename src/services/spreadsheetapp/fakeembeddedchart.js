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
