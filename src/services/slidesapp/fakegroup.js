import { Proxies } from '../../support/proxies.js';
import { FakePageElement, PageElementRegistry } from './fakepageelement.js';
import { asSpecificPageElement } from './pageelementfactory.js';

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
      const baseElement = newFakePageElement(childResource, this.__page);
      return asSpecificPageElement(baseElement);
    });
  }

  ungroup() {
    const presentationId = this.__page.__presentation?.getId() || this.__page.__slide?.__presentation.getId();
    Slides.Presentations.batchUpdate([{
      ungroupObjects: {
        objectIds: [this.getObjectId()]
      }
    }], presentationId);
  }

  toString() {
    return 'Group';
  }
}
