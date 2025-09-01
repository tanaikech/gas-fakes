// fake Apps Script SpreadsheetApp
/**
 * the idea here is to create a global entry for the singleton 
 * before we actually have everything we need to create it. 
 * We do this by using a proxy, intercepting calls to the 
 * initial sigleton and diverting them to a completed one
 */
import { newFakeSpreadsheetApp } from './fakespreadsheetapp.js'
import { Proxies } from '../../support/proxies.js'

// This will eventually hold a proxy for DriveApp
let _app = null;

/**
 * adds to global space to mimic Apps Script behavior
 */
const name = "SpreadsheetApp";
const serviceName = "SheetsApp";

if (typeof globalThis[name] === typeof undefined) {
  const getApp = () => {
    // if it hasnt been intialized yet then do that
    if (!_app) {
      const realApp = newFakeSpreadsheetApp();

      _app = new Proxy(realApp, {
        get(target, prop, receiver) {
          // toString on the proxy target itself
          if (prop === 'toString') {
            return () => name;
          }

          const serviceBehavior = ScriptApp.__behavior.sandboxService[serviceName];

          if (!serviceBehavior.enabled) {
            throw new Error(`${name} service is disabled by sandbox settings.`);
          }

          const allowedMethods = serviceBehavior.methods;
          if (allowedMethods && typeof target[prop] === 'function' && !allowedMethods.includes(prop)) {
            throw new Error(`Method ${name}.${prop} is not allowed by sandbox settings.`);
          }

          return Reflect.get(...arguments);
        }
      });
    }
    // this is the actual driveApp we'll return from the proxy
    return _app
  }

  Proxies.registerProxy(name, getApp)
}
