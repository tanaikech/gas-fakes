import { Proxies } from '../../support/proxies.js';
export const newFakeDocumentBase = (...args) => {
  return Proxies.guard(new FakeDocumentBase(...args));
};
export class FakeDocumentBase {
  constructor(id) {
    this.__id = id
  }

  // this looks expensive, but the document wil always be in case unless its been updated
  // in which case we have to get it anyway
  get __resource () {
    return Docs.Documents.get (this.__id)
  }
  // the file representation is required for some operations
  get __file () {
    return DriveApp.getFileById(this.__id)
  }

}