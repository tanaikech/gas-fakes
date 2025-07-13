/**
 * Base class for advanced service resources
 */
import { Syncit } from '../../support/syncit.js';

/**
 * @class FakeAdvResource
 * @description Base class for advanced service resources like Documents or Spreadsheets.
 */
export class FakeAdvResource {
  constructor(mainService, serviceName, syncitMethod) {
    this.__mainService = mainService;
    this.__serviceName = serviceName; // e.g., 'documents' or 'spreadsheets'
    this.__syncitMethod = syncitMethod; // e.g., Syncit.fxDocs or Syncit.fxSheets
  }

  _call(method, params, options, subProp = null) {
    const pack = {
      prop: this.__serviceName,
      subProp,
      method,
      params,
      options
    };
    return this.__syncitMethod(pack);
  }

  toString() {
    return this.__mainService.toString();
  }
}