import { initTests } from "./testinit.js";
import { maketss, wrapupTest, getSheetsPerformance, trasher } from "./testassist.js";

export const testSheetsChart = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section("Sheet.insertChart() and related methods", (t) => {
    const { sheet } = maketss("insert_chart_test", toTrash, fixes);

    // 1. Create a chart builder
    const builder = sheet.newChart();
    t.is(builder.toString().startsWith("com.google.apps.maestro.server.beans.trix.impl.ChartPropertyApiEmbeddedChartBuilder@"), true, "sheet.newChart() should return a builder with GAS-style toString()");

    // 2. Configure the chart
    const range1 = sheet.getRange("A1:A5");
    const range2 = sheet.getRange("B1:B5");
    builder.addRange(range1)
      .addRange(range2)
      .setChartType(Charts.ChartType.COLUMN)
      .setPosition(1, 4, 0, 0)
      .setOption("title", "Test Chart");

    // 3. Build the chart
    const chart = builder.build();
    t.is(chart.toString(), "EmbeddedChart", "builder.build() should return an EmbeddedChart");
    t.is(chart.modify().getChartType().toString(), "COLUMN", "chart type should be COLUMN");

    // 4. Insert the chart
    sheet.insertChart(chart);
    //console.log("Chart inserted.");

    // 5. Verify it exists
    const charts = sheet.getCharts();
    t.is(charts.length > 0, true, "sheet.getCharts() should contain the new chart");
    const insertedChart = charts.find(c => c.getOptions().get("title") === "Test Chart");
    t.is(!!insertedChart, true, "The inserted chart should be found in getCharts() by title");
    //console.log("Inserted chart ID:", insertedChart.getChartId());
    //console.log("Inserted chart API object:", JSON.stringify(insertedChart.__apiChart, null, 2));

    // 6. Update the chart (move it)
    const updatedChart = insertedChart.modify().setPosition(5, 5, 0, 0).build();
    //console.log("Updated chart ID:", updatedChart.getChartId());
    // Or update via sheet
    sheet.updateChart(updatedChart);
    console.log("Chart updated.");

    // 7. Remove the chart
    sheet.removeChart(insertedChart);
    const chartsAfterRemoval = sheet.getCharts();
    t.is(chartsAfterRemoval.some(c => c.getChartId() === insertedChart.getChartId()), false, "Chart should be removed");
    console.log("Chart removed.");
  });

  unit.section("EmbeddedChart.getContainerInfo()", (t) => {
    const { sheet } = maketss("container_info_test", toTrash, fixes);

    const chart = sheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(sheet.getRange("A1:A5"))
      .setPosition(2, 3, 10, 20)
      .build();

    const containerInfo = chart.getContainerInfo();
    t.is(containerInfo.toString(), "ContainerInfo", "containerInfo.toString() should be ContainerInfo");
    t.is(containerInfo.getAnchorRow(), 2, "getAnchorRow() should be 2");
    t.is(containerInfo.getAnchorColumn(), 3, "getAnchorColumn() should be 3");
    t.is(containerInfo.getOffsetX(), 10, "getOffsetX() should be 10");
    t.is(containerInfo.getOffsetY(), 20, "getOffsetY() should be 20");
  });

  unit.section("EmbeddedChart.getRanges()", (t) => {
    const { sheet } = maketss("chart_ranges_test", toTrash, fixes);
    const range1 = sheet.getRange("A1:A5");
    const range2 = sheet.getRange("B1:B5");
    
    const chart = sheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(range1)
      .addRange(range2)
      .build();

    const ranges = chart.getRanges();
    t.is(ranges.length, 2, "chart should have 2 ranges");
    // Depending on how addRange works internally, we'll verify the notations.
    // In our implementation of addRange, the first goes to domain, the second to series.
    t.is(ranges.some(r => r.getA1Notation() === "A1:A5"), true, "range A1:A5 should be present");
    t.is(ranges.some(r => r.getA1Notation() === "B1:B5"), true, "range B1:B5 should be present");
  });


  // running standalone
  if (!pack) {
    if (SpreadsheetApp.isFake)
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
};

wrapupTest(testSheetsChart);

function runTestSheetsChart() {
  testSheetsChart();
}