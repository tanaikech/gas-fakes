
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests }  from  './testinit.js'

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testUtilities = (pack) => {
  const {unit, fixes} = pack || initTests()

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

    // test arguments that are not valid
    // too many arguments: number[], string
    const too_many_args = () => Utilities.computeHmacSha256Signature(text_input, text_key, Utilities.Charset.US_ASCII, 4);
    t.rxMatch(t.threw(too_many_args).toString(), /The parameters \(.*\) don't match/);

    // too few arguments: number[], string
    const too_few_args = () => Utilities.computeHmacSha256Signature(text_input);
    t.rxMatch(t.threw(too_few_args).toString(), /The parameters \(.*\) don't match/);

    // bad parameters: number[], string
    const bad_params_bytes_with_string = () => Utilities.computeHmacSha256Signature(byte_input, text_key);
    t.rxMatch(t.threw(bad_params_bytes_with_string).toString(), /The parameters \(.*\) don't match/);

    // bad parameters: string, number[]
    const bad_params_string_with_bytes = () => Utilities.computeHmacSha256Signature(text_input, byte_key);
    t.rxMatch(t.threw(bad_params_string_with_bytes).toString(), /The parameters \(.*\) don't match/);
    
    // bad parameters: number[], number[], charset
    const bad_params_bytes_with_charset = () => Utilities.computeHmacSha256Signature(byte_input, byte_key, Utilities.Charset.UTF_8);
    t.rxMatch(t.threw(bad_params_bytes_with_charset).toString(), /The parameters \(.*\) don't match/);

    // bad parameters: string, string, fake charset
    const bad_params_fake_charset = () => Utilities.computeHmacSha256Signature(text_input, text_key, 'fake');
    t.rxMatch(t.threw(bad_params_fake_charset).toString(), /The parameters \(.*\) don't match/);


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

  if (!pack) {
    unit.report()
  }
  return { unit, fixes }
}

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute" 
// for example node testdrive.js execute
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testUtilities()
