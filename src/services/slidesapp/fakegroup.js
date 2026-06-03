import { Proxies } from '../../support/proxies.js';
import { FakePageElement, PageElementRegistry } from './fakepageelement.js';

export const newFakeGroup = (...args) => {
  return Proxies.guard(new FakeGroup(...args));
};

PageElementRegistry.newFakeGroup = newFakeGroup;

export class FakeGroup extends FakePageElement {
  constructor(resource, page) {
    super(resource, page);
  }

  getChildren() {
    const children = this.__resource.elementGroup?.children || this.__resource.group?.children || [];
    const { newFakePageElement } = PageElementRegistry;
    return children.map(childResource => {
      return newFakePageElement(childResource, this.__page);
    });
  }

  ungroup() {
    const presentationId = this.__page.__presentation?.getId() || this.__page.__slide?.__presentation.getId();
    Slides.Presentations.batchUpdate({ requests: [{
      ungroupObjects: {
        objectIds: [this.getObjectId()]
      }
    }] }, presentationId);
  }

  toString() {
    return 'Group';
  }
}
