import { Proxies } from '../../support/proxies.js';

export const newFakePictureFill = (...args) => {
  return Proxies.guard(new FakePictureFill(...args));
};

export class FakePictureFill {
  constructor(resource, page) {
    this.__resource = resource;
    this.__page = page;
  }

  getAs(contentType) {
    return this.getBlob().getAs(contentType);
  }

  getBlob() {
    return UrlFetchApp.fetch(this.getContentUrl()).getBlob();
  }

  getContentUrl() {
    return this.__resource.contentUrl || '';
  }

  getSourceUrl() {
    return this.__resource.sourceUrl || '';
  }

  toString() {
    return 'PictureFill';
  }
}
