import { Proxies } from '../../support/proxies.js'
import { newFakeBorder } from './fakeborder.js'
/**
 * @file
 * @imports ../typedefs.js
 */

/**
 * create a new FakeBorders instance
 * @param  {...any} args 
 * @returns {FakeBorders}
 */
export const newFakeBorders = (...args) => {
  return Proxies.guard(new FakeBorders(...args))
}
// https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/cells#Borders
class FakeBorders {
  constructor({ top, bottom, left, right }) {
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
