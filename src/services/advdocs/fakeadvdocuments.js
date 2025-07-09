/**
 * Advanced docs service
 */


import { Proxies } from '../../support/proxies.js'
import { notYetImplemented } from '../../support/helpers.js'


/**
 * the advanced docs Apps Script service faked - Documents class
 * @class FakeAdvDocuments
 */
class FakeAdvDocuments {
  constructor(docs) {

    this.__fakeObjectType = "Docs.Documents"

    const props = [
      'batchUpdate',
      'ceate',
      'get'
    ]

    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented()
      }
    })
    this.__docs = docs

  }
  toString() {
    return this.__docs.toString()
  }

}

export const newFakeAdvDocuments = (...args) => Proxies.guard(new FakeAdvDocuments(...args))
