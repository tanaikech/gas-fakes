// get data from the Itunes spreadsheet, using code from previous lessons 
// you'll need - getItunesData
// pick a random image from the artworkUrl100 column
// tidy up using folder names below
// create a folder using the TEMP_DRIVE_FOLDER constand
// create a file using the TEMP_IMAGE_FILE constant
// get the blob of the image - use GasBegUtils.fetch.getImageFromUrl
// set its name
// check whats on Drive
var TEMP_IMAGE_FILE = TEMP_DRIVE_FILE + '-image';
function exerciseSolution() {
  
  var backoff = GasBegUtils.useful.expBackoff;

  // clean up previous folders & files
  GasBegUtils.drive.deleteFolders (TEMP_DRIVE_FOLDER);

  // get data from Itunes sheet
  var data = getItunesData();
  
  // pick a random row
  var row = Math.round(Math.random() * (data.length-1));
  
  // get the image
  var blob = GasBegUtils.fetch.getImageFromUrl(data[row].artworkUrl100);
  
  // set the name
  blob.setName (TEMP_IMAGE_FILE);
  
  // create the folder
  var folder = backoff (function () {
    return DriveApp.createFolder(TEMP_DRIVE_FOLDER);
  });
  
  // create the image file
  var file = backoff (function () {
    return folder.createFile(blob);
  });
  
  // all done
}

