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

const name = "DocumentApp";
if (typeof globalThis[name] === typeof undefined) {
  // By importing this, we ensure all element types register themselves.
  const getApp = () => {
    if (!_app) {
      console.log('...activating proxy for', name)
      _app = newFakeDocumentApp();
    }
    return _app;
  };
  Proxies.registerProxy(name, getApp);
}