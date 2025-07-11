/**
 * Advanced docs service
 */


import { Proxies } from '../../support/proxies.js'
import { notYetImplemented, signatureArgs, ssError } from '../../support/helpers.js'
import { Syncit } from '../../support/syncit.js'
import is from '@sindresorhus/is'

/**
 * the advanced docs Apps Script service faked - Documents class
 * @class FakeAdvDocuments
 */
class FakeAdvDocuments {
  constructor(docs) {

    this.__fakeObjectType = "Docs.Documents"

    const props = [
      'batchUpdate',
      'get'
    ]

    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented()
      }
    })
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

  toString() {
    return this.__docs.toString()
  }

}

export const newFakeAdvDocuments = (...args) => Proxies.guard(new FakeAdvDocuments(...args))
