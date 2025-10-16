# [Lock](https://developers.google.com/apps-script/reference/lock)

This service allows scripts to prevent concurrent access to sections of code. This can be useful when you have multiple users or processes modifying a shared resource and want to prevent collisions.

## Class: [Lock](https://developers.google.com/apps-script/reference/lock/lock)

A representation of a mutual-exclusion lock.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [hasLock()](https://developers.google.com/apps-script/reference/lock/lock#hasLock()) | Returns true if the lock was acquired. This method will return false if tryLock(timeoutInMillis) or waitLock(timeoutInMillis) were never called, timed out before the lock could be retrieved, or if releaseLock() was called. | Boolean | true if the lock was acquired, false otherwise | not started |  |
| [releaseLock()](https://developers.google.com/apps-script/reference/lock/lock#releaseLock()) | Releases the lock, allowing other processes waiting on the lock to continue. The lock is automatically released when the script terminates, but for efficiency it is best to release it as soon as you no longer need exclusive access to a section of code. This method has no effect if the lock has not been acquired. |  |  | not started |  |
| [tryLock(Integer)](https://developers.google.com/apps-script/reference/lock/lock#tryLock(Integer)) | Attempts to acquire the lock, timing out after the provided number of milliseconds. This method has no effect if the lock has already been acquired. | Boolean | true if the lock was acquired, false otherwise | not started |  |
| [waitLock(Integer)](https://developers.google.com/apps-script/reference/lock/lock#waitLock(Integer)) | Attempts to acquire the lock, timing out with an exception after the provided number of milliseconds. This method is the same as tryLock(timeoutInMillis) except that it throws an exception when the lock could not be acquired instead of returning false. |  |  | not started |  |

## Class: [LockService](https://developers.google.com/apps-script/reference/lock/lock-service)

Prevents concurrent access to sections of code. This can be useful when you have multiple users or processes modifying a shared resource and want to prevent collisions.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getDocumentLock()](https://developers.google.com/apps-script/reference/lock/lock-service#getDocumentLock()) | Gets a lock that prevents any user of the current document from concurrently running a section of code. A code section guarded by a document lock can be executed simultaneously by script instances running in the context of different documents, but by no more than one execution for any given document. Note that the lock is not actually acquired until Lock.tryLock(timeoutInMillis) or Lock.waitLock(timeoutInMillis) is called. If this method is called outside of the context of a containing document (such as from a standalone script or webapp), null is returned. | [Lock](#class-lock) | a lock scoped to the script and current document, or null if called from a standalone script or webapp | not started |  |
| [getScriptLock()](https://developers.google.com/apps-script/reference/lock/lock-service#getScriptLock()) | Gets a lock that prevents any user from concurrently running a section of code. A code section guarded by a script lock cannot be executed simultaneously regardless of the identity of the user. Note that the lock is not actually acquired until Lock.tryLock(timeoutInMillis) or Lock.waitLock(timeoutInMillis) is called. | [Lock](#class-lock) | a lock scoped to the script | not started |  |
| [getUserLock()](https://developers.google.com/apps-script/reference/lock/lock-service#getUserLock()) | Gets a lock that prevents the current user from concurrently running a section of code. A code section guarded by a user lock can be executed simultaneously by different users, but by no more than one execution for any given user. The lock is "private" to the user. Note that the lock is not actually acquired until Lock.tryLock(timeoutInMillis) or Lock.waitLock(timeoutInMillis) is called. | [Lock](#class-lock) | a lock scoped to the script and current user | not started |  |

