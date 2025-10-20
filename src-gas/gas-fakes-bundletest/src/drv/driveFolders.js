var TEMP_DRIVE_FOLDER = "----temp-folder-can-be-deleted";
var TEMP_DRIVE_FOLDER_SUB = TEMP_DRIVE_FOLDER + 'sub';

function driveFolders() {
  

  // get all the folders on my drive
  var folderIterator = DriveApp.getFolders();

  // loop through them
  var count = 0;
  while (folderIterator.hasNext() && count < 20) {
    count ++;
    folderIterator.next();
  }

  // how many are there
  Logger.log('at least ' + count + ' folders');

  // add a new folder
  var folder = DriveApp.createFolder(TEMP_DRIVE_FOLDER);
  
  // get the folder
  Logger.log(folder.getName());
  Logger.log(folder.getId());
  

  // create a folder in a folder
  var sub = folder.createFolder(TEMP_DRIVE_FOLDER_SUB);
  
  // get the folder
  Logger.log(sub.getName());
  Logger.log(sub.getId());
  
  // create another
  folder.createFolder(TEMP_DRIVE_FOLDER_SUB);
    
  
}
