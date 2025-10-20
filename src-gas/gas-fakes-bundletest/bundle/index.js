import '@mcpher/gas-fakes';// in here goes any code you'd like to execute before your gas code

// I'm going to use the sandbox here just for info
// turn on the sandbox
ScriptApp.__behavior.sandboxMode = true

// add any whitelist items - this is the id of a file it's okay to access
ScriptApp.__behavior.addIdWhitelist(ScriptApp.__behavior.newIdWhitelistItem('1JiDI-BN3cpjSyAvKPJ_7zRsrEbF0l02rUF6BisjLbqU'));
function main() {
  driveFolders();
  driveFiles();
  driveSearch();
  testItunesData();
}
function testItunesData() {
  Logger.log(getItunesData("Thriller"));
}
function getItunesData(genre) {
  var SHEET_ID = "1JiDI-BN3cpjSyAvKPJ_7zRsrEbF0l02rUF6BisjLbqU";
  var SHEET_NAME = "sean connery";
  return GasBegUtils.sheets.getAsObjects(SHEET_ID, SHEET_NAME).filter(function(d) {
    return !genre || d.primaryGenreName === genre;
  });
}
var TEMP_IMAGE_FILE = TEMP_DRIVE_FILE + "-image";
function exerciseSolution() {
  var backoff = GasBegUtils.useful.expBackoff;
  GasBegUtils.drive.deleteFolders(TEMP_DRIVE_FOLDER);
  var data = getItunesData();
  var row = Math.round(Math.random() * (data.length - 1));
  var blob = GasBegUtils.fetch.getImageFromUrl(data[row].artworkUrl100);
  blob.setName(TEMP_IMAGE_FILE);
  var folder = backoff(function() {
    return DriveApp.createFolder(TEMP_DRIVE_FOLDER);
  });
  var file = backoff(function() {
    return folder.createFile(blob);
  });
}
var GasBegUtils = (function(ns) {
  ns.drive = {
    deleteFiles: function(name) {
      var iter = DriveApp.getFilesByName(name);
      while (iter.hasNext()) {
        iter.next().setTrashed(true);
      }
    },
    deleteFolders: function(name) {
      var iter = DriveApp.getFoldersByName(name);
      while (iter.hasNext()) {
        iter.next().setTrashed(true);
      }
    },
    getBlob: function(id) {
      return DriveApp.getFileById(id).getBlob();
    }
  };
  ns.fetch = {
    getImageFromUrl: function(url) {
      return UrlFetchApp.fetch(url).getBlob();
    }
  };
  ns.properties = {
    setScript: function(key, value) {
      var store = PropertiesService.getScriptProperties();
      store.setProperty(key, JSON.stringify(value));
    },
    getScript: function(key) {
      var store = PropertiesService.getScriptProperties();
      var value = store.getProperty(key);
      return value ? JSON.parse(value) : null;
    }
  };
  ns.sheets = {
    /**
    * get the sheet as an array of objects using the header row as property names
    * @param {string} sheetId the id
    * @param {string} sheetName the sheet name
    * @return {[object]} the result
    */
    getAsObjects: function(sheetId, sheetName) {
      var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
      var values = sheet.getDataRange().getValues();
      var heads = values.shift();
      return values.map(function(row) {
        return row.reduce(function(p, c) {
          p[heads[Object.keys(p).length]] = c;
          return p;
        }, {});
      });
    }
  };
  ns.useful = {
    /**
    * recursive rateLimitExpBackoff()
    * @param {function} callBack some function to call that might return rate limit exception
    * @param {object} options properties as below
    * @param {number} [attempts=1] optional the attempt number of this instance - usually only used recursively and not user supplied
    * @param {number} [options.sleepFor=750] optional amount of time to sleep for on the first failure in missliseconds
    * @param {number} [options.maxAttempts=5] optional maximum number of amounts to try
    * @param {boolean} [options.logAttempts=true] log re-attempts to Logger
    * @param {function} [options.checker] function to check whether error is retryable
    * @param {function} [options.lookahead] function to check response and force retry (passes response,attemprs)
    * @return {*} results of the callback 
    */
    expBackoff: function(callBack, options, attempts) {
      options = options || {};
      let optionsDefault = {
        sleepFor: 750,
        maxAttempts: 5,
        checker: errorQualifies,
        logAttempts: true
      };
      Object.keys(optionsDefault).forEach(function(k) {
        if (!options.hasOwnProperty(k)) {
          options[k] = optionsDefault[k];
        }
      });
      attempts = attempts || 1;
      if (typeof options.checker !== "function") {
        throw ns.useful.errorStack("if you specify a checker it must be a function");
      }
      if (!callBack || typeof callBack !== "function") {
        throw ns.useful.errorStack("you need to specify a function for rateLimitBackoff to execute");
      }
      function waitABit(theErr) {
        if (attempts > options.maxAttempts) {
          throw ns.useful.errorStack(theErr + " (tried backing off " + (attempts - 1) + " times");
        } else {
          Utilities.sleep(
            Math.pow(2, attempts) * options.sleepFor + Math.round(Math.random() * options.sleepFor)
          );
        }
      }
      try {
        var response = callBack(options, attempts);
        if (options.lookahead && options.lookahead(response, attempts)) {
          if (options.logAttempts) {
            Logger.log("backoff lookahead:" + attempts);
          }
          waitABit("lookahead:");
          return ns.useful.expBackoff(callBack, options, attempts + 1);
        }
        return response;
      } catch (err) {
        if (options.logAttempts) {
          Logger.log("backoff " + attempts + ":" + err);
        }
        if (options.checker(err)) {
          waitABit(err);
          return ns.useful.expBackoff(callBack, options, attempts + 1);
        } else {
          throw ns.useful.errorStack(err);
        }
      }
      function errorQualifies(errorText) {
        return [
          "Exception: Service invoked too many times",
          "Exception: Rate Limit Exceeded",
          "Exception: Quota Error: User Rate Limit Exceeded",
          "Service error:",
          "Exception: Service error:",
          "Exception: User rate limit exceeded",
          "Exception: Internal error. Please try again.",
          "Exception: Cannot execute AddColumn because another task",
          "Service invoked too many times in a short time:",
          "Exception: Internal error.",
          "User Rate Limit Exceeded",
          "Exception: \u041F\u0440\u0435\u0432\u044B\u0448\u0435\u043D \u043B\u0438\u043C\u0438\u0442: DriveApp.",
          "Exception: Address unavailable"
        ].some(function(e) {
          return errorText.toString().slice(0, e.length) == e;
        });
      }
    },
    /**
    * get the stack
    * @param {Error} e the error
    * @return {string} the stack trace
    */
    errorStack: function(e) {
      try {
        throw new Error();
      } catch (err) {
        return "Error:" + e + "\n" + err.stack.split("\n").slice(1).join("\n");
      }
    }
  };
  return ns;
})(GasBegUtils || {});
function driveSearch() {
  var backoff = GasBegUtils.useful.expBackoff;
  var folder = backoff(function() {
    return DriveApp.createFolder(TEMP_DRIVE_FOLDER);
  });
  var file = folder.createFile(TEMP_DRIVE_FILE, "here is some text data", MimeType.PDF);
  var fileIterator = DriveApp.searchFiles(
    "title contains '----temp-file-can-be-deleted' and mimeType contains 'pdf'"
  );
  while (fileIterator.hasNext()) {
    Logger.log(fileIterator.next().getName());
  }
}
var TEMP_DRIVE_FOLDER = "----temp-folder-can-be-deleted";
var TEMP_DRIVE_FOLDER_SUB = TEMP_DRIVE_FOLDER + "sub";
function driveFolders() {
  var folderIterator = DriveApp.getFolders();
  var count = 0;
  while (folderIterator.hasNext() && count < 20) {
    count++;
    folderIterator.next();
  }
  Logger.log("at least " + count + " folders");
  var folder = DriveApp.createFolder(TEMP_DRIVE_FOLDER);
  Logger.log(folder.getName());
  Logger.log(folder.getId());
  var sub = folder.createFolder(TEMP_DRIVE_FOLDER_SUB);
  Logger.log(sub.getName());
  Logger.log(sub.getId());
  folder.createFolder(TEMP_DRIVE_FOLDER_SUB);
}
var TEMP_DRIVE_FILE = "----temp-file-can-be-deleted";
function driveFiles() {
  var backoff = GasBegUtils.useful.expBackoff;
  var fileIterator = DriveApp.getFiles();
  var count = 0;
  while (fileIterator.hasNext() && count < 50) {
    count++;
    fileIterator.next();
  }
  Logger.log("at least " + count + " files");
  var folder = DriveApp.createFolder(TEMP_DRIVE_FOLDER);
  var file = folder.createFile(TEMP_DRIVE_FILE, "here is some text data");
  Logger.log(file.getName());
  Logger.log(file.getId());
  Logger.log(file.getMimeType());
  var file = folder.createFile(TEMP_DRIVE_FILE, "here is some text data", MimeType.PDF);
  Logger.log(file.getMimeType());
  var blob = file.getBlob();
  Logger.log(blob.getContentType());
  Logger.log(blob.getDataAsString());
  var file = folder.createFile(blob);
  Logger.log(file.getParents().next().getName());
  Logger.log(file.getParents().next().getFiles().next().getName());
  var fileIterator = backoff(function() {
    return folder.getFiles();
  });
}
// on the ide this is script you would manually run
// on node we can immediately execute it
main()

// clean up any created files if required to do so
// this will delete any files you created during this session
ScriptApp.__behavior.trash ()
