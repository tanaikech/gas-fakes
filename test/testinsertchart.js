import { initTests } from "./testinit.js";
import { maketss } from "./testassist.js";

export const testInsertChart = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section("Sheet.insertChart() and related methods", (t) => {
    const { sheet } = maketss("insert_chart_test", toTrash, fixes);

    // 1. Create a chart builder
    const builder = sheet.newChart();
    t.is(builder.toString(), "EmbeddedChartBuilder", "sheet.newChart() should return a builder");

    // 2. Configure the chart
    const range1 = sheet.getRange("A1:A5");
    const range2 = sheet.getRange("B1:B5");
    builder.addRange(range1)
      .addRange(range2)
      .setChartType(SpreadsheetApp.ChartType.COLUMN)
      .setPosition(1, 4, 0, 0)
      .setTitle("Test Chart");

    // 3. Build the chart
    const chart = builder.build();
    t.is(chart.toString(), "EmbeddedChart", "builder.build() should return an EmbeddedChart");
    t.is(chart.getType().toString(), "COLUMN", "chart type should be COLUMN");

    // 4. Insert the chart
    sheet.insertChart(chart);
    console.log("Chart inserted.");

    // 5. Verify it exists
    const charts = sheet.getCharts();
    t.is(charts.length > 0, true, "sheet.getCharts() should contain the new chart");
    const insertedChart = charts.find(c => c.__apiChart.spec.title === "Test Chart");
    t.is(!!insertedChart, true, "The inserted chart should be found in getCharts() by title");
    console.log("Inserted chart ID:", insertedChart.getChartId());
    console.log("Inserted chart API object:", JSON.stringify(insertedChart.__apiChart, null, 2));

    // 6. Update the chart (move it)
    const updatedChart = insertedChart.modify().setPosition(5, 5, 0, 0).build();
    console.log("Updated chart ID:", updatedChart.getChartId());
    // Or update via sheet
    sheet.updateChart(updatedChart);
    console.log("Chart updated.");

    // 7. Remove the chart
    sheet.removeChart(insertedChart);
    const chartsAfterRemoval = sheet.getCharts();
    t.is(chartsAfterRemoval.some(c => c.getChartId() === insertedChart.getChartId()), false, "Chart should be removed");
    console.log("Chart removed.");
  });
};

// Run standalone if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testInsertChart();
}
