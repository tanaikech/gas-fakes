
// all these imports 
// this is loaded by npm, but is a library on Apps Script side
import { Exports as unitExports } from '@mcpher/unit'
import is from '@sindresorhus/is';
import { getPerformance } from '../src/support/filecache.js';
import { mergeParamStrings } from '../src/support/utils.js';
// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import '../main.js'

const testFakes =  () => {

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
    MIN_ROOT_PDFS: 20,
    MIN_PDFS: 400,
    MIN_FOLDERS_ROOT: 110,
    TEST_FOLDER_NAME: "math",
    TEST_FOLDER_FILES: 3,
    SKIP_SINGLE_PARENT: true,
    TEXT_FILE_NAME: 'fake.txt',
    TEST_FOLDER_ID: '1Zww9oCTFR7zYcUYXxd70yQr3sw6VdLG-',
    TEXT_FILE_ID: '1142Vn7W-pGl5nWLpUSkpOB82JDiz9R6p',
    TEXT_FILE_TYPE: 'text/plain',
    TEXT_FILE_CONTENT: 'foo is not bar',
    BLOB_NAME: 'foo.txt',
    BLOB_TYPE: 'text/plain',
    TEST_SHEET_ID: '1DlKpVVYCrCPNfRbGsz6N_K3oPTgdC9gQIKi0aNb42uI',
    TEST_SHEET_NAME: 'sharedlibraries',
    EMAIL: 'bruce@mcpher.com',
    TIMEZONE: 'Europe/London',
    LOCALE: 'en_US',
    ZIP_TYPE: "application/zip",
    KIND_DRIVE: "drive#file",
    OWNER_NAME: "Bruce Mcpherson",
    PUBLIC_SHARE_FILE_ID: "1OFJk38kW9TRrEf-B9F1gTZk2uLV-ZSpR",
    SHARED_FILE_ID: "1uz4cxEDxtQzu0cBb1B4h6fsjgWy7hNFf"
  }




  unit.section('driveapp basics and Drive equivalence', t => {
    t.is(DriveApp.toString(), "Drive")
    t.is(DriveApp.getRootFolder().toString(), "My Drive")

    const file = DriveApp.getFileById(fixes.TEXT_FILE_ID)
    const folder = DriveApp.getFolderById(fixes.TEST_FOLDER_ID)
    t.is(file.getMimeType(), 'text/plain')
    t.is(file.getName(), 'fake.txt')
    t.is(file.getParents().next().getId(), folder.getId())
    t.is(folder.getName(), Drive.Files.get(fixes.TEST_FOLDER_ID).name)
    t.is(folder.toString(), folder.getName())
    t.is(file.getParents().next().getId(), Drive.Files.get(fixes.TEST_FOLDER_ID).id)
    t.true(file.getParents().hasNext())
    const blob = file.getBlob()
    t.is(blob.getDataAsString(), fixes.TEXT_FILE_CONTENT)

    if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())


  })

  unit.section ('check where google doesnt support in adv drive', t=> {
    try {
      t.true (Drive.Operations.list ('foo'))
    } catch (err) {
      t.rxMatch (err.toString(), /Error: GoogleJsonResponseException: API call to drive.operations.list failed/)
    }

  })

  unit.section ('adv drive downloads',t=> {
    const r = Drive.Files.download (fixes.TEXT_FILE_ID)
    t.true (is.object(r.metadata))
    t.true (is.nonEmptyString(r.name))
    t.true (is.nonEmptyObject(r.response))
    t.true (is.nonEmptyString(r.response.downloadUri))


    const token = ScriptApp.getOAuthToken()
    t.true (is.nonEmptyString(token))
    const headers = {
      Authorization: `Bearer ${token}`
    }

    // can we use the url to download
    const response = UrlFetchApp.fetch (r.response.downloadUri, {headers})
    t.is(response.getResponseCode(), 200)
    t.true(is.object(response.getHeaders()))
    const text = response.getContentText()
    t.is(text, fixes.TEXT_FILE_CONTENT)

    // and driveapp to compare and do the same things
    const aFile = Drive.Files.get (fixes.TEXT_FILE_ID)
    const file = DriveApp.getFileById(fixes.TEXT_FILE_ID)
    const blob = file.getBlob()
    t.is (blob.getName() , aFile.name)
    t.is (blob.getDataAsString(),text)
    t.is (file.getId(), aFile.id)

  })


  unit.section ('driveapp and adv permissions', t=> {

    const {permissions} = Drive.Permissions.list (fixes.TEXT_FILE_ID)
    t.is (permissions.length, 1)
    const [p0] = permissions
    t.true (is.nonEmptyString (p0.id))
    t.is (p0.type, "user")
    t.is (p0.role,"owner")

    const {permissions: extras} = Drive.Permissions.list (fixes.TEXT_FILE_ID, {fields: "permissions(kind,id,role,type,emailAddress,deleted)"})
    const [e0] = extras
    t.is (e0.id, p0.id)
    t.is (e0.kind, p0.kind)
    t.is (e0.emailAddress, fixes.EMAIL)
    t.false (e0.deleted)

    const rootFolder = DriveApp.getRootFolder()
    const owner = rootFolder.getOwner ()
    t.is (owner.getName(), fixes.OWNER_NAME)
    t.is (owner.getEmail(), fixes.EMAIL)

    const file = DriveApp.getFileById (fixes.SHARED_FILE_ID)
    t.is (file.getOwner().getEmail(),fixes.EMAIL ) 

    const viewers = file.getViewers()
    t.is (viewers.length, 1)
    viewers.forEach (f=> t.true (is.nonEmptyString (f.getEmail())))

    const editors = file.getEditors()
    t.is (editors.length, 1)
    editors.forEach (f=> t.true (is.nonEmptyString (f.getName())))

  })


  unit.section("exotic driveapps versus Drive", t => {

    const appPdf = DriveApp.getFilesByType('application/pdf')
    const appPdfPile = []
    while (appPdf.hasNext()) {
      const file = appPdf.next()
      t.is(file.getMimeType(), "application/pdf")
      appPdfPile.push(file)
    }

    t.true(appPdfPile.length >= fixes.MIN_PDFS)

    const rootPdf = DriveApp.getRootFolder().getFilesByType('application/pdf')
    const rootPdfPile = []
    while (rootPdf.hasNext()) {
      const file = rootPdf.next()
      t.is(file.getMimeType(), "application/pdf")
      rootPdfPile.push(file)
    }

    t.true(rootPdfPile.length >= fixes.MIN_ROOT_PDFS)


    /*
     const drivePile = Drive.Files.list ({
       orderBy: "createdTime,name",
       fields: "files(name,id,size)",
       pageSize: 100,
       q: "name contains 's' and mimeType='application/pdf'"
     })
       */
    if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())
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



  unit.section("driveapp searching with queries", t => {

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

    if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())

  }, { skip: false })

