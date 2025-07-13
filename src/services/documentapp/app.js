/**
 * the idea here is to create a global entry for the singleton
 * before we actually have everything we need to create it.
 * We do this by using a proxy, intercepting calls to the
 * initial sigleton and diverting them to a completed one
 */
import { newFakeDocumentApp } from './fakedocumentapp.js';
import { Proxies } from '../../support/proxies.js';

let _app = null;

const name = "DocumentApp";
if (typeof globalThis[name] === typeof undefined) {
  const getApp = () => {
    if (!_app) {
      _app = newFakeDocumentApp();
    }
    return _app;
  };
  Proxies.registerProxy(name, getApp);
}