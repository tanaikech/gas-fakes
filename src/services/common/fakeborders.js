import { Proxies } from '../../support/proxies.js'
import { newFakeBorder } from './fakeborder.js'


/**
 * create a new FakeBorders instance
 * @param  {...any} args 
 * @returns {FakeBorders}
 */
export const newFakeBorders = (...args) => {
  const x = new FakeBorders(...args)
  return x ? Proxies.guard(x) : null
}
// https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/cells#Borders
class FakeBorders {
  // deduced this from GAS side tests on sheets. 
  // we still have to provide the right kind of objects for each individual border if there are any borders at all
  // if there are no borders at all then we return null
  constructor(apiResult) {
    if (!apiResult) return null

    const { top, bottom, left, right } = apiResult 
    this.__top = newFakeBorder(top) 
    this.__bottom = newFakeBorder(bottom)
    this.__left = newFakeBorder(left)
    this.__right = newFakeBorder(right)

  }
  getBottom() {
    return this.__bottom
  }
  getLeft() {
    return this.__left
  }
  getRight() {
    return this.__right
  }
  getTop() {
    return this.__top
  }
  toString() {
    return 'Borders'
  }
}
