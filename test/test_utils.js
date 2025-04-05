
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
  }

  unit.section("utilities hmac", t => {
    // setup tests for simple text
    const text_input = 'this is my input';
    const text_key = 'my key - use a stronger one';
    const expected_signature = [53,-75,-52,-25,-47,86,-21,14,-2,-57,5,-13,24,105,-2,-84,127,115,-40,-75,-93,-27,-21,34,-55,-117,-36,-103,-47,116,-55,-61];
    let actual_signature = [];
    
    // test byte array
    const byte_input = Utilities.newBlob(text_input).getBytes();
    const byte_key = Utilities.newBlob(text_key).getBytes();
    actual_signature = Utilities.computeHmacSha256Signature(byte_input, byte_key);
    t.is(actual_signature.length, expected_signature.length);
    t.deepEqual(actual_signature, expected_signature);

    // test text, with utf8 charset
    actual_signature = Utilities.computeHmacSha256Signature(text_input, text_key, Utilities.Charset.UTF_8);
    t.is(actual_signature.length, expected_signature.length);
    t.deepEqual(actual_signature, expected_signature);

    // test text, with ascii charset
    actual_signature = Utilities.computeHmacSha256Signature(text_input, text_key, Utilities.Charset.US_ASCII);
    t.is(actual_signature.length, expected_signature.length);
    t.deepEqual(actual_signature, expected_signature);

    // test text, no explicit charset (should be same as utf8)
    actual_signature = Utilities.computeHmacSha256Signature(text_input, text_key);
    t.is(actual_signature.length, expected_signature.length);
    t.deepEqual(actual_signature, expected_signature);

    // setup tests for special text, that won't be encoded by utf8
    const text_input_special = 'café';
    const text_key_special = '€🙂';
    const expected_utf_special_signature = [76,-16,35,99,-128,106,-22,-17,-102,-19,4,97,-75,64,107,79,99,19,-54,-6,90,54,121,-39,-126,13,2,-40,-84,109,-2,115];
    const expected_ascii_special_signature = [-125,73,-127,-128,-43,-39,99,-10,39,-49,-128,27,8,-117,4,-120,-26,-111,16,114,-115,1,-1,-68,-27,88,7,117,55,-87,-123,-52];

    // test special text, with utf8 charset
    actual_signature = Utilities.computeHmacSha256Signature(text_input_special, text_key_special, Utilities.Charset.UTF_8);
    t.is(actual_signature.length, expected_utf_special_signature.length);
    t.deepEqual(actual_signature, expected_utf_special_signature);

    // test special text, with ascii charset
    actual_signature = Utilities.computeHmacSha256Signature(text_input_special, text_key_special, Utilities.Charset.US_ASCII);
    t.is(actual_signature.length, expected_ascii_special_signature.length);
    t.deepEqual(actual_signature, expected_ascii_special_signature);

    // test special text for input and key, no explicit charset
    actual_signature = Utilities.computeHmacSha256Signature(text_input_special, text_key_special);
    t.is(actual_signature.length, expected_ascii_special_signature.length);
    t.deepEqual(actual_signature, expected_ascii_special_signature);

    // setup tests for special/regular text mix
    const expected_special_input_signature = [-108,-2,-46,-84,68,-4,60,-105,-65,-90,-43,1,-112,-23,-79,50,-78,35,-9,-122,39,-83,115,-55,91,61,82,47,61,53,-37,14];
    const expected_special_key_signature = [13,-56,-124,-48,98,-74,-49,56,-110,64,-48,-17,-110,112,-60,-18,59,-30,77,49,-95,122,-47,-73,-32,-127,-61,-30,111,108,34,-39];
    
    // test special text for input not key, no explicit charset
    actual_signature = Utilities.computeHmacSha256Signature(text_input_special, text_key);
    t.is(actual_signature.length, expected_special_input_signature.length);
    t.deepEqual(actual_signature, expected_special_input_signature);

    // test special text for key not input, no explicit charset
    actual_signature = Utilities.computeHmacSha256Signature(text_input, text_key_special);
    t.is(actual_signature.length, expected_special_key_signature.length);
    t.deepEqual(actual_signature, expected_special_key_signature);

    // TODO these do not work yet
    // bad parameters: number[], string
    const bad_params_bytes_with_string = () => Utilities.computeHmacSha256Signature(byte_input, text_key);
    //t.rxMatch(t.threw(bad_params_bytes_with_string), /The parameters \(\) don't match/);

    // bad parameters: string, number[]
    const bad_params_string_with_bytes = () => Utilities.computeHmacSha256Signature(text_input, byte_key);
    //t.rxMatch(t.threw(bad_params_string_with_bytes), /The parameters \(\) don't match/);
    
    // bad parameters: number[], number[], charset
    const bad_params_bytes_with_charset = () => Utilities.computeHmacSha256Signature(byte_input, byte_key, Utilities.Charset.UTF_8);
    //t.rxMatch(t.threw(bad_params_bytes_with_charset).toString(), /The parameters \(\) don't match/);

    // bad parameters: string, string, fake charset
    const bad_params_fake_charset = () => Utilities.computeHmacSha256Signature(text_input, text_key, 'fake');
    //t.rxMatch(t.threw(bad_params_fake_charset).toString(), /The parameters \(\) don't match/);


  })

}

// this required on Node but not on Apps Script
if (ScriptApp.isFake) testUtilFakes()
