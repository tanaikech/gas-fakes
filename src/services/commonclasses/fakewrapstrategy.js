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
    const s = gasWrap[apiResult]
    if (!s) {
      throw new Error (`${apiResult} is not a valid wrap strategy`)
    }
    return WrapStrategy[s]
  }
}

// TODO - check validity of this
export const isWrapped = (strategy) => {
  return strategy.toString() !== "CLIP"
}