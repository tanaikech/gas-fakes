function testItunesData () {
  Logger.log(getItunesData('Thriller'));
}
/**
* from the itunes sheet, get all the rows that are the given genre
* and make an array of objects
* @param {string} [genre] the genre to get or all if missing
* @return {[object]} the data
*/
function getItunesData (genre) {

  // use the sean connery spreadsheet
  var SHEET_ID = '1JiDI-BN3cpjSyAvKPJ_7zRsrEbF0l02rUF6BisjLbqU';
  var SHEET_NAME = "sean connery";
  
  return GasBegUtils.sheets.getAsObjects(SHEET_ID , SHEET_NAME)
  .filter(function(d) {
    return !genre || d.primaryGenreName === genre;
  })
  
  
}

