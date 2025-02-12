
// all these imports 
// this is loaded by npm, but is a library on Apps Script side
import { Exports as unitExports } from '@mcpher/unit'


// all the fake services are here
import '@mcpher/gas-fakes/main.js'

const testFakes = async () => {


  // on node this will have come from the imports that get stripped when mocing to gas
  // on apps script, you'll have a gas only imports file that aliases 
  // the exports from any gas libraries required
  const unit = unitExports.newUnit({
    showErrorsOnly: true
  })


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
    TEST_SHEET_ID: '1DlKpVVYCrCPNfRbGsz6N_K3oPTgdC9gQIKi0aNb42uI'
  }

  unit.section("searching with queries", t => {

    const root = DriveApp.getRootFolder()

    // this gets the folders directly under root folder with given name
    const folders = root.getFoldersByName(fixes.TEST_FOLDER_NAME)
 
    const folderPile = []
    while (folders.hasNext()) {
      folderPile.push (folders.next())
    }

    t.is (folderPile.length, 1)

    const filePile = []
    const [folder] = folderPile
    const dapMatches = DriveApp.getFoldersByName (folder.getName())
    t.true (dapMatches.hasNext())
    t.is (dapMatches.next().getName(), folder.getName())

    const files = folder.getFiles()
    while (files.hasNext()) {
      filePile.push (files.next())
    }
    t.is (filePile.length, fixes.TEST_FOLDER_FILES)
    filePile.forEach (file=> {
      const matches = folder.getFilesByName(file.getName())
      t.true (matches.hasNext())
      t.is (matches.next().getId(), file.getId())
      t.false(matches.hasNext())
      const dapMatches = DriveApp.getFilesByName (file.getName())
      t.true (dapMatches.hasNext())
      t.is (dapMatches.next().getName(), file.getName())
    })



  }, { skip: false })



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
  
  unit.section('getting content', t => {
    const file = DriveApp.getFileById(fixes.TEXT_FILE_ID)
    const folder = DriveApp.getFolderById(fixes.TEST_FOLDER_ID)
    t.is(file.getMimeType(), 'text/plain')
    t.is(file.getName(), 'fake.txt')
    t.is(file.getParents().next().getId(), folder.getId())
    const blob = file.getBlob()
    t.is (blob.getDataAsString(),fixes.TEXT_FILE_CONTENT )
  })

  unit.section ('extended meta data', t=> {
    const file = DriveApp.getFileById(fixes.TEXT_FILE_ID)
    t.true (Reflect.has(file.getLastUpdated(), "getTime")) 
    t.true (Reflect.has(file.getDateCreated(), "getTime")) 
    t.true (typeof file.getDescription () === "string" || file.getDescription () === null)
    t.is (typeof file.getSize (), "number")
    t.is (file.getSize(), fixes.TEXT_FILE_CONTENT.length)
    t.false (file.isStarred())
    t.false (file.isTrashed())

    // make sure that nothing got overwritten with enhanced props
    t.is(file.getMimeType(), 'text/plain')
    t.is(file.getId(), fixes.TEXT_FILE_ID)

    const folder = DriveApp.getFolderById(fixes.TEST_FOLDER_ID)
    t.true (Reflect.has(folder.getLastUpdated(), "getTime")) 
    t.true (Reflect.has(folder.getDateCreated(), "getTime")) 
    t.is (typeof folder.getSize (), "number")

    const sheet = DriveApp.getFileById(fixes.TEST_SHEET_ID)
    t.true (Reflect.has(sheet.getLastUpdated(), "getTime")) 
    t.true (Reflect.has(sheet.getDateCreated(), "getTime")) 
    t.is (typeof sheet.getName (), "string")
    t.is (typeof sheet.getSize (), "number")
    // dont really know what size to expect for a sheet
    t.true (sheet.getSize()>0)
    t.is (sheet.getMimeType(), 'application/vnd.google-apps.spreadsheet') 

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

  unit.section('scopes and oauth', t => {
    const token = ScriptApp.getOAuthToken()
    t.is(typeof token, "string")
    /**
     * Apps Script  doesnt throw an error on an an invalid requiredallscopes ENUM as it should
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
    t.is(typeof response.getHeaders(), "object")
    const text = response.getContentText()
    t.is(typeof text, "string")

    const rootResponse = UrlFetchApp.fetch(`${endpoint}/files/root`, { headers })
    const root = JSON.parse(rootResponse.getContentText())
    t.is(root.name, "My Drive")
    t.is(root.mimeType, "application/vnd.google-apps.folder")
  }, { skip: false })


  unit.report()
}

// this required on Node but not on Apps Script
if (ScriptApp.isFake) testFakes()