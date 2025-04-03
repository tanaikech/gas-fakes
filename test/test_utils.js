
// all these imports 
// this is loaded by npm, but is a library on Apps Script side
import { Exports as unitExports } from '@mcpher/unit'
import is from '@sindresorhus/is';
import { getPerformance } from '../src/support/filecache.js';
import { mergeParamStrings } from '../src/support/utils.js';
// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import '../main.js'

const testUtilFakes = () => {

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
    CLEAN: process.env.CLEAN === 'true',
    SHA_KEY: 'this is my input',
    SHA_VALUE: 'my key - use a stronger one',
  }

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

  unit.section("utilities hmac", t => {
    const input = fixes.SHA_VALUE;
    const key = fixes.SHA_KEY; 
    const expected_result = [
      -33,  110, -120,   90,  18,  75,   41,
      -33, -124,  -81,  -48,  77, 105, -100,
      83,   -7,   48,  -75,  20,   0,  -43,
      46,   87,  -39, -125, -97, 127,  -75,
      -67,   73,   12,   12
    ]
    const signature = Utilities.computeHmacSha256Signature(input, key);

    t.is(signature.length, expected_result.length)
    t.deepEqual(signature, expected_result)
  

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
}

// this required on Node but not on Apps Script
if (ScriptApp.isFake) testUtilFakes()
