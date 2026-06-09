import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest } from './testassist.js';

export const testScriptApp = (pack) => {
  const { unit, fixes } = pack || initTests();

  unit.section('ScriptApp Basics', (t) => {
    t.is(typeof ScriptApp.getScriptId(), 'string', 'getScriptId should return a string');
    
    // AuthMode
    t.is(ScriptApp.AuthMode.NONE.toString(), 'NONE', 'AuthMode.NONE should be NONE');
    t.is(ScriptApp.AuthMode.CUSTOM_FUNCTION.toString(), 'CUSTOM_FUNCTION', 'AuthMode.CUSTOM_FUNCTION should be CUSTOM_FUNCTION');
    t.is(ScriptApp.AuthMode.LIMITED.toString(), 'LIMITED', 'AuthMode.LIMITED should be LIMITED');
    t.is(ScriptApp.AuthMode.FULL.toString(), 'FULL', 'AuthMode.FULL should be FULL');

    // AuthorizationStatus
    t.is(ScriptApp.AuthorizationStatus.REQUIRED.toString(), 'REQUIRED', 'AuthorizationStatus.REQUIRED should be REQUIRED');
    t.is(ScriptApp.AuthorizationStatus.NOT_REQUIRED.toString(), 'NOT_REQUIRED', 'AuthorizationStatus.NOT_REQUIRED should be NOT_REQUIRED');

    // TriggerSource
    t.is(ScriptApp.TriggerSource.CALENDAR.toString(), 'CALENDAR', 'TriggerSource.CALENDAR should be CALENDAR');
    t.is(ScriptApp.TriggerSource.CLOCK.toString(), 'CLOCK', 'TriggerSource.CLOCK should be CLOCK');
    t.is(ScriptApp.TriggerSource.DOCUMENTS.toString(), 'DOCUMENTS', 'TriggerSource.DOCUMENTS should be DOCUMENTS');
    t.is(ScriptApp.TriggerSource.FORMS.toString(), 'FORMS', 'TriggerSource.FORMS should be FORMS');
    t.is(ScriptApp.TriggerSource.SPREADSHEETS.toString(), 'SPREADSHEETS', 'TriggerSource.SPREADSHEETS should be SPREADSHEETS');

    // EventType
    t.is(ScriptApp.EventType.CLOCK.toString(), 'CLOCK', 'EventType.CLOCK should be CLOCK');
    t.is(ScriptApp.EventType.ON_OPEN.toString(), 'ON_OPEN', 'EventType.ON_OPEN should be ON_OPEN');
    t.is(ScriptApp.EventType.ON_EDIT.toString(), 'ON_EDIT', 'EventType.ON_EDIT should be ON_EDIT');
    t.is(ScriptApp.EventType.ON_FORM_SUBMIT.toString(), 'ON_FORM_SUBMIT', 'EventType.ON_FORM_SUBMIT should be ON_FORM_SUBMIT');
    t.is(ScriptApp.EventType.ON_CHANGE.toString(), 'ON_CHANGE', 'EventType.ON_CHANGE should be ON_CHANGE');
    t.is(ScriptApp.EventType.ON_EVENT_UPDATED.toString(), 'ON_EVENT_UPDATED', 'EventType.ON_EVENT_UPDATED should be ON_EVENT_UPDATED');

    // InstallationSource
    t.is(ScriptApp.InstallationSource.APPS_MARKETPLACE_DOMAIN_ADD_ON.toString(), 'APPS_MARKETPLACE_DOMAIN_ADD_ON', 'InstallationSource.APPS_MARKETPLACE_DOMAIN_ADD_ON should be APPS_MARKETPLACE_DOMAIN_ADD_ON');
    t.is(ScriptApp.InstallationSource.NONE.toString(), 'NONE', 'InstallationSource.NONE should be NONE');
    t.is(ScriptApp.InstallationSource.WEB_STORE_ADD_ON.toString(), 'WEB_STORE_ADD_ON', 'InstallationSource.WEB_STORE_ADD_ON should be WEB_STORE_ADD_ON');
  });

  unit.section('ScriptApp.getAuthorizationInfo', (t) => {
    const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    t.truthy(authInfo, 'getAuthorizationInfo should return an object');
    t.is(typeof authInfo.getAuthorizationStatus, 'function', 'getAuthorizationStatus should be a function');
    t.is(typeof authInfo.getAuthorizationUrl, 'function', 'getAuthorizationUrl should be a function');
    
    t.is(authInfo.getAuthorizationStatus().toString(), ScriptApp.AuthorizationStatus.NOT_REQUIRED.toString(), 'AuthorizationStatus should be NOT_REQUIRED locally');
    t.is(authInfo.getAuthorizationUrl(), "", 'AuthorizationUrl should be empty string when not required');
  });

  if (!pack) unit.report();
  return { unit, fixes };
};

wrapupTest(testScriptApp);
