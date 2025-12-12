/**
 * Base class for advanced service resources
 */


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
    const result = this.__syncitMethod(pack);
    if (!result || !result.response) {
      // Simulate an error response if the worker didn't provide one.
      return {
        data: null,
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          error: {
            code: 500,
            message: `API call to ${this.__serviceName}.${subProp}.${method} failed with no response from worker.`
          }
        }
      };
    }
    return result;
  }

  toString() {
    return this.__mainService.toString();
  }
}