import { ScriptEnums } from '../enums/scriptenums.js';

export class FakeAuthorizationInfo {
  constructor(authMode) {
    this._authMode = authMode;
  }

  getAuthorizationStatus() {
    // gas-fakes always handles auth out-of-band via CLI, 
    // so during script execution, we assume auth is not required.
    return ScriptEnums.AuthorizationStatus.NOT_REQUIRED;
  }

  getAuthorizationUrl() {
    // Return null since we don't require inline authorization
    return null;
  }
}

export const newFakeAuthorizationInfo = (authMode) => {
  return new FakeAuthorizationInfo(authMode);
};
