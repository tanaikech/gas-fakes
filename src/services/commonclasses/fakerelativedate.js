import { Proxies } from '../../support/proxies.js'
import { newNummery } from '../enums/nummery.js'

/**
 * create a new FakeRelativeDate 
 * @param  {...any} args 
 * @returns {FakeRelativeDate}
 */
export const newFakeRelativeDate = (...args) => {
  return Proxies.guard(new FakeRelativeDate(...args))
}
// https://developers.google.com/apps-script/reference/spreadsheet/relative-date
class FakeRelativeDate {
  constructor(value) {
    if (!relativeDateMapping[value]) {
      throw new Error(`${value} is not a valid relative date`)
    }
    return newNummery(value, relativeDateMapping)
  }
}

const relativeDateMapping = Object.freeze({
  TODAY: 'TODAY',
  YESTERDAY: 'YESTERDAY',
  TOMORROW: 'TOMORROW',
  PAST_WEEK: 'PAST_WEEK',
  PAST_MONTH: 'PAST_MONTH',
  PAST_YEAR: 'PAST_YEAR'
})

export const RelativeDate = Reflect.ownKeys(relativeDateMapping).reduce((p, c) => {
  p[c] = newFakeRelativeDate(c)
  return p
}, {} )