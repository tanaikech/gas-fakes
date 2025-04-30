
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests }  from  './testinit.js'

const DigestAlgorithm = Utilities.DigestAlgorithm;
const Charset = Utilities.Charset;

const algorithmMap = {
  md5: DigestAlgorithm.MD5,
  sha1: DigestAlgorithm.SHA_1,
  sha256: DigestAlgorithm.SHA_256,
  sha384: DigestAlgorithm.SHA_384,
  sha512: DigestAlgorithm.SHA_512
};

const charsetMap = {
  UTF_8: Charset.UTF_8,
  US_ASCII: Charset.US_ASCII
};

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
    // too many arguments: string, string, charset, number
    const too_many_args = () => Utilities.computeHmacSha256Signature(text_input, text_key, Utilities.Charset.US_ASCII, 4);
    t.rxMatch(t.threw(too_many_args).toString(), /The parameters \(.*\) don't match/);

    // too few arguments: string
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

    // bad parameters: array but not numbers
    const bad_bytes = Utilities.newBlob(text_input).getBytes().map((el) => '' + el + 'woah');
    const bad_params_bad_bytes1 = () => Utilities.computeHmacSha256Signature(bad_bytes, byte_key);
    t.rxMatch(t.threw(bad_params_bad_bytes1).toString(), /Cannot convert .*/);
    const bad_params_bad_bytes2 = () => Utilities.computeHmacSha256Signature(byte_input, bad_bytes);
    t.rxMatch(t.threw(bad_params_bad_bytes2).toString(), /Cannot convert .*/);
    


  })

  unit.section("utilities digest", t => {
    const test_inputs = ['input to hash', '€🙂'];
    const charsets = Object.keys(charsetMap);
    const algorithms = Object.keys(algorithmMap);
    const expected_digests = {
      'input to hash': {
        UTF_8: {
          md5: [-16,-20,-112,64,-50,-47,-118,102,-113,70,-112,94,-34,-49,117,-103],
          sha1: [-94,-96,117,87,84,-100,-66,98,-21,-116,87,55,93,-82,-11,-73,79,108,-115,95],
          sha256: [54,-72,-70,-64,23,78,-86,57,-77,-65,45,3,-95,47,-122,55,-91,107,-91,39,-55,20,-87,-65,-17,29,111,118,-120,-69,93,-93],
          sha384: [85,-35,-41,-89,-113,43,117,-109,-90,112,2,-70,-89,-43,117,61,62,85,17,49,65,43,-108,-78,-8,16,-71,-12,64,98,42,54,-16,30,18,-112,58,110,-7,-35,40,7,103,-95,94,-51,11,-69],
          sha512: [11,81,116,39,-41,-64,-61,121,84,87,85,121,55,-13,80,101,-103,52,-5,-73,62,107,-33,43,26,-15,-93,113,-116,78,-58,93,-40,70,65,-82,117,116,95,-14,-12,-13,21,1,104,91,-96,100,22,81,-104,-72,2,-103,-10,-25,-62,-98,-68,-12,57,127,43,121]
        },
        US_ASCII: {
          md5: [-16,-20,-112,64,-50,-47,-118,102,-113,70,-112,94,-34,-49,117,-103],
          sha1: [-94,-96,117,87,84,-100,-66,98,-21,-116,87,55,93,-82,-11,-73,79,108,-115,95],
          sha256: [54,-72,-70,-64,23,78,-86,57,-77,-65,45,3,-95,47,-122,55,-91,107,-91,39,-55,20,-87,-65,-17,29,111,118,-120,-69,93,-93],
          sha384: [85,-35,-41,-89,-113,43,117,-109,-90,112,2,-70,-89,-43,117,61,62,85,17,49,65,43,-108,-78,-8,16,-71,-12,64,98,42,54,-16,30,18,-112,58,110,-7,-35,40,7,103,-95,94,-51,11,-69],
          sha512: [11,81,116,39,-41,-64,-61,121,84,87,85,121,55,-13,80,101,-103,52,-5,-73,62,107,-33,43,26,-15,-93,113,-116,78,-58,93,-40,70,65,-82,117,116,95,-14,-12,-13,21,1,104,91,-96,100,22,81,-104,-72,2,-103,-10,-25,-62,-98,-68,-12,57,127,43,121]
        }
      },
      '€🙂': {
        UTF_8: {
          md5: [-71,89,42,-99,35,-63,-51,-82,83,46,87,-53,-35,-67,116,-6],
          sha1: [-19,-37,-55,-43,37,16,-31,77,89,112,42,90,-115,10,-113,-31,50,-76,60,-125],
          sha256: [-88,113,-56,11,33,65,-120,-22,68,-108,-12,96,79,31,50,2,75,2,-11,-5,66,40,-63,3,-102,83,87,-120,26,19,-18,-69],
          sha384: [-91,-38,-80,-12,-109,-108,-82,-64,44,-110,-48,-77,104,-66,52,-124,-67,44,8,-88,-68,17,-61,45,-115,65,-61,-83,-7,119,-28,-104,-55,52,-45,102,-22,-124,77,103,37,48,31,-55,74,-16,119,-41],
          sha512: [63,-102,-12,-120,79,25,110,21,45,2,-63,-126,1,-52,94,105,99,-38,30,123,88,63,-2,-38,-45,92,-95,123,3,-122,-83,-112,-45,-9,-112,121,-77,73,69,30,55,115,-13,-121,-94,-118,77,54,-50,95,-31,-46,-99,49,-90,43,103,60,24,73,-116,111,-5,94]
        },
        US_ASCII: {
          md5: [-22,3,-4,-72,-60,120,34,-68,-25,114,-49,108,7,-48,-21,-69],
          sha1: [22,-56,-8,-84,123,87,-67,91,88,-76,19,39,34,-114,63,-94,18,1,-37,104],
          sha256: [-30,112,-82,-77,71,-14,22,85,116,-61,-91,-59,-65,17,-48,56,-68,-45,-84,-43,-85,-3,-75,-82,-118,27,82,-39,28,-72,66,-16],
          sha384: [86,65,19,-74,-67,66,74,18,-37,-117,31,-124,102,-72,96,118,33,-111,37,59,-104,-30,102,9,-98,85,38,-103,-5,-122,-35,2,17,79,-59,-80,-48,-51,-96,-100,81,113,22,-33,122,28,31,64],
          sha512: [-70,-99,100,-111,115,-41,-1,-55,-41,84,-62,-97,80,-40,-12,93,54,24,60,2,-24,124,-37,-111,93,78,-70,-99,57,114,-75,-14,88,-77,-23,34,74,26,90,72,-125,78,-119,-22,-79,109,21,-62,121,38,-27,87,-106,-110,28,-93,-49,-44,58,124,-65,71,-83,92]
        }
      }
    };

    // test string values, charset is explicity set
    for (const input of test_inputs) {
      for (const charset of charsets) {
        for (const algorithm of algorithms) {
          const expected_digest = expected_digests[input][charset][algorithm];
          const actual_digest = Utilities.computeDigest(algorithmMap[algorithm], input, charsetMap[charset]);
          t.is(actual_digest.length, expected_digest.length);
          t.deepEqual(actual_digest, expected_digest)
        }
      }
    }

    // test string values, no charset is set
    // default charset is US_ASCII
    let default_charset = "US_ASCII"
    for (const input of test_inputs) {
      for (const algorithm of algorithms) {
        const expected_digest = expected_digests[input][default_charset][algorithm];
        const actual_digest = Utilities.computeDigest(algorithmMap[algorithm], input);
        t.is(actual_digest.length, expected_digest.length);
        t.deepEqual(actual_digest, expected_digest)
      }
    }

    // test byte values, default charset is now UTF_8
    default_charset = "UTF_8"
    const text_to_byte = {};
    test_inputs.forEach((text) => text_to_byte[text] = Utilities.newBlob(text).getBytes());

    for (const [text_input, byte_input] of Object.entries(text_to_byte)) {
      for (const algorithm of algorithms) {
        const expected_digest = expected_digests[text_input][default_charset][algorithm];
        const actual_digest = Utilities.computeDigest(algorithmMap[algorithm], byte_input);
        t.is(actual_digest.length, expected_digest.length);
        t.deepEqual(actual_digest, expected_digest)
      }
    }

    // test arguments that are not valid
    // too many arguments: digest, string, charset, number
    const too_many_args = () => Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, test_inputs[0], Utilities.Charset.US_ASCII, 4);
    t.rxMatch(t.threw(too_many_args).toString(), /The parameters \(.*\) don't match/);

    // too few arguments: string
    const too_few_args = () => Utilities.computeDigest(test_inputs[0]);
    t.rxMatch(t.threw(too_few_args).toString(), /The parameters \(.*\) don't match/);

    // bad parameters: digest, byte, charset
    const bad_params_bytes_with_charset = () => Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, [0, 1, 2], Utilities.Charset.UTF_8);
    t.rxMatch(t.threw(bad_params_bytes_with_charset).toString(), /The parameters \(.*\) don't match/);

    // bad parameters: digest, string, fake charset
    const bad_params_fake_charset = () => Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, test_inputs[0], 'fake');
    t.rxMatch(t.threw(bad_params_fake_charset).toString(), /The parameters \(.*\) don't match/);

    // bad parameters: fake digest, string, charset
    const bad_params_fake_digest = () => Utilities.computeDigest('fake', test_inputs[0], Utilities.Charset.US_ASCII);
    t.rxMatch(t.threw(bad_params_fake_digest).toString(), /The parameters \(.*\) don't match/);

    // bad parameters: array but not numbers
    //TODO: not working on apps script
    const bad_bytes = Utilities.newBlob(test_inputs[0]).getBytes().map((el) => '' + el + 'bad');
    const bad_params_bad_bytes1 = () => Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, bad_bytes, Utilities.Charset.UTF_8);
    t.rxMatch(t.threw(bad_params_bad_bytes1).toString(), /Cannot convert .*/);

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
