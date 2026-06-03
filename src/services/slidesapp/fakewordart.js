import { Proxies } from '../../support/proxies.js';
import { FakePageElement, PageElementRegistry } from './fakepageelement.js';

export const newFakeWordArt = (...args) => {
  return Proxies.guard(new FakeWordArt(...args));
};

PageElementRegistry.newFakeWordArt = newFakeWordArt;

export class FakeWordArt extends FakePageElement {
  constructor(resource, page) {
    super(resource, page);
  }

  getRenderedText() {
    return this.__resource.wordArt?.renderedText || '';
  }

  toString() {
    return 'WordArt';
  }
}
