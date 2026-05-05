
import '@mcpher/gas-fakes';

function reproduceChartIssue() {
  const ss = SpreadsheetApp.create('Test Chart');
  const sheet = ss.getActiveSheet();
  
  // Sample data: Week, Hours
  const data = [
    ['Week', 'Hours'],
    ['Week 1', 5],
    ['Week 2', 8],
    ['Week 3', 3],
    ['Week 4', 10]
  ];
  
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  
  // The "Wrong" way (multi-column range) - might have been what failed
  // const chartWrong = sheet.newChart()
  //   .setChartType(Charts.ChartType.BAR)
  //   .addRange(sheet.getRange("A1:B5")) 
  //   .setPosition(1, 4, 0, 0)
  //   .build();
  
  // The "Correct" way according to our parity rules
  const chart = sheet.newChart()
    .asBarChart()
    .addRange(sheet.getRange("A2:A5")) // Domain
    .addRange(sheet.getRange("B2:B5")) // Series
    .setNumHeaders(0)
    .setXAxisTitle('Week')
    .setYAxisTitle('Hours')
    .setPosition(1, 4, 0, 0)
    .build();
    
  sheet.insertChart(chart);
  console.log('Chart created successfully');
}

reproduceChartIssue();
