import "../../main.js";

ScriptApp.__behavior.sandBoxMode = true;
const spreadsheet = SpreadsheetApp.create("sample");
const sheet = spreadsheet.getSheets()[0];
sheet.getRange("A1:B5").setValues([["a", 1], ["b", 2], ["c", 3], ["d", 4], ["e", 5]]);

const builder = sheet.newChart();
const range1 = sheet.getRange("A1:A5");
const range2 = sheet.getRange("B1:B5");
builder.addRange(range1)
  .addRange(range2)
  .setChartType(SpreadsheetApp.ChartType.COLUMN)
  .setPosition(1, 4, 0, 0)
  .setTitle("Test Chart");
const chart = builder.build();
sheet.insertChart(chart);
console.log("Chart inserted.");
const charts = sheet.getCharts();
const insertedChart = charts.find(c => c.__apiChart.spec.title === "Test Chart");
console.log("Inserted chart ID:", insertedChart.getChartId());

const updatedChart = insertedChart.modify().setPosition(5, 5, 0, 0).build();
console.log("Updated chart ID:", updatedChart.getChartId());
sheet.updateChart(updatedChart);
console.log("Chart updated.");

sheet.removeChart(insertedChart);
const chartsAfterRemoval = sheet.getCharts();
console.log("Chart removed.");

ScriptApp.__behavior.trash();
