/**
 * the idea here is to create a global entry for the singleton
 * before we actually have everything we need to create it.
 * We do this by using a proxy, intercepting calls to the
 * initial sigleton and diverting them to a completed one.
 * We also need to make sure all element types are registered.
 */
import { newFakeDocumentApp } from './fakedocumentapp.js';
import { Proxies } from '../../support/proxies.js';
import './elements.js'; // This ensures all element types register themselves before DocumentApp is used.

let _app = null;

const name = 'DocumentApp';
const serviceName = 'DocumentApp';

if (typeof globalThis[name] === typeof undefined) {
  // By importing this, we ensure all element types register themselves.
  const getApp = () => {
    if (!_app) {
      const realApp = newFakeDocumentApp();

      _app = new Proxy(realApp, {
        get(target, prop, receiver) {
          if (prop === 'toString') {
            return () => name;
          }

          const serviceBehavior = ScriptApp.__behavior.sandBoxService[serviceName];

          if (!serviceBehavior.enabled) {
            throw new Error(`${name} service is disabled by sandbox settings.`);
          }

          const allowedMethods = serviceBehavior.methods;
          if (allowedMethods && typeof target[prop] === 'function' && !allowedMethods.includes(prop)) {
            throw new Error(`Method ${name}.${prop} is not allowed by sandbox settings.`);
          }

          return Reflect.get(...arguments);
        },
      });
    }
    return _app;
  };
  Proxies.registerProxy(name, getApp);
}