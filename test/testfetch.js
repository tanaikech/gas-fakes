
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '@mcpher/gas-fakes'
import { wrapupTest } from './testassist.js';

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testFetch = (pack) => {
  const { unit, fixes } = pack || initTests()

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

  unit.section('urlfetchapp fetchAll', t => {
    const requests = [
      { url: fixes.API_URL },
      { url: fixes.RANDOM_IMAGE }
    ];
    const responses = UrlFetchApp.fetchAll(requests);
    t.is(responses.length, 2);
    t.is(responses[0].getResponseCode(), 200);
    t.is(responses[1].getResponseCode(), 200);
    t.is(responses[1].getBlob().getContentType(), 'image/jpeg', 'assumes the random image is a jpeg');
  });

  unit.section('urlfetchapp getRequest', t => {
    const url = 'https://api.github.com/users/brucemcpherson';
    
    // Test basic get
    const req1 = UrlFetchApp.getRequest(url);
    t.is(req1.url, url);
    t.is(req1.method, 'get');
    // On live GAS, headers might contain injected values like X-Forwarded-For
    if (ScriptApp.isFake) {
      t.deepEqual(req1.headers, {});
    } else {
      t.true(is.object(req1.headers), 'headers should be an object');
    }

    // Test with options
    const req2 = UrlFetchApp.getRequest(url, {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify({ hello: 'world' }),
      headers: { 'X-Custom': 'test' }
    });
    
    t.is(req2.url, url);
    t.is(req2.method, 'post');
    t.is(req2.contentType, 'application/json');
    t.is(req2.payload, '{"hello":"world"}');
    
    if (ScriptApp.isFake) {
      t.deepEqual(req2.headers, { 'X-Custom': 'test' });
    } else {
      t.is(req2.headers['X-Custom'], 'test', 'Custom header should be present');
    }
    
    // Test default content type for POST
    const req3 = UrlFetchApp.getRequest(url, {
      method: 'post'
    });
    t.is(req3.contentType, 'application/x-www-form-urlencoded', 'Default content type for POST should be application/x-www-form-urlencoded');
  });

  if (!pack) {
    unit.report()
  }
  return { unit, fixes }
}



wrapupTest(testFetch)