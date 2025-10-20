/**
* utilities to reuse
* @namespace GasBegUtils
*/
var GasBegUtils = (function (ns) {
  
  // utilities for drive
  ns.drive = {
    
    deleteFiles : function (name) {
      // we havent covered the Drive service yet, but we need it to remove files
      // we'll cover it in a later chapter
      var iter = DriveApp.getFilesByName(name);
      while (iter.hasNext()) {
        iter.next().setTrashed(true);
      }
    },
    
    deleteFolders : function (name) {
      // we havent covered the Drive service yet, but we need it to remove files
      // we'll cover it in a later chapter
      var iter = DriveApp.getFoldersByName(name);
      while (iter.hasNext()) {
        iter.next().setTrashed(true);
      }
    },
    
    getBlob : function (id) {
      return DriveApp.getFileById(id).getBlob();
    }
    
  };
  
  // utilites for urlfetchapp
  ns.fetch = {
    getImageFromUrl: function (url) {
      return UrlFetchApp.fetch(url).getBlob();
    }
  };
  
  // utilities for properties
  ns.properties = {
  
    setScript : function (key , value) {
      var store = PropertiesService.getScriptProperties();
      store.setProperty(key, JSON.stringify(value));
    },
    
    getScript : function (key) {
      var store = PropertiesService.getScriptProperties();
      var value = store.getProperty(key);
      return value ? JSON.parse(value) : null;
    }
    
    
  }
  
  // utilities for sheets
  ns.sheets = {
    
    /**
    * get the sheet as an array of objects using the header row as property names
    * @param {string} sheetId the id
    * @param {string} sheetName the sheet name
    * @return {[object]} the result
    */
    getAsObjects: function (sheetId , sheetName) {
      
      // get the values
      var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
      var values = sheet.getDataRange().getValues();
      
      // pull out the headers
      var heads = values.shift();
      
      // reduce to a an object per row
      return values.map (function (row) {
        return row.reduce (function (p,c) {
          p[heads[Object.keys(p).length]] = c;
          return p;
        },{})
      });
      
    }
  };
  
  // various useful utilities
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
    expBackoff: function ( callBack,options,attempts) {
      
      //sleepFor = Math.abs(options.sleepFor ||
      
      options = options || {};
      let optionsDefault = { 
        sleepFor:  750,
        maxAttempts:5,                  
        checker:errorQualifies,
        logAttempts:true
      }
      
      // mixin
      Object.keys(optionsDefault).forEach(function(k) {
        if (!options.hasOwnProperty(k)) {
          options[k] = optionsDefault[k];
        }
      });
      
      
      // for recursion
      attempts = attempts || 1;
      
      // make sure that the checker is really a function
      if (typeof(options.checker) !== "function") {
        throw ns.useful.errorStack("if you specify a checker it must be a function");
      }
      
      // check properly constructed
      if (!callBack || typeof(callBack) !== "function") {
        throw ns.useful.errorStack("you need to specify a function for rateLimitBackoff to execute");
      }
      
      function waitABit (theErr) {
        
        //give up?
        if (attempts > options.maxAttempts) {
          throw ns.useful.errorStack(theErr + " (tried backing off " + (attempts-1) + " times");
        }
        else {
          // wait for some amount of time based on how many times we've tried plus a small random bit to avoid races
          Utilities.sleep (
            Math.pow(2,attempts)*options.sleepFor + 
            Math.round(Math.random() * options.sleepFor)
          );
          
        }
      }
      
      // try to execute it
      try {
        var response = callBack(options, attempts);
        
        // maybe not throw an error but is problem nevertheless
        if (options.lookahead && options.lookahead(response,attempts)) {
          if(options.logAttempts) { 
            Logger.log("backoff lookahead:" + attempts);
          }
          waitABit('lookahead:');
          return ns.useful.expBackoff ( callBack, options, attempts+1) ;
          
        }
        return response;
      }
      
      // there was an error
      catch(err) {
        
        if(options.logAttempts) { 
          Logger.log("backoff " + attempts + ":" +err);
        }
        
        // failed due to rate limiting?
        if (options.checker(err)) {
          waitABit(err);
          return ns.useful.expBackoff ( callBack, options, attempts+1) ;
        }
        else {
          // some other error
          throw ns.useful.errorStack(err);
        }
      }
      
      function errorQualifies (errorText) {
        
        return ["Exception: Service invoked too many times",
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
                "Exception: Превышен лимит: DriveApp.",
                "Exception: Address unavailable"
               ]
        .some(function(e){
          return  errorText.toString().slice(0,e.length) == e  ;
        }) ;
        
      }
    },
    
    /**
    * get the stack
    * @param {Error} e the error
    * @return {string} the stack trace
    */
    errorStack : function  (e) {
      try {
        // throw a fake error
        throw new Error();  //x is undefined and will fail under use struct- ths will provoke an error so i can get the call stack
      }
      catch(err) {
        return 'Error:' + e + '\n' + err.stack.split('\n').slice(1).join('\n');
      }
    }
  };
  
  return ns;
  
})(GasBegUtils || {});




