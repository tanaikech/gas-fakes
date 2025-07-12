/**
 * Advanced docs service
 */


import { Proxies } from '../../support/proxies.js'
import {  signatureArgs, ssError } from '../../support/helpers.js'
import { docsCacher } from '../../support/docscacher.js';
import { Syncit } from '../../support/syncit.js'
import is from '@sindresorhus/is'

/**
 * the advanced docs Apps Script service faked - Documents class
 * @class FakeAdvDocuments
 */
class FakeAdvDocuments {
  constructor(docs) {

    this.__fakeObjectType = "Docs.Documents"

    const props = []
    this.__docs = docs
  }


  create (resource, options) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Docs.Documents.create")
    if (nargs < 1 || nargs > 2) matchThrow('Invalid number of arguments provided. Expected 1-2 only')
    if (!is.object(resource) || (nargs > 1 && !is.object(options))) {
      matchThrow("API call to docs.documents.create failed with error: Invalid JSON payload received.")
    }

    const pack = {
      prop: "documents",
      method: "create",
      params: {
        requestBody: resource
      },
      options
    }

    const { response, data } = Syncit.fxDocs(pack)

    // maybe we need to throw an error
    ssError(response, pack.method)

    return data
  }

  batchUpdate(resource, documentId) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Docs.Documents.batchUpdate");
    if (nargs !== 2) matchThrow('Invalid number of arguments provided. Expected 2 only');
    if (!is.object(resource) || !is.string(documentId)) {
      matchThrow("API call to docs.documents.batchUpdate failed with error: Invalid JSON payload received.");
    }

    // Invalidate the cache for this document since we are updating it.
    docsCacher.clear(documentId);

    const pack = {
      prop: "documents",
      method: "batchUpdate",
      params: {
        documentId: documentId,
        requestBody: resource
      }
    };

    const { response, data } = Syncit.fxDocs(pack);

    ssError(response, pack.method);

    return data;
  }

  /**
   * often the 2nd options args is for standard gapi params
   * however in the case of documentid they are actuallly the 2 query parameters
   * suggestionsViewMode, includeTabsContent
   * https://developers.google.com/workspace/docs/api/reference/rest/v1/documents/get
   * @param {} documentId 
   * @param {*} options 
   * @returns 
   */
  get(documentId, options) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Docs.Documents.get")
    if (nargs < 1 || nargs > 2) matchThrow('Invalid number of arguments provided. Expected 1-2 only')
    if (!is.string(documentId) || (nargs > 1 && !is.object(options))) {
      matchThrow("API call to docs.documents.get failed with error: Invalid JSON payload received.")
    }
    const optionsSet = new Set(["suggestionsViewMode", "includeTabsContent"])

    if (nargs === 2 && !Reflect.ownKeys(options).every(f=>optionsSet.has (f))) matchThrow()

    const { response, data } = Syncit.fxDocsGet({
      id: documentId,
      params: options
    })

    // maybe we need to throw an error
    ssError(response, 'get')

    return data
  }

  toString() {
    return this.__docs.toString()
  }

}

export const newFakeAdvDocuments = (...args) => Proxies.guard(new FakeAdvDocuments(...args))
