import { Proxies } from '../../support/proxies.js'
import { Utils } from '../../support/utils.js'
const { outsideInt , is} = Utils


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
      throw new Error(`apiresult for textrotation is missing`)
    }
    this.__apiResult = apiResult 
    const { vertical = false, angle  =0 } = apiResult
    this.__vertical = Boolean(vertical)
    this.__angle = Number(angle)
    if (outsideInt(this.__angle, -90, 90)) {
      throw new Error(`${apiResult.angle} is not a valid angle`)
    }
  }
  getDegrees() {
    return this.__angle
  }
  isVertical() {
    return this.__vertical
  }
}