/*
  console.log(Drive.Files.list({
    orderBy: "createdTime,name",
    fields: "files(name,id),nextPageToken",
    q: "name contains 's'"
  }))
*/

  unit.section("advanced drive basics", t => {
    t.true(is.nonEmptyString(Drive.toString()))
    t.true(is.nonEmptyString(Drive.Files.toString()))
    t.is(Drive.getVersion(), 'v3')
    t.is(Drive.About.toString(), Drive.toString())
    t.is(Drive.About.toString(), Drive.Files.toString())
    const file = Drive.Files.get(fixes.TEXT_FILE_ID)
    t.is(file.id, fixes.TEXT_FILE_ID)
    t.is(file.name, fixes.TEXT_FILE_NAME)
    t.is(file.mimeType, fixes.TEXT_FILE_TYPE)
    t.is(file.kind, fixes.KIND_DRIVE)
    t.deepEqual(file, DriveApp.getFileById(fixes.TEXT_FILE_ID).meta, {
      skip: !DriveApp.isFake,
      description: 'meta property only exists on fakedrive class'
    })
    if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())
  })



  unit.section("session properties", t => {
    t.is(Session.getActiveUser().toString(), fixes.EMAIL)
    t.is(Session.getActiveUser().getEmail(), fixes.EMAIL)
    t.is(Session.getEffectiveUser().getEmail(), fixes.EMAIL)
    t.is(Session.getActiveUserLocale(), fixes.LOCALE)
    t.is(Session.getScriptTimeZone(), fixes.TIMEZONE)
    t.true(is.nonEmptyString(Session.getTemporaryActiveUserKey()))
  }, {
    skip: false
  })


  unit.section("utilities base64 encoding", t => {
    const text = fixes.TEXT_FILE_CONTENT
    const blob = Utilities.newBlob(text)
    const { actual: b64 } = t.is(Utilities.base64Encode(blob.getBytes()), Utilities.base64Encode(text))
    t.true(is.nonEmptyString(b64))

    const { actual: b64w } = t.is(Utilities.base64EncodeWebSafe(blob.getBytes()), Utilities.base64EncodeWebSafe(text))
    t.true(is.nonEmptyString(b64w))


    const trouble = text + '+/='
    const b64t = Utilities.base64EncodeWebSafe(trouble)

    const b = Utilities.newBlob(Utilities.base64Decode(b64)).getDataAsString()
    const bw = Utilities.newBlob(Utilities.base64Decode(b64w)).getDataAsString()
    const bt = Utilities.newBlob(Utilities.base64DecodeWebSafe(b64t)).getDataAsString()
    const bbt = Utilities.newBlob(Utilities.base64Decode(b64t)).getDataAsString()

    t.is(bt, trouble)
    t.is(b, text)
    t.is(bw, text)
    t.is(bbt, trouble)

  })

  unit.section("utilities zipping", t => {
    const texts = [fixes.TEXT_FILE_CONTENT, fixes.TEST_FOLDER_NAME]
    const blobs = texts.map((f, i) => Utilities.newBlob(f, fixes.BLOB_TYPE, 'b' + i + '.txt'))
    const z = Utilities.zip(blobs)
    t.is(z.getName(), "archive.zip")

    const y = Utilities.zip(blobs, "y.zip")
    t.is(y.getName(), "y.zip")
    t.is(z.getContentType(), fixes.ZIP_TYPE)

    const u = Utilities.unzip(z)
    t.is(u.length, texts.length)

    u.forEach((f, i) => {
      t.is(f.getName(), blobs[i].getName())
      t.is(f.getContentType(), blobs[i].getContentType())
      t.is(f.getDataAsString(), texts[i])
    })
  })



  unit.section('utilities gzipping', t => {
    t.true(is.nonEmptyString(Utilities.getUuid()))

    const blob = Utilities.newBlob(fixes.TEXT_FILE_CONTENT)
    const gz = Utilities.gzip(blob)
    t.is(gz.getContentType(), "application/x-gzip")
    t.is(gz.getName(), "archive.gz")

    const ugz = Utilities.ungzip(gz)
    t.is(ugz.getDataAsString(), fixes.TEXT_FILE_CONTENT)
    t.is(ugz.getContentType(), null)
    t.is(ugz.getName(), "archive")

    const ngz = Utilities.gzip(blob, "named")
    const nugz = Utilities.ungzip(ngz)
    t.is(nugz.getName(), "named")

  })

  unit.section('utilities blob manipulation', t => {
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


  unit.section("scriptapp basics", t => {
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


  unit.section("WIP spreadsheet app", t => {
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


  unit.section ('fake helper tests', t=>{
    const s1 = "fields(f1,f2),a1,t2,permissions(p1,p2)"
    const s2 = "t1,t2,t3,permissions(p1,p3)"
    const s3 = "fields(f1,f3),t3,t4,t1"
    const expect = "a1,fields(f1,f2,f3),permissions(p1,p2,p3),t1,t2,t3,t4"
    t.is (mergeParamStrings(s1,s2,s3), expect)
    t.is (mergeParamStrings(s1,s2,s3,s1), expect, 'check exact dups are allowed')

    try {
      t.is (mergeParamStrings(s1,s2,s3,s1,"fields"), expect, "this should fail because of different roles for fields")
    }
    catch (err) {
      t.rxMatch (err.toString(),/^TypeError:/  )
    }


  }, {
    skip: !ScriptApp.isFake
  })


  unit.section('adv drive Apps - drive.apps script is blocked on adc so cant test this for now', t => {
    const { items } = Drive.Apps.list()
    t.true(is.array(items))
    const [i0] = items
    console.log (i0)
    t.deepEqual(Drive.Apps.get(i0.id), i0)
  }, {
    skip: true
  })

  unit.report()
}

// this required on Node but not on Apps Script
if (ScriptApp.isFake) testFakes()