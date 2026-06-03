import { Proxies } from '../../support/proxies.js';
import { FakePageElement, PageElementRegistry } from './fakepageelement.js';

export const newFakeVideo = (...args) => {
  return Proxies.guard(new FakeVideo(...args));
};

PageElementRegistry.newFakeVideo = newFakeVideo;

export class FakeVideo extends FakePageElement {
  constructor(resource, page) {
    super(resource, page);
  }

  getSource() {
    return this.__resource.video?.source || 'UNSUPPORTED';
  }

  getThumbnailUrl() {
    // API returns this in video resource
    return `https://img.youtube.com/vi/${this.getVideoId()}/0.jpg`;
  }

  getUrl() {
    return this.__resource.video?.url || '';
  }

  getVideoId() {
    return this.__resource.video?.id || '';
  }

  toString() {
    return 'Video';
  }
}
