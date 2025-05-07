import { Proxies } from '../../support/proxies.js'
import { newNummery } from '../../support/nummery.js'

/**
 * create a new FakeTextDirection 
 * @param  {...any} args 
 * @returns {FakeTextDirection}
 */
export const newFakeTextDirection = (...args) => {
  return Proxies.guard(new FakeTextDirection(...args))
}
// https://developers.google.com/apps-script/reference/spreadsheet/text-direction
class FakeTextDirection {
  constructor(apiResult) {
    if (!apiResult) {
      throw new Error (`${apiResult} is not a valid text direction`)
    }
    return newNummery(apiResult)
  }
}
