import { Proxies } from '../../support/proxies.js';

export const newFakeLink = (...args) => {
  return Proxies.guard(new FakeLink(...args));
};

export class FakeLink {
  constructor(resource) {
    this.__resource = resource;
  }

  getLinkType() {
    if (this.__resource.url) return 'URL';
    if (this.__resource.slideId) return 'SLIDE_ID';
    if (this.__resource.pageObjectId) return 'PAGE_OBJECT_ID';
    if (this.__resource.relativeSlide) return 'RELATIVE_SLIDE';
    return 'NONE';
  }

  getUrl() {
    return this.__resource.url || null;
  }

  getSlideId() {
    return this.__resource.slideId || null;
  }

  toString() {
    return 'Link';
  }
}
