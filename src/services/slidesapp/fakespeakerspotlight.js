import { Proxies } from '../../support/proxies.js';
import { FakePageElement, PageElementRegistry } from './fakepageelement.js';

export const newFakeSpeakerSpotlight = (...args) => {
  return Proxies.guard(new FakeSpeakerSpotlight(...args));
};

PageElementRegistry.newFakeSpeakerSpotlight = newFakeSpeakerSpotlight;

export class FakeSpeakerSpotlight extends FakePageElement {
  constructor(resource, page) {
    super(resource, page);
  }

  toString() {
    return 'SpeakerSpotlight';
  }
}
