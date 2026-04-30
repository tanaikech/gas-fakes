import { newFakeGasenum } from "@mcpher/fake-gasenum";

export const ChartType = newFakeGasenum([
  "AREA", //    Enum    Area chart.
  "BAR", //     Enum    Bar chart.
  "COLUMN", //  Enum    Column chart.
  "COMBO", //   Enum    Combo chart.
  "HISTOGRAM", //       Enum    Histogram chart.
  "LINE", //    Enum    Line chart.
  "PIE", //     Enum    Pie chart.
  "SCATTER", // Enum    Scatter chart.
  "STEPPED_AREA", //    Enum    Stepped area chart.
  "WATERFALL", //       Enum    Waterfall chart.
  "SCORECARD", //       Enum    Scorecard chart.
  "RADAR", //   Enum    Radar chart.
  "GAUGE", //   Enum    Gauge chart.
  "ORG", //     Enum    Org chart.
  "TIMELINE", //        Enum    Timeline chart.
  "TREE_MAP", //        Enum    Tree map chart.
  "TABLE", //   Enum    Table chart.
  "CANDLESTICK", //     Enum    Candlestick chart.
  "GEOMAP", //  Enum    Geo map chart.
  "BUBBLE", //  Enum    Bubble chart.
]);

export const ChartHiddenDimensionStrategy = newFakeGasenum([
  "IGNORE_BOTH", //     Enum    Ignore both hidden rows and columns.
  "IGNORE_COLUMNS", //  Enum    Ignore hidden columns.
  "IGNORE_ROWS", //     Enum    Ignore hidden rows.
  "SHOW_ALL", //        Enum    Show all hidden rows and columns.
]);

export const ChartMergeStrategy = newFakeGasenum([
  "MERGE_COLUMNS", //   Enum    Merge columns across multiple ranges.
  "MERGE_ROWS", //      Enum    Merge rows across multiple ranges.
]);

export const CurveStyle = newFakeGasenum([
  "NORMAL", //  Enum    Straight lines without curve.
  "SMOOTH", //  Enum    Smooth curves.
]);

export const PointStyle = newFakeGasenum([
  "NONE", //    Enum    No point style.
  "TINY", //    Enum    Tiny points.
  "MEDIUM", //  Enum    Medium points.
  "LARGE", //   Enum    Large points.
  "HUGE", //    Enum    Huge points.
]);

export const Position = newFakeGasenum([
  "TOP", //     Enum    Position at the top.
  "BOTTOM", //  Enum    Position at the bottom.
  "RIGHT", //   Enum    Position on the right.
  "LEFT", //    Enum    Position on the left.
  "NONE", //    Enum    No position.
]);
