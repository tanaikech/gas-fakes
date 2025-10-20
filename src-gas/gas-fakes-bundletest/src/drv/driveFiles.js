var TEMP_DRIVE_FILE = "----temp-file-can-be-deleted";

function driveFiles() {
  
  var backoff = GasBegUtils.useful.expBackoff;

  // get all the files on my drive
  var fileIterator = DriveApp.getFiles();

  // loop through them
  var count = 0;
  // there are too many so just count the first 50
  while (fileIterator.hasNext() && count < 50) {
    count ++;
    fileIterator.next();
  }

  // how many are there
  Logger.log('at least ' + count + ' files');
  

  // add a new folder
  var folder = DriveApp.createFolder(TEMP_DRIVE_FOLDER);
  

  // add a new file with no mimetype
  var file = folder.createFile(TEMP_DRIVE_FILE, 'here is some text data');
  

  // get the file
  Logger.log(file.getName());
  Logger.log(file.getId());
  Logger.log(file.getMimeType());
  

  // now create one with a specific mimetype
  var file = folder.createFile(TEMP_DRIVE_FILE,'here is some text data',MimeType.PDF);
  Logger.log(file.getMimeType());
  

  // getting a file returns a blob
  var blob = file.getBlob();
  Logger.log(blob.getContentType());
  Logger.log(blob.getDataAsString());
  

  // blobs can be written to a file
  var file = folder.createFile(blob);
  

  // the first parent
  Logger.log(file.getParents().next().getName());
  // the first child
  Logger.log(file.getParents().next().getFiles().next().getName());
  

  // we should really be using backoff
  var fileIterator = backoff(function () {
    return folder.getFiles();
  });
  

  
}
