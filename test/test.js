
// all these imports 
// this is loaded by npm, but is a library on Apps Script side
import { Exports as unitExports } from '@mcpher/unit'
import is from '@sindresorhus/is';


// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import '../main.js'
import { Utils } from '../src/support/utils.js';
const testFakes = async () => {

  // on node this will have come from the imports that get stripped when mocing to gas
  // on apps script, you'll have a gas only imports file that aliases 
  // the exports from any gas libraries required
  const unit = unitExports.newUnit({
    showErrorsOnly: true
  })

  // apps script can't get from parent without access to the getresource of the parent
  if (unitExports.CodeLocator.isGas) {
    // because a GAS library cant get its caller's code
    unitExports.CodeLocator.setGetResource(ScriptApp.getResource)
    // optional - generally not needed - only necessary if you are using multiple libraries and some file sahre the same ID
    unitExports.CodeLocator.setScriptId(ScriptApp.getScriptId())
  }

  // these are som fixtures to test applicable to my own drive
  const fixes = {
    MIN_FOLDERS_ROOT: 110,
    TEST_FOLDER_NAME: "math",
    TEST_FOLDER_FILES: 3,
    SKIP_SINGLE_PARENT: true,
    TEST_FOLDER_ID: '1Zww9oCTFR7zYcUYXxd70yQr3sw6VdLG-',
    TEXT_FILE_ID: '1142Vn7W-pGl5nWLpUSkpOB82JDiz9R6p',
    TEXT_FILE_CONTENT: 'foo is not bar',
    BLOB_NAME: 'foo.txt',
    BLOB_TYPE: 'text/plain',
    TEST_SHEET_ID: '1DlKpVVYCrCPNfRbGsz6N_K3oPTgdC9gQIKi0aNb42uI',
    TEST_SHEET_NAME: 'sharedlibraries',
    EMAIL: 'bruce@mcpher.com',
    TIMEZONE: 'Europe/London',
    LOCALE: 'en_US'
  }


  unit.section("session", t => {
    t.is(Session.getActiveUser().toString(), fixes.EMAIL)
    t.is(Session.getActiveUser().getEmail(), fixes.EMAIL)
    t.is(Session.getEffectiveUser().getEmail(), fixes.EMAIL)
    t.is(Session.getActiveUserLocale(), fixes.LOCALE)
    t.is(Session.getScriptTimeZone(), fixes.TIMEZONE)
    t.true(is.nonEmptyString(Session.getTemporaryActiveUserKey()))
  }, {
    skip: false
  })

  unit.section('utilities', t => {
    t.true(is.nonEmptyString(Utilities.getUuid()))
  })

  unit.section('all about blobs', t => {
    const blob = Utilities.newBlob(fixes.TEXT_FILE_CONTENT)
    t.is(blob.getName(), null)
    t.is(blob.getContentType(), fixes.BLOB_TYPE)
    t.is(blob.getDataAsString(), fixes.TEXT_FILE_CONTENT)
    const bytes = blob.getBytes()
    const blob2 = Utilities.newBlob(bytes, fixes.BLOB_TYPE, fixes.BLOB_NAME)
    t.is(blob2.getName(), fixes.BLOB_NAME)
    t.is(blob2.getContentType(), fixes.BLOB_TYPE)
    t.is(blob2.getDataAsString(), fixes.TEXT_FILE_CONTENT)
    t.deepEqual(blob2.getBytes(), bytes)
    const blob3 = blob.copyBlob()
    blob3.setName(blob2.getName())
    t.is(blob3.getName(), fixes.BLOB_NAME)
    t.is(blob3.setContentTypeFromExtension().getContentType(), fixes.BLOB_TYPE)
    const bytes3 = bytes.slice().reverse()
    t.deepEqual(blob3.setBytes(bytes3).getBytes(), bytes3)
    t.is(blob3.setDataFromString(fixes.TEXT_FILE_CONTENT).getDataAsString(),
      blob2.getDataAsString())
    t.false(blob3.isGoogleType())
  })

  unit.section("properties store", t => {
    const ps = {}
    const testKey = 't'

    t.is(typeof PropertiesService.getUserProperties, 'function')
    ps.up = PropertiesService.getUserProperties()
    t.is(ps.up.type, "USER", {
      skip: !ScriptApp.isFake
    })

    t.is(typeof PropertiesService.getScriptProperties, 'function')
    ps.sp = PropertiesService.getScriptProperties()
    t.is(ps.sp.type, "SCRIPT", {
      skip: !ScriptApp.isFake
    })

    t.is(typeof PropertiesService.getDocumentProperties, 'function')
    ps.dp = PropertiesService.getDocumentProperties()
    if (ps.dp) {
      t.is(ps.dp.type, "DOCUMENT", {
        skip: !ScriptApp.isFake
      })
    }

    const p = ['dp', 'sp', 'up']
    p.forEach(f => {
      const testValue = f + 'p'
      if (ps[f]) {
        t.is(ps[f].setProperty(testKey, testValue).getProperty(testKey), testValue)
        // in apps script delete returns the object for chaining
        t.is(ps[f].deleteProperty(testKey).getProperty(testKey), null)
      }
    })


  })


  unit.section("cache store", t => {
    const ps = {}
    const testKey = 't'

    t.is(typeof CacheService.getUserCache, 'function')
    ps.up = CacheService.getUserCache()
    t.is(ps.up.type, "USER", {
      skip: !ScriptApp.isFake
    })

    t.is(typeof CacheService.getScriptCache, 'function')
    ps.sp = CacheService.getScriptCache()
    t.is(ps.sp.type, "SCRIPT", {
      skip: !ScriptApp.isFake
    })

    t.is(typeof CacheService.getDocumentCache, 'function')
    ps.dp = CacheService.getDocumentCache()
    if (ps.dp) {
      t.is(ps.dp.type, "DOCUMENT", {
        skip: !ScriptApp.isFake
      })
    }

    const exValue = 'ex'
    const p = ['dp', 'sp', 'up']
    p.forEach(f => {
      const testValue = f + 'p'
      if (ps[f]) {
        t.is(ps[f].put(testKey, testValue), null)
        t.is(ps[f].get(testKey), testValue)
        t.is(ps[f].remove(testKey), null)
        t.is(ps[f].put(testKey, exValue, 2), null)
      } else {
        t.is(ps[f], null)
      }
    })

    p.forEach(f => {
      if (ps[f]) {
        t.is(ps[f].get(testKey), exValue)
      }
    })
    Utilities.sleep(2000)
    p.forEach(f => {
      if (ps[f]) {
        t.is(ps[f].get(testKey), null)
      }
    })
  })


  unit.section("scriptapp tests", t => {
    t.true(is.nonEmptyString(ScriptApp.getScriptId()))
  })


  unit.section('scopes and oauth', t => {
    const token = ScriptApp.getOAuthToken()
    t.true(is.nonEmptyString(token))
    /**
     * Apps Script  doesn't throw an error on an an invalid requiredallscopes ENUM as it should
       it returns null just like a succesfful call for now will omit on Apps Script side tests
       see https://issuetracker.google.com/issues/395159729
     */
    if (ScriptApp.isFake) {
      t.rxMatch(
        t.threw(() => ScriptApp.requireAllScopes(ScriptApp.AuthMode.RUBBISH)),
        /only FULL is supported as mode for now/, {
        description: 'update test with whatever is thrown when APPS Script bug is fixed'
      })
    } else {
      // it should fail on apps script but doesn't
      t.is(ScriptApp.requireAllScopes(ScriptApp.AuthMode.RUBBISH), null)
    }
    t.is(ScriptApp.requireAllScopes(ScriptApp.AuthMode.FULL), null)


    /**
     * this works in fake, and should work in Apps Script, but there's an outstanding issue
     * see https://issuetracker.google.com/issues/395159730
     * for now we'll omit from Apps Script side tests
     */
    if (ScriptApp.isFake) {
      t.is(ScriptApp.requireScopes(ScriptApp.AuthMode.FULL, ['https://www.googleapis.com/auth/drive.readonly']),
        null, {
        description: 'skip on Apps Script till bug is fixed'
      })
    }

    /**
     * Apps Script  doesnt throw an error on an an invalid requiredallscopes ENUM as it should
       it returns null just like a succesfful call for now will omit on Apps Script side tests
       see https://issuetracker.google.com/issues/395159729
     */
    t.rxMatch(
      t.threw(() => ScriptApp.requireScopes(ScriptApp.AuthMode.FULL, ['https://www.googleapis.com/auth/RUBBISH'])),
      /required but have not been authorized/, {
      skip: !ScriptApp.isFake,
      description: 'skip on Apps Script till bug is fixed'
    })

  }, {
    skip: false
  })


  unit.section("spreadsheet app", t => {
    const sap = SpreadsheetApp
    t.true(is.object(sap.SheetType))
    t.is(sap.SheetType.GRID.toString(), "GRID")
    t.truthy(sap.ValueType.IMAGE)
    t.falsey(sap.ValueType.RUBBISH)
    const ss = sap.openById(fixes.TEST_SHEET_ID)
    t.is(ss.getId(), fixes.TEST_SHEET_ID)

    // this'll be null if there's no bound sheet
    const ass = sap.getActiveSpreadsheet()

    t.true(is.object(ass) || ass === null)
    if (ass) {
      t.is(ass.getId(), fixes.TEST_SHEET_ID)
      t.is(ass.getName(), fixes.TEST_SHEET_NAME)
    }
  }, {
    skip: false
  })


  unit.section("searching with queries", t => {

    const root = DriveApp.getRootFolder()

    // this gets the folders directly under root folder with given name
    const folders = root.getFoldersByName(fixes.TEST_FOLDER_NAME)

    const folderPile = []
    while (folders.hasNext()) {
      folderPile.push(folders.next())
    }

    t.is(folderPile.length, 1)

    const filePile = []
    const [folder] = folderPile
    const dapMatches = DriveApp.getFoldersByName(folder.getName())
    t.true(dapMatches.hasNext())
    t.is(dapMatches.next().getName(), folder.getName())

    const files = folder.getFiles()
    while (files.hasNext()) {
      filePile.push(files.next())
    }
    t.is(filePile.length, fixes.TEST_FOLDER_FILES)
    filePile.forEach(file => {
      const matches = folder.getFilesByName(file.getName())
      t.true(matches.hasNext())
      t.is(matches.next().getId(), file.getId())
      t.false(matches.hasNext())
      const dapMatches = DriveApp.getFilesByName(file.getName())
      t.true(dapMatches.hasNext())
      t.is(dapMatches.next().getName(), file.getName())
    })



  }, { skip: true })







  unit.section('getting content', t => {
    const file = DriveApp.getFileById(fixes.TEXT_FILE_ID)
    const folder = DriveApp.getFolderById(fixes.TEST_FOLDER_ID)
    t.is(file.getMimeType(), 'text/plain')
    t.is(file.getName(), 'fake.txt')
    t.is(file.getParents().next().getId(), folder.getId())
    const blob = file.getBlob()
    t.is(blob.getDataAsString(), fixes.TEXT_FILE_CONTENT)
  })

  unit.section('extended meta data', t => {
    const file = DriveApp.getFileById(fixes.TEXT_FILE_ID)
    t.true(is.date(file.getLastUpdated()))
    t.true(is.date(file.getDateCreated()))

    t.true(is.string(file.getDescription()) || is.null(file.getDescription()))
    t.true(is.number(file.getSize()))
    t.is(file.getSize(), fixes.TEXT_FILE_CONTENT.length)
    t.false(file.isStarred())
    t.false(file.isTrashed())

    // make sure that nothing got overwritten with enhanced props
    t.is(file.getMimeType(), 'text/plain')
    t.is(file.getId(), fixes.TEXT_FILE_ID)

    const folder = DriveApp.getFolderById(fixes.TEST_FOLDER_ID)
    t.true(is.function(folder.getLastUpdated().getTime))
    t.true(is.date(folder.getLastUpdated()))
    t.true(is.function(folder.getDateCreated().getTime))
    t.true(is.date(folder.getDateCreated()))
    t.true(is.number(folder.getSize()))

    const sheetFile = DriveApp.getFileById(fixes.TEST_SHEET_ID)

    t.true(is.function(sheetFile.getLastUpdated().getTime))
    t.true(is.date(sheetFile.getLastUpdated()))
    t.true(is.function(sheetFile.getDateCreated().getTime))
    t.true(is.date(sheetFile.getDateCreated()))

    t.true(is.nonEmptyString(sheetFile.getName()))
    t.true(is.number(sheetFile.getSize()))
    // dont really know what size to expect for a sheet
    t.true(sheetFile.getSize() > 0)
    t.is(sheetFile.getMimeType(), 'application/vnd.google-apps.spreadsheet')

  }, {
    skip: false
  })


  unit.section('gas utiltities', t => {
    const now = new Date().getTime()
    const ms = 200
    Utilities.sleep(ms)
    const after = new Date().getTime()
    t.true(after - now >= 200, 'check we waited synchronously')
    t.rxMatch(
      t.threw(() => Utilities.sleep("rubbish")),
      /Cannot convert/,
      'double check its a sleepable number'
    )
  }, {
    skip: !ScriptApp.isFake
  })



  unit.section("driveapp searches", t => {

    // driveapp itself isnt actually a folder although it shares many of the methods
    // this is the folder that DriveApp represents
    const root = DriveApp.getRootFolder()

    // this gets the folders directly under root
    const folders = root.getFolders()

    const parentCheck = (folders, grandad, folderPile = []) => {
      while (folders.hasNext()) {
        const folder = folders.next()
        folderPile.push(folder)

        // note that parents is an iterator, not an array
        const parents = folder.getParents()
        t.true(Reflect.has(parents, "next"))
        t.true(Reflect.has(parents, "hasNext"))

        // and the next operation should get the meta data of the parent, not just the id
        // in this case there should one be 1
        const parentPile = []
        while (parents.hasNext()) {
          const parent = parents.next()
          t.is(parent.getName(), grandad.getName())
          t.is(parent.getId(), grandad.getId())
          parentPile.push(parent)
        }
        // not really expecting multiple parents nowadays.
        t.is(parentPile.length, 1, { skip: fixes.SKIP_SINGLE_PARENT })
      }
      return folderPile
    }
    const folderPile = parentCheck(folders, root)

    // MYDRIVE I know i have at least thes number of folders in the root
    t.true(folderPile.length > fixes.MIN_FOLDERS_ROOT)

    // I know i have a folder called this
    const math = folderPile.find(f => f.getName() === fixes.TEST_FOLDER_NAME)
    t.is(math.getName(), fixes.TEST_FOLDER_NAME)
    const files = math.getFiles()
    const pile = parentCheck(files, math)

    // i know i have 3 files in math
    t.is(pile.length, fixes.TEST_FOLDER_FILES)
  }, { skip: false })

  unit.section('drive JSON api tests with urlfetchapp directly', t => {

    const token = ScriptApp.getOAuthToken()
    const endpoint = 'https://www.googleapis.com/drive/v3'
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const response = UrlFetchApp.fetch(`${endpoint}/files`, { headers })

    t.is(response.getResponseCode(), 200)
    t.true(is.object(response.getHeaders()))
    const text = response.getContentText()
    t.true(is.string(text))

    const rootResponse = UrlFetchApp.fetch(`${endpoint}/files/root`, { headers })
    const root = JSON.parse(rootResponse.getContentText())
    t.is(root.name, "My Drive")
    t.is(root.mimeType, "application/vnd.google-apps.folder")
  }, { skip: false })


  unit.report()
}

// this required on Node but not on Apps Script
if (ScriptApp.isFake) testFakes()