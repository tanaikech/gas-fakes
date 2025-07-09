/**
 * Advanced slides service
 */


import { Proxies } from '../../support/proxies.js'
import { notYetImplemented } from '../../support/helpers.js'


/**
 * the advanced slides Apps Script service faked - presntations class
 * @class FakeAdvPresentations
 */
class FakeAdvPresentations {
  constructor(slides) {

    this.__fakeObjectType = "Slides.Presentations"

    const props = [
      'Pages',
      'batchUpdate',
      'ceate',
      'get'
    ]

    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented()
      }
    })
    this.__slides = slides

  }
  toString() {
    return this.__slides.toString()
  }

}

export const newFakeAdvPresentations = (...args) => Proxies.guard(new FakeAdvPresentations(...args))
