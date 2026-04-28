import { Proxies } from '../../support/proxies.js';
import { newFakeMaster } from './fakemaster.js';
import { newFakeColorScheme } from './fakecolorscheme.js';

export const newFakeLayout = (...args) => {
  return Proxies.guard(new FakeLayout(...args));
};

export class FakeLayout {
  constructor(resource, presentation) {
    this.__id = resource.objectId;
    this.__presentation = presentation;
  }

  get __resource() {
    const presentationResource = this.__presentation.__resource;
    const layout = (presentationResource.layouts || []).find(l => l.objectId === this.__id);
    if (!layout) {
      throw new Error(`Layout with ID ${this.__id} not found`);
    }
    return layout;
  }

  getMaster() {
    const masterId = this.__resource.layoutProperties?.masterObjectId;
    if (!masterId) return null;

    const presentationResource = this.__presentation.__resource;
    const master = (presentationResource.masters || []).find(m => m.objectId === masterId);
    return master ? newFakeMaster(master, this.__presentation) : null;
  }

  getObjectId() {
    return this.__id;
  }

  /**
   * Gets the color scheme of the layout.
   * @returns {FakeColorScheme} The color scheme.
   */
  getColorScheme() {
    return newFakeColorScheme(this);
  }

  toString() {
    return 'Layout';
  }
}
