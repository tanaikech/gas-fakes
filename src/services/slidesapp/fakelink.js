import { Proxies } from '../../support/proxies.js';

export const newFakeLink = (...args) => {
  return Proxies.guard(new FakeLink(...args));
};

export class FakeLink {
  constructor(resource, presentation) {
    this.__resource = resource;
    this.__presentation = presentation;
  }

  getLinkType() {
    if (this.__resource.url) return 'URL';
    if (this.__resource.slideId) return 'SLIDE_ID';
    if (this.__resource.pageObjectId) return 'PAGE_OBJECT_ID';
    if (this.__resource.relativeSlide) return 'RELATIVE_SLIDE';
    return 'NONE';
  }

  getLinkedSlide() {
    const slideId = this.getSlideId();
    return slideId ? this.__presentation.getSlideById(slideId) : null;
  }

  getSlideId() {
    return this.__resource.slideId || null;
  }

  getSlideIndex() {
    // Requires iterating slides to find index.
    const slideId = this.getSlideId();
    if (!slideId) return null;
    return this.__presentation.getSlides().findIndex(s => s.getObjectId() === slideId);
  }

  getSlidePosition() {
    return this.__resource.relativeSlide || null;
  }

  getUrl() {
    return this.__resource.url || null;
  }

  toString() {
    return 'Link';
  }
}
