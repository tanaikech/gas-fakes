import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest } from './testassist.js';

export const testScriptApp = (pack) => {
  const { unit, fixes } = pack || initTests();

  unit.section('ScriptApp Basics', (t) => {
    t.is(typeof ScriptApp.getScriptId(), 'string', 'getScriptId should return a string');
    t.is(ScriptApp.AuthMode.FULL, 'FULL', 'AuthMode.FULL should be FULL');
  });

  unit.section('ScriptApp.getAuthorizationInfo', (t) => {
    const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    t.truthy(authInfo, 'getAuthorizationInfo should return an object');
    t.is(typeof authInfo.getAuthorizationStatus, 'function', 'getAuthorizationStatus should be a function');
    t.is(typeof authInfo.getAuthorizationUrl, 'function', 'getAuthorizationUrl should be a function');
    
    t.is(authInfo.getAuthorizationStatus(), ScriptApp.AuthorizationStatus.NOT_REQUIRED, 'AuthorizationStatus should be NOT_REQUIRED locally');
    t.is(authInfo.getAuthorizationUrl(), null, 'AuthorizationUrl should be null locally');
  });

  if (!pack) unit.report();
  return { unit, fixes };
};

wrapupTest(testScriptApp);
