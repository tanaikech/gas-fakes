/**
 * we'l use keyv store, but we need a persisnt version so to avoid
 * any redis type services etc, we'll use keyv-file which caches on disk
 * unfortunately we have to use syncit for this to emulate apps script real slow
 */
import Keyv from 'keyv'
import { KeyvFile } from 'keyv-file'
import os from 'os';
class kStore {
  constructor({ inMemory= true, fileName, tmpDir, storeDir = '.gf-kv', type, ...args }={}) {

    fileName = fileName || `${Math.random().toString(36).slice(6)}`
    tmpDir = `${tmpDir || os.tmpdir()}`
    this.filePath = [tmpDir,storeDir,fileName].join("/").replace (/\/+/,'/')

    this.store = inMemory
      ? new Keyv({
        ...args
      })
      : new Keyv({
        ...args,
        store:
          new KeyvFile({
            filename: this.filePath
          })
      })

  }
}

export const newKStore = (...args) => new kStore (...args)

