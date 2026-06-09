import { AuthorizationStatus } from '../enums/scriptenums.js';

export class FakeAuthorizationInfo {
  constructor(authMode) {
    this._authMode = authMode;
  }

  getAuthorizationStatus() {
    // gas-fakes always handles auth out-of-band via CLI, 
    // so during script execution, we assume auth is not required.
    return AuthorizationStatus.NOT_REQUIRED;
  }

  getAuthorizationUrl() {
    // Return empty string since we don't require inline authorization, matching live Apps Script parity
    return "";
  }
}

export const newFakeAuthorizationInfo = (authMode) => {
  return new FakeAuthorizationInfo(authMode);
};
