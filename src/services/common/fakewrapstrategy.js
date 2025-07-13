import { Proxies } from '../../support/proxies.js'
import { WrapStrategy } from '../enums/sheetsenums.js'
/**
 * create a new FakeWrapStrategy instance
 * @param  {...any} args 
 * @returns {FakeBorder}
 */
export const newFakeWrapStrategy = (...args) => {
  return Proxies.guard(new FakeWrapStrategy(...args))
}
// https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/cells#Border
class FakeWrapStrategy {
  constructor(apiResult) {
    // the values returned from the api differ from Apps Script
    const gasWrap = {
      "WRAP_STRATEGY_UNSPECIFIED": "OVERFLOW",
      "OVERFLOW_CELL": "OVERFLOW",
      "LEGACY_WRAP": "WRAP",
      "CLIP": "CLIP",
      "WRAP": "WRAP"
    }
    this.__strategy = gasWrap[apiResult]
    if (!this.__strategy) {
      throw new Error (`${apiResult} is not a valid wrap strategy`)
    }
  }
  toString() {
    return this.__strategy
  }


}

// CLIP & OVERFLOW are not wrapped WRAP is
export const isWrapped = (strategy) => {
  return strategy.toString() === "WRAP" 
}

export const getWrapApiStrategyProp = (value) => {
  const m = new Map ([["OVERFLOW","OVERFLOW_CELL"],["WRAP","WRAP"],["CLIP","CLIP"]])
  if (!m.has(value)) throw new Error (`${value} is not a valid wrap strategy`)
  return m.get(value)
}