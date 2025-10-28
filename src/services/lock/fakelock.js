import { Proxies } from '../../support/proxies.js';


/**
 * the lock service us meaningless here as we are running on node single threaded
 * in apps script this would lock shared code that was being shared by multiple scripts
 * so this is all provided for compatibility only
 */
class FakeLock {
  constructor(domain) {
    this.__fakeObjectType = 'Lock';
    this.__domain = domain
  }
}


export const newFakeLock = (...args) => Proxies.guard(new FakeLock(...args));