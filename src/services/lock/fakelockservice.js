import { Proxies } from '../../support/proxies.js';
import { newFakeLock } from './fakelock.js';

/**
 * domains of lock supported
 * @enum {string}
 */
const LockDomain = Object.freeze({
  SCRIPT: 'SCRIPT',
  USER: 'USER',
  DOCUMENT: 'DOCUMENT'
})
/**
 * the lock service us meaningless here as we are running on node single threaded
 * in apps script this would lock shared code that was being shared by multiple scripts
 * so this is all provided for compatibility only
 */
class FakeLockService {
  constructor() {
    this.__fakeObjectType = 'LockService';
  }
  getDocumentLock () {
    return newFakeLock(LockDomain.DOCUMENT)
  }
  getUserLock () {
    return newFakeLock(LockDomain.USER) 
  }
  getScriptLock () {
    return newFakeLock(LockDomain.SCRIPT)
  }
}

export const newFakeLockService = (...args) => Proxies.guard(new FakeLockService(...args));