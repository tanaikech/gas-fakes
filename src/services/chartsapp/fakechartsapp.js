import { Proxies } from "../../support/proxies.js";
import { notYetImplemented } from "../../support/helpers.js";
import * as Enums from "../enums/chartsenums.js";

/**
 * create a new FakeChartsApp instance
 * @param  {...any} args
 * @returns {FakeChartsApp}
 */
export const newFakeChartsApp = (...args) => {
  return Proxies.guard(new FakeChartsApp(...args));
};

/**
 * basic fake FakeChartsApp
 * @class FakeChartsApp
 * @returns {FakeChartsApp}
 */
export class FakeChartsApp {
  constructor() {
    const enumProps = [
      "ChartType", //	ChartType	An enumeration of the possible chart types.
    ];

    // import all known enums as props of chartsapp
    enumProps.forEach((f) => {
      this[f] = Enums[f];
    });

    const props = [
      "newAreaChart",
      "newBarChart",
      "newColumnChart",
      "newComboChart",
      "newHistogramChart",
      "newLineChart",
      "newPieChart",
      "newScatterChart",
      "newSteppedAreaChart",
      "newWaterfallChart",
      "newScorecardChart",
      "newRadarChart",
      "newGaugeChart",
      "newOrgChart",
      "newTimelineChart",
      "newTreeMapChart",
      "newTableChart",
      "newCandlestickChart",
      "newGeoMapChart",
      "newBubbleChart",
      "newDataTable",
      "newTextStyle",
    ];

    props.forEach((f) => {
      this[f] = () => {
        return notYetImplemented(f);
      };
    });
  }
  toString() {
    return "Charts";
  }
}
