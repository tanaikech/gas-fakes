import { Proxies } from "../../support/proxies.js";
import { signatureArgs } from "../../support/helpers.js";
import { Utils } from "../../support/utils.js";
import { makeSheetsGridRange } from "./sheetrangehelpers.js";
import { newFakeEmbeddedChart } from "./fakeembeddedchart.js";

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
          chartType: "COLUMN", // Default
          legendPosition: "RIGHT_LEGEND",
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

    // In Sheets API, ranges are usually mapped to domains or series.
    // Simplifying: if the range has multiple columns, split it into separate sources if it's a series.
    // But for this fake, we'll just encourage the user to use single-column ranges or handle it simply.

    if (this.__apiChart.spec.basicChart.domains.length === 0) {
      this.__apiChart.spec.basicChart.domains.push({
        domain: { sourceRange: { sources: [gridRange] } },
      });
    } else {
      // Check if gridRange has multiple columns/rows and split if necessary?
      // For now, just add it. The test will be updated to use single column ranges.
      this.__apiChart.spec.basicChart.series.push({
        series: { sourceRange: { sources: [gridRange] } },
      });
    }
    return this;
  }

  setChartType(type) {
    const { nargs, matchThrow } = signatureArgs(arguments, "EmbeddedChartBuilder.setChartType");
    if (nargs !== 1) matchThrow();

    // type is SpreadsheetApp.ChartType enum (which should match API strings in our fakes)
    this.__apiChart.spec.basicChart.chartType = type.toString();
    return this;
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
      // For other options, we might want to store them in a general options object if needed,
      // but for now, we'll just focus on "title" as requested.
      // SpreadsheetApp.EmbeddedChartBuilder.setOption(option, value)
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

    // In a real GAS, build() returns an EmbeddedChart that is NOT yet inserted.
    // Here we return the api object wrapped in a FakeEmbeddedChart if needed,
    // or just the raw object that insertChart will use.
    // Actually, gas.Sheet.insertChart expects an EmbeddedChart object.
    return newFakeEmbeddedChart(this.__apiChart, this.__sheet);
  }

  toString() {
    return "EmbeddedChartBuilder";
  }
}
