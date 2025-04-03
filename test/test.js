
// all these imports 
// this is loaded by npm, but is a library on Apps Script side
import { Exports as unitExports } from '@mcpher/unit'
import is from '@sindresorhus/is';
import { getPerformance } from '../src/support/filecache.js';
import { mergeParamStrings } from '../src/support/utils.js';
// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import '../main.js'

const testFakes = () => {

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

  // these are fixtures to test
  // using process.env creates strings, convert to appropriate types as needed
  const fixes = {
    MIN_ROOT_PDFS: Number(process.env.MIN_NUM_ROOT_PDFS),
    MIN_PDFS: Number(process.env.MIN_NUM_PDFS),
    MIN_FOLDERS_ROOT: process.env.MIN_FOLDERS_ROOT,
    TEST_FOLDER_NAME: process.env.TEST_FOLDER_NAME,
    TEST_FOLDER_FILES: Number(process.env.TEST_FOLDER_NUM_CHILD_FILES),
    SKIP_SINGLE_PARENT: process.env.SKIP_SINGLE_PARENT === 'true',
    TEST_FOLDER_ID: process.env.TEST_FOLDER_ID,
    TEXT_FILE_NAME: process.env.TEXT_FILE_NAME,
    TEXT_FILE_ID: process.env.TEXT_FILE_ID,
    TEXT_FILE_TYPE: process.env.TEXT_FILE_TYPE,
    TEXT_FILE_CONTENT: process.env.TEXT_FILE_CONTENT,
    BLOB_NAME: process.env.BLOB_NAME,
    BLOB_TYPE: process.env.BLOB_TYPE,
    TEST_SHEET_ID: process.env.TEST_SHEET_ID,
    TEST_SHEET_NAME: process.env.TEST_SHEET_NAME,
    EMAIL: process.env.EMAIL,
    TIMEZONE: process.env.TIMEZONE,
    LOCALE: process.env.LOCALE,
    ZIP_TYPE: process.env.ZIP_TYPE,
    KIND_DRIVE: process.env.KIND_DRIVE,
    OWNER_NAME: process.env.OWNER_NAME,
    PUBLIC_SHARE_FILE_ID: process.env.PUBLIC_SHARE_FILE_ID,
    SHARED_FILE_ID: process.env.SHARED_FILE_ID,
    RANDOM_IMAGE: process.env.RANDOM_IMAGE,
    API_URL: process.env.API_URL,
    API_TYPE: process.env.API_TYPE,
    PREFIX: Drive.isFake ? "--f" : "--g",
    PDF_ID: process.env.PDF_ID,
    CLEAN: process.env.CLEAN === 'true'
  }



  unit.section("spreadsheetapp basics", t => {
    const ass = Sheets.Spreadsheets.get(fixes.TEST_SHEET_ID)
    const ss = SpreadsheetApp.openById(fixes.TEST_SHEET_ID)
    t.is(ss.getId(), fixes.TEST_SHEET_ID)
    t.is(ss.getName(), fixes.TEST_SHEET_NAME)
    t.is(ss.getNumSheets(), ass.sheets.length)
    const sheets = ss.getSheets()
    t.is(sheets.length, ass.sheets.length)

    sheets.forEach((s, i) => {
      t.is(s.getName(), ass.sheets[i].properties.title)
      t.is(s.getSheetId(), ass.sheets[i].properties.sheetId)
      t.is(s.getIndex(), i + 1)
      t.true(is.number(s.getSheetId()))
      t.is(s.getName(), s.getSheetName())
      t.is(s.getMaxColumns(), ass.sheets[i].properties.gridProperties.columnCount)
      t.is(s.getMaxRows(), ass.sheets[i].properties.gridProperties.rowCount)
      t.is(s.getType().toString(), ass.sheets[i].properties.sheetType)
      t.is(ss.getSheetById(s.getSheetId()).getName(), s.getName())
      t.is(ss.getSheetByName(s.getName()).getSheetId(), s.getSheetId())
    })


    t.is(ss.getId(), ss.getKey())
    t.is(ss.getSheetId(), sheets[0].getSheetId())
    t.is(ss.getSheetName(), sheets[0].getName())

    const file = DriveApp.getFileById(ss.getId())
    t.is(file.getName(), ss.getName())
    t.is(file.getMimeType(), "application/vnd.google-apps.spreadsheet")
    t.is(file.getOwner().getEmail(), ss.getOwner().getEmail())
    t.is(file.getOwner().getEmail(), fixes.EMAIL)

    t.is(SpreadsheetApp.openByUrl(ss.getUrl()).getId(), ss.getId())
    t.is(SpreadsheetApp.openByKey(ss.getId()).getId(), ss.getId())

  })

  unit.section("advanced sheet basics", t => {
    t.true(is.nonEmptyString(Sheets.toString()))
    t.is(Sheets.getVersion(), 'v4')
    t.is(Drive.isFake, Sheets.isFake, {
      neverUndefined: false
    })
    t.is(Sheets.toString(), Sheets.Spreadsheets.toString())
    const ss = Sheets.Spreadsheets.get(fixes.TEST_SHEET_ID)
    t.is(ss.spreadsheetId, fixes.TEST_SHEET_ID)
    t.true(is.nonEmptyObject(ss.properties))
    t.is(ss.properties.title, fixes.TEST_SHEET_NAME)
    t.is(ss.properties.autoRecalc, "ON_CHANGE")
    t.true(is.nonEmptyObject(ss.properties.defaultFormat))
    t.true(is.nonEmptyObject(ss.properties.spreadsheetTheme))
    t.true(is.array(ss.sheets))
    t.truthy(ss.sheets.length)
    t.true(is.nonEmptyString(ss.spreadsheetUrl))

  })
  
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


  unit.section("root folder checks", t => {
    const rootFolder = DriveApp.getRootFolder()
    if (DriveApp.isFake) {
      t.true(rootFolder.__isRoot, 'fake internal check')
    }
    t.false(rootFolder.getParents().hasNext())
    const root = Drive.Files.get('root', { fields: 'parents' })
    // TODO - slight difference fake returns null for no parents, gas undefined
    t.true(is.undefined(root.parents), { skip: Drive.isFake })
    t.true(is.null(root.parents), { skip: !Drive.isFake })

    // cant set meta data
    t.rxMatch(t.threw(() => rootFolder.setStarred(true)).toString(), /Access denied/)
    //TODO find out whether we can set permissions etc.

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
    const knownTestFolder = folderPile.find(f => f.getName() === fixes.TEST_FOLDER_NAME)
    t.is(knownTestFolder.getName(), fixes.TEST_FOLDER_NAME)
    const files = knownTestFolder.getFiles()
    const pile = parentCheck(files, knownTestFolder)

    // i know i have this number of files in the folder
    t.is(pile.length, fixes.TEST_FOLDER_FILES)

    if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())
  })

  unit.section('updates and moves advdrive and driveapp', t => {

    const toTrash = []

    // create a text file with nothing in it
    const aname = fixes.PREFIX + "u-afile---.txt"
    const zfile = Drive.Files.create({ name: aname, mimeType: fixes.TEXT_FILE_TYPE })

    const afile = Drive.Files.get(zfile.id, { fields: "id,parents,mimeType,name" })
    t.is(afile.name, aname)
    t.is(afile.mimeType, fixes.TEXT_FILE_TYPE)
    t.is(afile.id, zfile.id)
    toTrash.push(DriveApp.getFileById(afile.id))


    // now get a pdf blob and update it with that and change the name
    const pdfBlob = DriveApp.getFileById(fixes.PDF_ID).getBlob()
    const pname = fixes.PREFIX + pdfBlob.getName()
    const pfile = Drive.Files.update({ name: pname }, afile.id, pdfBlob)
    t.deepEqual(DriveApp.getFileById(pfile.id).getBlob().getBytes(), pdfBlob.getBytes())
    t.is(pfile.id, afile.id)
    t.is(pfile.mimeType, "application/pdf", 'media should have redone the mimetype')
    t.is(pfile.name, pname)

    // move it somewhere else
    const dfile = DriveApp.getFileById(pfile.id)
    t.is(dfile.getParents().next().getId(), afile.parents[0])
    const folder = DriveApp.getFolderById(fixes.TEST_FOLDER_ID)
    const mfile = dfile.moveTo(folder)
    t.is(mfile.getId(), dfile.getId())
    t.deepEqual(mfile.getBlob().getBytes(), dfile.getBlob().getBytes())
    t.is(mfile.getSize(), dfile.getBlob().getBytes().length)
    t.is(mfile.getMimeType(), pfile.mimeType)
    // TODO -moveTo is not updating cache probably because we'er not retrieving the parents property
    t.is(mfile.getParents().next().getId(), folder.getId())

    // set some content
    const cfname = fixes.PREFIX + "u-cfile.txt"
    const cf = DriveApp.createFile(Utilities.newBlob(fixes.TEXT_FILE_CONTENT, fixes.TEXT_FILE_TYPE, cfname))
    toTrash.push(cf)

    cf.setContent("foo")
    t.is(cf.getBlob().getDataAsString(), "foo")
    t.not(cf.getBlob().getDataAsString(), fixes.TEXT_FILE_CONTENT)
    cf.setContent(cf.getBlob())
    t.is(cf.getBlob().getDataAsString(), "Blob", "Bizarrely set content only takes a string and does a toString() on other things")

    // set some props
    t.false(cf.isTrashed())
    t.false(cf.isStarred())
    t.true(cf.isShareableByEditors())
    cf.setDescription("foo")
    cf.setStarred(true)
    cf.setTrashed(true)
    cf.setShareableByEditors(false)
    t.true(cf.isTrashed())
    t.true(cf.isStarred())
    t.false(cf.isShareableByEditors())
    t.is(cf.getDescription(), "foo")
    cf.setStarred(false)
    cf.setTrashed(false)
    cf.setShareableByEditors(true)
    t.false(cf.isTrashed())
    t.false(cf.isStarred())
    t.true(cf.isShareableByEditors())

    // check bad args
    t.rxMatch(t.threw(() => mfile.moveTo()).toString(), /The parameters \(\) don't match/)
    t.rxMatch(t.threw(() => mfile.moveTo("rubbish")).toString(), /The parameters \(String\)/)

    // trash all files
    if (fixes.CLEAN) toTrash.forEach(f => f.setTrashed(true))
    if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())
  })

  unit.section('create and copy files with driveapp and compare content with adv drive and urlfetch', t => {

    const toTrash = []
    const rootFolder = DriveApp.getRootFolder()
    t.is(rootFolder.toString(), "My Drive")


    // folders
    const fname = fixes.PREFIX + "folder--of-junk"
    const folder = DriveApp.createFolder(fname)
    const mfolder = DriveApp.getFolderById(folder.getId())
    t.is(mfolder.getId(), folder.getId())
    t.is(DriveApp.getFolderById(folder.getId()).getSize(), 0)
    toTrash.push(folder)

    // adv drive creating
    const aname = fixes.PREFIX + "a-adc---.txt"
    const adc = Drive.Files.create({ name: aname, mimeType: fixes.TEXT_FILE_TYPE }, Utilities.newBlob(fixes.TEXT_FILE_CONTENT))
    t.true(is.nonEmptyString(adc.id))
    t.is(adc.name, aname)
    t.is(adc.mimeType, fixes.TEXT_FILE_TYPE)
    t.deepEqual(DriveApp.getFileById(adc.id).getBlob().getDataAsString(), fixes.TEXT_FILE_CONTENT)
    toTrash.push(DriveApp.getFileById(adc.id))

    // adv drive copying
    const cname = fixes.PREFIX + "copy-adcopy---.txt"
    const adcopy = Drive.Files.copy({ name: cname }, adc.id)
    t.is(adcopy.name, cname)
    t.true(is.nonEmptyString(adcopy.id))
    t.is(adcopy.mimeType, fixes.TEXT_FILE_TYPE)
    t.deepEqual(DriveApp.getFileById(adcopy.id).getBlob().getDataAsString(), fixes.TEXT_FILE_CONTENT)
    toTrash.push(DriveApp.getFileById(adcopy.id))

    // drivapp copying
    const rcname = fixes.PREFIX + "copy-drive-junk-rename---.txt"
    const dcfile = DriveApp.getFileById(adcopy.id)
    const dcopy1 = dcfile.makeCopy()
    t.is(dcopy1.getName(), cname)
    t.true(is.nonEmptyString(dcopy1.getId()))
    t.not(dcopy1.getId(), dcfile.getId())
    t.is(dcopy1.getMimeType(), fixes.TEXT_FILE_TYPE)
    t.deepEqual(dcopy1.getBlob().getDataAsString(), fixes.TEXT_FILE_CONTENT)
    t.is(dcopy1.getParents().next().getId(), dcfile.getParents().next().getId())
    toTrash.push(dcopy1)

    const dcopy2 = dcfile.makeCopy(rcname)
    t.is(dcopy2.getName(), rcname)
    t.not(dcopy2.getId(), dcfile.getId())
    t.is(dcopy2.getMimeType(), fixes.TEXT_FILE_TYPE)
    t.deepEqual(dcopy2.getBlob().getDataAsString(), fixes.TEXT_FILE_CONTENT)
    t.is(dcopy2.getParents().next().getId(), dcfile.getParents().next().getId())
    toTrash.push(dcopy2)

    const dcopy3 = dcfile.makeCopy(folder)
    t.is(dcopy3.getName(), dcfile.getName())
    t.is(dcopy3.getParents().next().getId(), folder.getId())
    toTrash.push(dcopy3)

    const dcopy4 = dcfile.makeCopy(rcname, folder)
    t.is(dcopy4.getName(), rcname)
    t.is(dcopy4.getParents().next().getId(), folder.getId())
    toTrash.push(dcopy4)

    // drveapp creating
    const rname = fixes.PREFIX + 'loado--f--utterjunk.txt'
    const rootFile = rootFolder.createFile(rname, fixes.TEXT_FILE_CONTENT, fixes.TEXT_FILE_TYPE)
    t.is(rootFile.getParents().next().getId(), rootFolder.getId())
    t.is(rootFile.getMimeType(), fixes.TEXT_FILE_TYPE)
    t.is(rootFile.getBlob().getDataAsString(), fixes.TEXT_FILE_CONTENT)
    t.is(rootFile.getName(), rname)
    const checkFile = DriveApp.getFileById(rootFile.getId())
    t.deepEqual(checkFile.getBlob().getBytes(), rootFile.getBlob().getBytes())
    t.deepEqual(checkFile.getBlob().getBytes(), Utilities.newBlob(fixes.TEXT_FILE_CONTENT).getBytes())
    toTrash.push(rootFile)

    // cant create file by meta data only with DriveApp - so give it min required
    const mname = fixes.PREFIX + 'loado--m--utterjunk.txt'
    const metaFile = rootFolder.createFile(mname, "")
    const mfile = Drive.Files.get(metaFile.getId(), { fields: "parents,id,name" })
    t.is(mfile.name, metaFile.getName())
    t.is(mfile.parents[0], rootFolder.getId())
    toTrash.push(metaFile)


    // files in folders
    const img = UrlFetchApp.fetch(fixes.RANDOM_IMAGE)
    const blob = img.getBlob()
    const mffile = mfolder.createFile(blob)
    t.is(mffile.getParents().next().getId(), mfolder.getId())
    t.deepEqual(mffile.getBlob().getBytes(), blob.getBytes())
    t.is(mffile.getName(), blob.getName())
    t.is(mffile.getMimeType(), blob.getContentType())
    toTrash.push(mffile)

    // fetch it back with urlfetch
    const token = ScriptApp.getOAuthToken()
    t.true(is.nonEmptyString(token))
    const headers = {
      Authorization: `Bearer ${token}`
    }
    // can we use the url to download
    const r = Drive.Files.download(mffile.getId())
    const response = UrlFetchApp.fetch(r.response.downloadUri, { headers })
    const rblob = response.getBlob()
    t.deepEqual(rblob.getBytes(), blob.getBytes())
    const rmffile = DriveApp.getFileById(mffile.getId())
    t.deepEqual(rblob.getBytes(), rmffile.getBlob().getBytes())
    t.is(rblob.getContentType(), rmffile.getMimeType())
    const dr = DriveApp.getFileById(mffile.getId())
    t.deepEqual(dr.getBlob().getBytes(), blob.getBytes())
    t.is(dr.getName(), mffile.getName())
    t.is(dr.getSize(), mffile.getSize())
    t.is(dr.getName(), mffile.getName())
    t.is(dr.getParents().next().getId(), mffile.getParents().next().getId())
    t.is(dr.getParents().next().getId(), mfolder.getId())



    // check errors are thrown
    t.rxMatch(t.threw(() => DriveApp.createFile()).toString(), /The parameters \(\) don't match/)
    t.rxMatch(t.threw(() => DriveApp.createFile("")).toString(), /The parameters \(String\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile(null, "")).toString(), /Invalid argument: name/)
    t.rxMatch(t.threw(() => DriveApp.createFile(blob, "")).toString(), /The parameters \(Blob,String\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile(mname)).toString(), /The parameters \(String\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile(Utilities.newBlob(""))).toString(), /Blob object must have non-null name for this operation./)
    t.rxMatch(t.threw(() => Drive.Files.create({ name: aname }, "foo")).toString(), /The mediaData parameter only supports Blob types for upload./)
    t.rxMatch(t.threw(() => Drive.Files.copy(null, null)).toString(), /API call to drive\.files\.copy failed with error: Required/)
    t.rxMatch(t.threw(() => dcfile.makeCopy(folder, "xx")).toString(), /The parameters \(DriveApp.Folder,String\) don't match/)
    t.rxMatch(t.threw(() => dcfile.makeCopy("yy", "xx")).toString(), /The parameters \(String,String\) don't match/)

    if (fixes.CLEAN) toTrash.forEach(f => f.setTrashed(true))
    if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())
  })

  unit.section('driveapp and adv permissions', t => {

    const { permissions } = Drive.Permissions.list(fixes.TEXT_FILE_ID)
    t.is(permissions.length, 1)
    const [p0] = permissions
    t.true(is.nonEmptyString(p0.id))
    t.is(p0.type, "user")
    t.is(p0.role, "owner")

    const { permissions: extras } = Drive.Permissions.list(fixes.TEXT_FILE_ID, { fields: "permissions(kind,id,role,type,emailAddress,deleted)" })
    const [e0] = extras
    t.is(e0.id, p0.id)
    t.is(e0.kind, p0.kind)
    t.is(e0.emailAddress, fixes.EMAIL)
    t.false(e0.deleted)

    const rootFolder = DriveApp.getRootFolder()
    const owner = rootFolder.getOwner()
    t.is(owner.getName(), fixes.OWNER_NAME)
    t.is(owner.getEmail(), fixes.EMAIL)

    const file = DriveApp.getFileById(fixes.SHARED_FILE_ID)
    t.is(file.getOwner().getEmail(), fixes.EMAIL)

    const viewers = file.getViewers()
    t.is(viewers.length, 1)
    viewers.forEach(f => t.true(is.nonEmptyString(f.getEmail())))

    const editors = file.getEditors()
    t.is(editors.length, 1)
    editors.forEach(f => t.true(is.nonEmptyString(f.getName())))

  })

  unit.section('create files with driveapp and compare content with adv drive and urlfetch', t => {

    const toTrash = []

    const rootFolder = DriveApp.getRootFolder()
    t.is(rootFolder.toString(), "My Drive")
    const rname = '--loado--f--utterjunk.txt'


    const rootFile = rootFolder.createFile(rname, fixes.TEXT_FILE_CONTENT, fixes.TEXT_FILE_TYPE)
    t.is(rootFile.getParents().next().getId(), rootFolder.getId())
    t.is(rootFile.getMimeType(), fixes.TEXT_FILE_TYPE)
    t.is(rootFile.getBlob().getDataAsString(), fixes.TEXT_FILE_CONTENT)
    t.is(rootFile.getName(), rname)
    const checkFile = DriveApp.getFileById(rootFile.getId())
    t.deepEqual(checkFile.getBlob().getBytes(), rootFile.getBlob().getBytes())
    t.deepEqual(checkFile.getBlob().getBytes(), Utilities.newBlob(fixes.TEXT_FILE_CONTENT).getBytes())
    toTrash.push(rootFile)

    // cant create file by meta data only with DriveApp - so give it min required
    const mname = "m-" + rname
    const metaFile = rootFolder.createFile(mname, "")
    const mfile = Drive.Files.get(metaFile.getId(), { fields: "parents,id,name" })
    t.is(mfile.name, metaFile.getName())
    t.is(mfile.parents[0], rootFolder.getId())
    toTrash.push(metaFile)

    // folders
    const fname = "--folder--of-junk"
    const folder = DriveApp.createFolder(fname)
    const mfolder = DriveApp.getFolderById(folder.getId())
    t.is(mfolder.getId(), folder.getId())
    t.is(DriveApp.getFolderById(folder.getId()).getSize(), 0)
    toTrash.push(mfolder)

    // files in folders
    const img = UrlFetchApp.fetch(fixes.RANDOM_IMAGE)
    const blob = img.getBlob()
    const mffile = mfolder.createFile(blob)
    t.is(mffile.getParents().next().getId(), mfolder.getId())
    t.deepEqual(mffile.getBlob().getBytes(), blob.getBytes())
    t.is(mffile.getName(), blob.getName())
    t.is(mffile.getMimeType(), blob.getContentType())
    toTrash.push(mffile)

    // fetch it back with urlfetch
    const token = ScriptApp.getOAuthToken()
    t.true(is.nonEmptyString(token))
    const headers = {
      Authorization: `Bearer ${token}`
    }
    // can we use the url to download
    const r = Drive.Files.download(mffile.getId())
    const response = UrlFetchApp.fetch(r.response.downloadUri, { headers })
    const rblob = response.getBlob()
    t.deepEqual(rblob.getBytes(), blob.getBytes())
    const rmffile = DriveApp.getFileById(mffile.getId())
    t.deepEqual(rblob.getBytes(), rmffile.getBlob().getBytes())
    t.is(rblob.getContentType(), rmffile.getMimeType())
    const dr = DriveApp.getFileById(mffile.getId())
    t.deepEqual(dr.getBlob().getBytes(), blob.getBytes())
    t.is(dr.getName(), mffile.getName())
    t.is(dr.getSize(), mffile.getSize())
    t.is(dr.getName(), mffile.getName())
    t.is(dr.getParents().next().getId(), mffile.getParents().next().getId())
    t.is(dr.getParents().next().getId(), mfolder.getId())

    // check errors are thrown
    t.rxMatch(t.threw(() => DriveApp.createFile()).toString(), /The parameters \(\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile("")).toString(), /The parameters \(String\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile(null, "")).toString(), /Invalid argument: name/)
    t.rxMatch(t.threw(() => DriveApp.createFile(blob, "")).toString(), /The parameters \(Blob,String\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile(mname)).toString(), /The parameters \(String\)/)
    t.rxMatch(t.threw(() => DriveApp.createFile(Utilities.newBlob(""))).toString(), /Blob object must have non-null name for this operation./)

    if (fixes.CLEAN) toTrash.forEach(f => f.setTrashed(true))
    if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())
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


  unit.section('drive thumbnails', t => {

    const df = Drive.Files.get(fixes.TEXT_FILE_ID, { fields: "id,hasThumbnail,thumbnailLink" })
    const af = DriveApp.getFileById(fixes.TEXT_FILE_ID)
    t.is(df.id, af.getId())
    t.true(df.hasThumbnail)
    t.true(is.nonEmptyString(df.thumbnailLink))

    // now try with a spreadsheet
    const tdf = Drive.Files.get(fixes.TEST_SHEET_ID, { fields: "id,hasThumbnail,thumbnailLink" })
    const taf = DriveApp.getFileById(fixes.TEST_SHEET_ID)
    t.is(tdf.id, taf.getId())
    t.true(tdf.hasThumbnail)
    t.true(is.nonEmptyString(tdf.thumbnailLink))
    const tblob = taf.getThumbnail()
    t.true(is.array(tblob.getBytes()))

    // now fetch it with the link and check the same as returned by get thumbnail
    const ublob = UrlFetchApp.fetch(tdf.thumbnailLink).getBlob()
    t.true(is.array(ublob.getBytes()))
    // this test doesnt work because thumbnail returns a compressed version, whereas the link itself is not compressed
    // t.deepEqual (tblob.getBytes(), ublob.getBytes())


  })


  unit.section('urlfetchapp external and blobs', t => {
    const img = UrlFetchApp.fetch(fixes.RANDOM_IMAGE)
    const blob = img.getBlob()
    t.true(is.nonEmptyString(blob.getName()))
    t.is(blob.getContentType(), 'image/jpeg', 'assumes the random image is a jpeg')
    t.true(is.array(blob.getBytes()))

    // to an api fetch
    const text = UrlFetchApp.fetch(fixes.API_URL)
    const textBlob = text.getBlob()
    t.deepEqual(JSON.parse(textBlob.getDataAsString()), JSON.parse(text.getContentText()))
    t.true(is.array(JSON.parse(text.getContentText())))
    t.is(textBlob.getContentType(), fixes.API_TYPE, 'expected this be application/json but suggest actually returns this')
    t.true(is.nonEmptyString(textBlob.getName()))

  })


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

    t.is(file.getDownloadUrl(), Drive.Files.get(file.getId(), { fields: "webContentLink" }).webContentLink)

    if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())

  })

  unit.section('adv drive downloads', t => {
    const r = Drive.Files.download(fixes.TEXT_FILE_ID)
    t.true(is.object(r.metadata))
    t.true(is.nonEmptyString(r.name))
    t.true(is.nonEmptyObject(r.response))
    t.true(is.nonEmptyString(r.response.downloadUri))


    const token = ScriptApp.getOAuthToken()
    t.true(is.nonEmptyString(token))
    const headers = {
      Authorization: `Bearer ${token}`
    }

    // can we use the url to download
    const response = UrlFetchApp.fetch(r.response.downloadUri, { headers })
    t.is(response.getResponseCode(), 200)
    t.true(is.object(response.getHeaders()))
    const text = response.getContentText()
    t.is(text, fixes.TEXT_FILE_CONTENT)

    // and driveapp to compare and do the same things
    const aFile = Drive.Files.get(fixes.TEXT_FILE_ID)
    const file = DriveApp.getFileById(fixes.TEXT_FILE_ID)
    const blob = file.getBlob()
    t.is(blob.getName(), aFile.name)
    t.is(blob.getDataAsString(), text)
    t.is(file.getId(), aFile.id)
    t.deepEqual(response.getBlob().getBytes(), blob.getBytes())

  })

  unit.section('check where google doesnt support in adv drive', t => {
    t.rxMatch(t.threw(() => Drive.Operations.list()).toString(), /is not implemented, or supported, or enabled/)

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
    if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())
  })


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


  unit.section('fake helper tests', t => {
    const s1 = "fields(f1,f2),a1,t2,permissions(p1,p2)"
    const s2 = "t1,t2,t3,permissions(p1,p3)"
    const s3 = "fields(f1,f3),t3,t4,t1"
    const expect = "a1,fields(f1,f2,f3),permissions(p1,p2,p3),t1,t2,t3,t4"
    t.is(mergeParamStrings(s1, s2, s3), expect)
    t.is(mergeParamStrings(s1, s2, s3, s1), expect, 'check exact dups are allowed')

    try {
      t.is(mergeParamStrings(s1, s2, s3, s1, "fields"), expect, "this should fail because of different roles for fields")
    }
    catch (err) {
      t.rxMatch(err.toString(), /^TypeError:/)
    }


  }, {
    skip: !ScriptApp.isFake
  })

  unit.section('adv drive Apps - drive.apps script is blocked on adc so cant test this for now', t => {
    const { items } = Drive.Apps.list()
    t.true(is.array(items))
    const [i0] = items
    console.log(i0)
    t.deepEqual(Drive.Apps.get(i0.id), i0)
  }, {
    skip: true
  })

  unit.section("spreadsheetapp basics", t => {
    const ass = Sheets.Spreadsheets.get(fixes.TEST_SHEET_ID)
    const ss = SpreadsheetApp.openById(fixes.TEST_SHEET_ID)
    t.is(ss.getId(), fixes.TEST_SHEET_ID)
    t.is(ss.getName(), fixes.TEST_SHEET_NAME)
    t.is(ss.getNumSheets(), ass.sheets.length)
    const sheets = ss.getSheets()
    t.is(sheets.length, ass.sheets.length)

    sheets.forEach((s, i) => {
      t.is(s.getName(), ass.sheets[i].properties.title)
      t.is(s.getSheetId(), ass.sheets[i].properties.sheetId)
      t.is(s.getIndex(), i + 1)
      t.true(is.number(s.getSheetId()))
      t.is(s.getName(), s.getSheetName())
      t.is(s.getMaxColumns(), ass.sheets[i].properties.gridProperties.columnCount)
      t.is(s.getMaxRows(), ass.sheets[i].properties.gridProperties.rowCount)
      t.is(s.getType().toString(), ass.sheets[i].properties.sheetType)
      t.is(ss.getSheetById(s.getSheetId()).getName(), s.getName())
      t.is(ss.getSheetByName(s.getName()).getSheetId(), s.getSheetId())
    })


    t.is(ss.getId(), ss.getKey())
    t.is(ss.getSheetId(), sheets[0].getSheetId())
    t.is(ss.getSheetName(), sheets[0].getName())
  })


  unit.section("session properties", t => {
    t.is(Session.getActiveUser().toString(), fixes.EMAIL)
    t.is(Session.getActiveUser().getEmail(), fixes.EMAIL)
    t.is(Session.getEffectiveUser().getEmail(), fixes.EMAIL)
    t.is(Session.getActiveUserLocale(), fixes.LOCALE)
    t.is(Session.getScriptTimeZone(), fixes.TIMEZONE)
    t.true(is.nonEmptyString(Session.getTemporaryActiveUserKey()))
  }, {
    skip: true
  })





  if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())
  unit.report()
}

// this required on Node but not on Apps Script
if (ScriptApp.isFake) testFakes()
