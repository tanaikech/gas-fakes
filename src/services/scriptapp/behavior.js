import { Proxies } from '../../support/proxies.js'
import { Utils } from '../../support/utils.js'
import { isFolder } from '../../support/helpers.js'
const { is } = Utils

/**
 * create a new behavior instance
 * @param  {...any} args 
 * @returns {Behavior}
 */
export const newFakeBehavior = (...args) => {
  return Proxies.guard(new FakeBehavior(...args))
}

class FakeBehavior {
  constructor() {
    // this is a set of all the files this instance of gas-fakes has created
    // the idea is that we can use this to clean up after tests or to emulate drive.file scope
    // key is the file id
    this.__createdIds = new Set();
    // in sandbox mode we only allow access to files created in this instance
    // this is to emulate the behavior of a drive.file scope
    this.__sandBoxMode = false;
    // if you want the created files to be cleaned up on wrapup 
    this.__cleanup = true
    // to strictly enforce sandbox mode
    this.__strictSandbox = true;
  }
  set strictSandbox(value) {
    this.__strictSandbox = value;
  }
  get strictSandbox() {
    return this.__strictSandbox;
  }
  set cleanup(value) {
    this.__cleanup = value;
  }
  get cleanup() {
    return this.__cleanup;
  }
  set sandBoxMode(value) {
    this.__sandBoxMode = value;
  }
  get sandBoxMode() {
    return this.__sandBoxMode;
  }
  addFile(id) {
    if (this.sandBoxMode) {
      console.log(`...adding file ${id} to sandbox allowed list`)
      if (!is.nonEmptyString(id)) {
        throw new Error(`Invalid sandbox id parameter (${id}) - must be a non-empty string`);
      }
      this.__createdIds.add(id);
    }
    return id
  }
  isAccessible(id) {
    if (!is.nonEmptyString(id)) {
      throw new Error(`Invalid sandbox id parameter (${id}) - must be a non-empty string`);
    }
    return !this.__sandBoxMode || !this.__strictSandbox || this.__createdIds.has(id);
  }
  trash() {
    // this is where we would trash all the created files
    if (!this.__cleanup) {
      console.log('...skipping cleaning up sandbox files')
      return [];
    }

    const trashed = Array.from(this.__createdIds).reduce((acc, id) => {
      let d = null
      try {
        d = DriveApp.getFileById(id)
      } catch (e) {
        d = DriveApp.getFolderById(id)
      }
      if (d) {
        d.setTrashed(true);
        console.log(`...trashed file ${d.getName()} (${id})`);
        acc.push(id);
      }
      return acc;
    }, []);

    this.__createdIds.clear();
    console.log(`...trashed ${trashed.length} sandboxed files`);
    return trashed;
  }
  isKnown(id) {
    return this.__createdIds.has(id);
  }
}

