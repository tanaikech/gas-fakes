import { Proxies } from '../../support/proxies.js'
import { Utils } from '../../support/utils.js'

const { is } = Utils
const checkArgs = (actual, expect = "boolean") => {
  if (!is[expect](actual)) {
    throw new Error(`${this.name} expected ${expect} but got ${actual}`)
  }
  return actual
}

const serviceModel = {
  enabled: null,
  sandboxStrict: null,
  sandboxMode: null,
  methodWhitelist: null
}
const idWhitelistModel = {
  id: null,
  read: true,
  write: false,
  trash: false
}

class FakeIdWhitelistItem {
  constructor(id) {
    this.__model = { ...idWhitelistModel, id }
  }
  toString() {
    return 'IdWhitelistItem'
  }
  get id() {
    return this.__model.id
  }
  setId(value) {
    this.__model.id = checkArgs(value, "nonEmptyString")
    return this
  }
  get read() {
    return this.__model.read
  }
  setRead(value) {
    this.__model.read = checkArgs(value)
    return this
  }
  get write() {
    return this.__model.write
  }
  setWrite(value) {
    this.__model.write = checkArgs(value)
    return this
  } 
}
/**
 * create a new behavior instance
 * @param  {...any} args 
 * @returns {Behavior}
 */
export const newFakeBehavior = (...args) => {
  return Proxies.guard(new FakeBehavior(...args))
}
const newFakeSandboxService = (...args) => {
  return Proxies.guard(new FakeSandboxService(...args))
}
const newFakeIdWhitelistItem = (...args) => {
  return Proxies.guard(new FakeIdWhitelistItem(...args))
}
/**
 * this can modify sandbox behaior for each individual service
 */
class FakeSandboxService {
  constructor(behavior, name) {
    this.__name = name
    this.__state = { ...serviceModel }
    this.__behavior = behavior
  }

  clear() {
    // restore to default
    this.__state = { ...serviceModel }
  }
  get name() {
    return this.__name
  }
  set sandboxStrict(value) {
    this.__state.sandboxStrict = checkArgs(value)
  }
  set sandboxMode(value) {
    this.__state.sandboxMode = checkArgs(value)
  }
  set methodWhitelist(value) {
    this.__state.methodWhitelist = checkArgs(value, "array")
    this.__state.methodWhitelist.forEach (f=>{
      if (!is.nonEmptyString(f) ) throw new Error(`expected an array of nonEmptyStrings for methodWhitelist`)
    })
  }
  set enabled(value) {
    this.__state.enabled = checkArgs(value)
  }
  get methodWhitelist() {
    return is.nullOrUndefined(this.__state.methodWhitelist) ? null : this.__state.methods
  }
  get enabled() {
    return is.nullOrUndefined(this.__state.enabled) ? true : this.__state.enabled
  }
  get sandboxStrict() {
    return is.nullOrUndefined(this.__state.sandboxStrict) ? this.__behavior.strictSandbox : this.__state.sandboxStrict
  }
  get sandboxMode() {
    return is.nullOrUndefined(this.__state.sandboxMode) ? this.__behavior.sandboxMode : this.__state.sandboxMode
  }

}

class FakeBehavior {
  constructor() {
    // this is a set of all the files this instance of gas-fakes has created
    // the idea is that we can use this to clean up after tests or to emulate drive.file scope
    // key is the file id
    this.__createdIds = new Set();
    // in sandbox mode we only allow access to files created in this instance
    // this is to emulate the behavior of a drive.file scope
    this.__sandboxMode = false;
    // if you want the created files to be cleaned up on wrapup 
    this.__cleanup = true;
    // to strictly enforce sandbox mode
    this.__strictSandbox = true;
    this.__idWhitelist = null

    // individually settable services
    const services = ['DocumentApp', 'DriveApp', 'SpreadsheetApp', 'SlidesApp']
    this.__sandboxService = {}
    services.forEach(f => this.__sandboxService[f] = newFakeSandboxService(this, f))

  }
  newIdWhitelistItem(id) {
    return newFakeIdWhitelistItem(id)
  }
  get idWhitelist() {
    return this.__idWhitelist
  }
  set idWhitelist(value) {
    if (!is.null(value)){
      checkArgs(value, "array")
      value.forEach (f=>{
        if (!is.function(f.toString) && f.toString() === "IdWhitelistItem") throw new Error(`expected an IdWhitelistItem`)
      })
    }
    this.__idWhitelist = value
  }

  get sandboxService() {
    return this.__sandboxService
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
  set sandboxMode(value) {
    this.__sandboxMode = value;
  }
  get sandboxMode() {
    return this.__sandboxMode;
  }
  // synonyms because i originally published with miscased sandBox
  set sandBoxMode(value) {
    this.__sandboxMode = value;
  }
  get sandBoxMode() {
    return this.__sandboxMode;
  }
  addFile(id) {
    if (this.sandboxMode) {
      if (!is.nonEmptyString(id)) {
        throw new Error(`Invalid sandbox id parameter (${id}) - must be a non-empty string`);
      }
      if (!this.isKnown(id)) {
        console.log(`...adding file ${id} to sandbox allowed list`);
        this.__createdIds.add(id);
      }
    }
    return id
  }
  isAccessible(id, serviceName) {
    if (!is.nonEmptyString(id)) {
      throw new Error(`Invalid sandbox id parameter (${id}) - must be a non-empty string`);
    }

    // Advanced services should inherit sandbox rules from their App counterparts.
    const serviceMapping = {
      'Drive': 'DriveApp',
      'Sheets': 'SpreadsheetApp',
      'Docs': 'DocumentApp',
      'Slides': 'SlidesApp'
    };
    const effectiveServiceName = serviceMapping[serviceName] || serviceName;

    const serviceBehavior = this.sandboxService[effectiveServiceName];
    // If the service isn't in the sandbox service map, we can't apply per-service rules.
    // Fall back to the original global logic. This is a safe fallback.
    if (!serviceBehavior) {
      return !this.__sandboxMode || !this.__strictSandbox || this.isKnown(id);
    }

    // If sandbox mode is disabled for this service, access is granted.
    if (!serviceBehavior.sandboxMode) {
      return true;
    }

    // If the file was created in this session, access is granted.
    if (this.isKnown(id)) {
      return true;
    }

    // At this point, sandbox is ON and the file is EXTERNAL.
    // In strict mode, external files are forbidden.
    if (serviceBehavior.sandboxStrict) {
      return false;
    }

    // In non-strict mode, check the 'ids' whitelist.
    // If no whitelist is provided, access is granted.
    return serviceBehavior.ids ? serviceBehavior.ids.includes(id) : true;
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
