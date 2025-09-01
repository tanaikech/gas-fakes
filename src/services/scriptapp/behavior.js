import { Proxies } from '../../support/proxies.js'
import { Utils } from '../../support/utils.js'

const { is } = Utils

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
/**
 * this can modify sandbox behaior for each individual service
 */
class FakeSandboxService {
  constructor(behavior, name) {
    this.__model = {
      enabled: null,
      sandboxStrict: null,
      sandboxMode: null,
      cleanup: null,
      ids: null,
      methods: null
    }
    this.__name = name
    this.__state = this.__model
    this.__behavior = behavior
    
  }
  __checkArgs (actual, expect = "boolean") {
    if (!is[expect](actual)) {
      throw new Error(`${this.name} expected ${expect} but got ${actual}`)
    }
    return actual
  }
  clear() {
    // restore to default
    this.__state.enabled = null
    this.__state.sandboxStrict = null
    this.__state.sandboxMode = null
    this.__state.cleanup = null
    this.__state.ids = null
    this.__state.methods = null
  }
  get name() {
    return this.__name
  }
  set sandboxStrict(value) {
    this.__state.sandboxStrict = this.__checkArgs(value)
  }
  set sandboxMode(value) {
    this.__state.sandboxMode = this.__checkArgs(value)
  }
  set cleanup(value) {
    this.__state.cleanup = this.__checkArgs(value)
  }
  set ids(value) {
    this.__state.ids = this.__checkArgs(value, "array")
  }
  set methods(value) {
    this.__state.methods = this.__checkArgs(value, "array")
  }
  set enabled(value) {
    this.__state.enabled = this.__checkArgs(value)
  }
  get methods() {
    return is.nullOrUndefined(this.__state.methods) ? null : this.__state.methods
  }
  get ids() {
    return is.nullOrUndefined(this.__state.ids) ? null : this.__state.ids
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
  get cleanup() {
    return is.nullOrUndefined(this.__state.cleanup) ? this.__behavior.cleanup : this.__state.cleanup
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
    this.__cleanup = true
    // to strictly enforce sandbox mode
    this.__strictSandbox = true;

    // individually settable services
    const services = ['DriveApp', 'SheetsApp', 'SlidesApp', 'UrlFetchApp',"Drive","Sheets","Slides"]
    this.__sandBoxService = {}
    services.forEach (f=>this.__sandBoxService[f] = newFakeSandboxService(this, f))

  }
  get sandBoxService() {
    return this.__sandBoxService
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
      console.log(`...adding file ${id} to sandbox allowed list`)
      if (!is.nonEmptyString(id)) {
        throw new Error(`Invalid sandbox id parameter (${id}) - must be a non-empty string`);
      }
      this.__createdIds.add(id);
    }
    return id
  }
  isAccessible(id, serviceName) {
    if (!is.nonEmptyString(id)) {
      throw new Error(`Invalid sandbox id parameter (${id}) - must be a non-empty string`);
    }

    const serviceBehavior = this.sandBoxService[serviceName];
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
