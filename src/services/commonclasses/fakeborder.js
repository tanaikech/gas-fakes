import { Proxies } from '../../support/proxies.js'
import { newNummery } from '../../support/nummery.js'
/**
 * create a new FakeBorder instance
 * @param  {...any} args 
 * @returns {FakeBorder}
 */
export const FakeBorder = (...args) => {
  return Proxies.guard(new FakeBorder(...args))
}
// https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/cells#Border
class FakeBorder {
  /**
   * @param {FakeColor} color
   * @param {Style} {import('../typedefs.js').Style} borderStyle border style 
   * @returns {FakeBorder} a border
   */
  constructor({color, style }) {
    this.__borderStyle = newNummery(borderStyle)
    this.__color = color
  }
  /**
   * @returns  {import('../typedefs.js').Style} borderStyle border style 
   */
  getBorderStyle() {
    return this.__style
  }
  /**
   * @returns {FakeColor}
   */
  getColor() {
    return this.__color
  }
  toString() {
    return 'Border'
  }
}