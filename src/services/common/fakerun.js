import { Proxies } from '../../support/proxies.js'

/**
 * create a new FakeRun instance
 * @param  {...any} args
 * @returns {FakeRun}
 */
export const newFakeRun = (...args) => {
  return Proxies.guard(new FakeRun(...args))
}

export class FakeRun {
  constructor (startIndex, endIndex, textStyle) {
    this.__startIndex = startIndex
    this.__endIndex = endIndex
    this.__textStyle = textStyle
  }

  getEndIndex () {
    return this.__endIndex
  }

  getStartIndex () {
    return this.__startIndex
  }

  getTextStyle () {
    return this.__textStyle
  }

  getLinkUrl () {
    return this.__textStyle.getLinkUrl()
  }

  toString () {
    return 'Run'
  }
}