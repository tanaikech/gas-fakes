function findHighestAirport() {
  var sheet = SpreadsheetApp.openById('15MDlPLVH4IhnY2KJBWYGANoyyoUFaxeWVDOe-pupKxs').getSheets()[0];
  var data = sheet.getDataRange().getValues();
  
  // Remove header row
  var headers = data.shift();
  
  var highestAirport = data.reduce(function(prev, current) {
    var prevElevation = parseFloat(prev[3]) || 0;
    var currentElevation = parseFloat(current[3]) || 0;
    return (prevElevation > currentElevation) ? prev : current;
  });
  
  console.log(highestAirport[0]);
}
findHighestAirport();