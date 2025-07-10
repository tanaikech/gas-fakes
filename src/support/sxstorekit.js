/**
 * STORE functions
 * all these functions run as subprocesses and wait fo completion
 * thus turning async operations into sync
 * note 
 * - since the subprocess starts afresh it has to reimport all dependecies
 * - there is nocontext inhertiance
 * - arguments and returns must be serializable ie. primitives or plain objects
 * 
 * TODO - this slows down debuggng significantly as it has to keep restarting the debugger
 * - need to research how to get over that
 */
import {newKStore} from './kv.js'
// TODO - playing with different syncit
export const sxStoreKit = async ({ kvPath, kvArgs, storeArgs, method }) => {
  const { store } = newKStore(storeArgs)
  const result = await store[method](...kvArgs)
  return result
}