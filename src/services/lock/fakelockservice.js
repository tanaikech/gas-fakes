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
    // Per documentation, this should return null if not in the context of a document.
    if (ScriptApp.__documentId) {
      return newFakeLock(LockDomain.DOCUMENT);
    }
    return null;
  }
  getUserLock () {
    return newFakeLock(LockDomain.USER) 
  }
  getScriptLock () {
    return newFakeLock(LockDomain.SCRIPT)
  }
}

export const newFakeLockService = (...args) => Proxies.guard(new FakeLockService(...args));