/**
 * STORE functions
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */
import { newKStore } from './kv.js';
import { syncLog } from './workersync/synclogger.js';

export const sxStore = async (_Auth, { kvArgs, storeArgs, method }) => {
  // Auth is passed by the worker but not used for this local operation.

  const { store } = newKStore(storeArgs);
  const result = await store[method](...kvArgs);
  return result;
};