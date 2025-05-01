import { Proxies } from '../../support/proxies.js'
import {Utils} from '../../support/utils.js'
const {outsideInt} = Utils


/**
 * create a new FakeTextRotation instance
 * @param  {...any} args 
 * @returns {FakeTextRotation}
 */
export const newFakeTextRotation = (...args) => {
  return Proxies.guard(new FakeTextRotation(...args))
}
// https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/cells#Border
class FakeTextRotation {
  constructor(apiResult) {
    if (!apiResult) {
      throw new Error (`apiresult for textrotation is missing`)
    }
    if (outsideInt(apiResult.angle, -180, 180)) {
      throw new Error (`${apiResult.angle} is not a valid angle`)
    }
    // the values returned from the api differ from Apps Script
    const gasWrap = {
      "NONE": "NONE",
      "TOP": "OVERFLOW",
      "CENTER": "MIDDLE",
      "BOTTOM": "BOTTOM"
    }

    const s = gasWrap[apiResult.vertical]
    if (!s) {
      throw new Error(`${JSON.stringify(apiResult)} is not a valid verical text rotation`)
    }
    this.__apiResult = apiResult
    this.__angle = apiResult.angle
    this.__vertical = s
  }
  getDegrees() {
    return this.__angle
  }
  isVertical() {
    return this.__vertical !== "NONE"
  }
}
