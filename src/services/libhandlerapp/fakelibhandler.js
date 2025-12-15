import { Proxies } from '../../support/proxies.js';
import { Auth } from '../../support/auth.js';
import { newFakeLibrary } from './fakelibrary.js';
export const newFakeLibHandler = (...args) => {
  return Proxies.guard(new FakeLibHandler(...args));
};

// to keep the same pattern as other apps script services, we'll use the worker to async/sync
// the starting point is the current manifest (or another manifest if specified)
class FakeLibHandler {
  constructor(manifest) {
    this.__manifest = manifest
    if (!this.__manifest) {
      console.warn ('...manifest not found in auth and not provided - no libraries will be loaded');
    }
  }

  get manifest() {
    return this.__manifest;
  }
  get dependencies() {
    return this.__manifest.dependencies;
  }
  get libraries() {
    return this.dependencies?.libraries;
  }
  get enabledAdvancedServices() {
    return this.dependencies?.enabledAdvancedServices;
  }

  fetchLibraries() {
    const libs =  this.dependencies?.libraries.map(newFakeLibrary);
    return libs
  }

  toString() {
    return 'LibHandler';
  }
}
