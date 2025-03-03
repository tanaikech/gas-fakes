/**
 * we'l use keyv store, but we need a persisnt version so to avoid
 * any redis type services etc, we'll use keyv-file which caches on disk
 * unfortunately we have to use syncit for this to emulate apps script real slow
 */
import Keyv from 'keyv'
import { KeyvFile } from 'keyv-file'
import os from 'os';
class kStore {
  constructor({ inMemory = true, fileName = 'kv', storeDir, type, ...args } = {}) {

    if (inMemory) {
      this.store = new Keyv({
        ...args
      })
    } else {

      // some random filename if none provided
      fileName = fileName || `${Math.random().toString(36).slice(6)}`

      // use the temp default if none provided
      storeDir = `${storeDir || os.tmpdir()}`

      // in case there's any accidental //
      this.filePath = [storeDir, fileName].join("/").replace(/\/+/, '/')

      // we're using this storage adaptor
      this.store = new Keyv({
        ...args,
        store:
          new KeyvFile({
            filename: this.filePath
          })
      })

    }
  }
}

export const newKStore = (...args) => new kStore(...args)

