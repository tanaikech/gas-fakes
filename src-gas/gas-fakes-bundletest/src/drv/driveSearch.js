// more info on search parameters
// https://developers.google.com/drive/v3/web/search-parameters
function driveSearch() {
  
  var backoff = GasBegUtils.useful.expBackoff;

  // add a new folder
  var folder = backoff(function () {
    return DriveApp.createFolder(TEMP_DRIVE_FOLDER);
  });
  
  // add a new file 
  var file = folder.createFile(TEMP_DRIVE_FILE, 'here is some text data',MimeType.PDF);

  // search files
  var fileIterator = DriveApp.searchFiles(
    "title contains '----temp-file-can-be-deleted' and mimeType contains 'pdf'");

  while (fileIterator.hasNext()) {
    Logger.log(fileIterator.next().getName());
  }
}
