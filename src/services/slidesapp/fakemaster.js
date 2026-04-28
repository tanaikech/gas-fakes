import { Proxies } from '../../support/proxies.js';
import { newFakeColorScheme } from './fakecolorscheme.js';

export const newFakeMaster = (...args) => {
  return Proxies.guard(new FakeMaster(...args));
};

export class FakeMaster {
  constructor(resource, presentation) {
    this.__id = resource.objectId;
    this.__presentation = presentation;
  }

  get __resource() {
    const presentationResource = this.__presentation.__resource;
    const master = (presentationResource.masters || []).find(m => m.objectId === this.__id);
    if (!master) {
      throw new Error(`Master with ID ${this.__id} not found`);
    }
    return master;
  }

  getObjectId() {
    return this.__id;
  }

  /**
   * Gets the color scheme of the master.
   * @returns {FakeColorScheme} The color scheme.
   */
  getColorScheme() {
    return newFakeColorScheme(this);
  }

  toString() {
    return 'Master';
  }
}
