import '@mcpher/gas-fakes'

import { initTests } from "./testinit.js";
import { wrapupTest, trasher } from "./testassist.js";
import is from '@sindresorhus/is';

// TODO - when container bound scripts are supported need to add tests for documentlock
export const testLock = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section("LockService getters", t => {
    const scriptLock = LockService.getScriptLock();
    t.truthy(scriptLock, "getScriptLock should return a lock object");    
    const userLock = LockService.getUserLock();
    t.truthy(userLock, "getUserLock should return a lock object");    

  });

  unit.section("Basic Lock operations", t => {
    const lock = LockService.getScriptLock();

    // Initial state
    t.is(lock.hasLock(), false, "Initially, should not have the lock");

    // Acquire lock
    const acquired = lock.tryLock(10000); // 10 seconds
    t.is(acquired, true, "tryLock with positive timeout should acquire the lock");
    t.is(lock.hasLock(), true, "Should have the lock after acquiring it");

    // Re-acquiring lock
    const reacquired = lock.tryLock(10000);
    t.is(reacquired, true, "tryLock should return true if lock is already held");
    t.is(lock.hasLock(), true, "Should still have the lock");

    // Release lock
    lock.releaseLock();
    t.is(lock.hasLock(), false, "Should not have the lock after releasing it");
  });

  unit.section("waitLock functionality", t => {
    const lock = LockService.getScriptLock();

    // Successful waitLock
    t.true(is.undefined(t.threw(() => lock.waitLock(1000))), null, "waitLock with a positive timeout should not throw an error");
    t.is(lock.hasLock(), true, "Should have the lock after a successful waitLock");

    // waitLock when already held
    t.true(is.undefined(t.threw(() => lock.waitLock(1000))), null, "waitLock should not throw an error if lock is already held");
    t.is(lock.hasLock(), true, "Should still have the lock");

    lock.releaseLock();
  });

  unit.section("Lock timeout failures", t => {
    let lock = LockService.getScriptLock();

    // tryLock with zero timeout
    t.is(lock.tryLock(0), true, "tryLock(0) should acquire the lock immediately and return true");
    t.is(lock.hasLock(), true, "Should have the lock after a successful tryLock(0)");
    lock.releaseLock();

    // tryLock with negative timeout
    t.is(lock.tryLock(-100), false, "tryLock with a negative timeout should fail and return false");
    t.is(lock.hasLock(), false, "Should not have the lock after a failed tryLock with negative timeout");

    // waitLock with zero timeout
    t.true(is.undefined(t.threw(() => lock.waitLock(0))), null, "waitLock(0) should not throw an error and acquire the lock");
    t.is(lock.hasLock(), true, "Should have the lock after a successful waitLock(0)");
    lock.releaseLock();

    // waitLock with negative timeout
    const errWaitNegative = t.threw(() => lock.waitLock(-100));
    t.truthy(errWaitNegative, "waitLock with a negative timeout should throw an error");
    t.rxMatch(errWaitNegative?.message, /Lock timeout/, "Error message for waitLock(-100) should mention timeout");
    t.is(lock.hasLock(), false, "Should not have the lock after a failed waitLock(-100)");
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testLock);