import { Proxies } from '../../../support/proxies.js';
import { newShadowBody } from './body.js';


export const newShadowDocument = (...args) => {
  return Proxies.guard(new ShadowDocument (...args));
};

class ShadowDocument {
  constructor(id) {
    this.__id = id
  }

  // this looks expensive, but the document wil always be in case unless its been updated
  // in which case we have to get it anyway
  get resource() {
    return Docs.Documents.get(this.__id)
  }
  // the file representation is required for some operations
  get file() {
    return DriveApp.getFileById(this.__id)
  }

  get shadowBody() {
    return newShadowBody (this, this.resource.body)
  }
  
}