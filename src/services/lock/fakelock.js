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
    this.__locked = false;
  }

  /**
   * Returns true if the lock was acquired.
   * @returns {boolean}
   */
  hasLock() {
    return this.__locked;
  }

  /**
   * Releases the lock.
   */
  releaseLock() {
    this.__locked = false;
  }

  /**
   * Attempts to acquire the lock.
   * @param {number} timeoutInMillis 
   * @returns {boolean}
   */
  tryLock(timeoutInMillis) {
    if (this.hasLock()) {
      return true;
    }
    // In a single-threaded fake, we can't wait. We fail only if timeout is negative.
    if (timeoutInMillis < 0) {
      return false;
    }
    this.__locked = true;
    return true;
  }

  /**
   * Attempts to acquire the lock, throwing an exception on timeout.
   * @param {number} timeoutInMillis 
   */
  waitLock(timeoutInMillis) {
    if (this.hasLock()) {
      return; // Already acquired, no need to wait
    }
    // In a single-threaded fake, we can't wait. We fail only if timeout is negative.
    if (timeoutInMillis < 0) {
      throw new Error(`Lock timeout: another process was holding the lock for too long.`);
    }
    this.__locked = true;
  }
}


export const newFakeLock = (...args) => Proxies.guard(new FakeLock(...args));