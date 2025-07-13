import { Proxies } from '../../support/proxies.js'
import { newFakeRun } from './fakerun.js'
import { newFakeTextStyleBuilder } from './faketextstylebuilder.js'

// --- RichTextValue ---

/**
 * create a new FakeRichTextValue instance
 * @param  {...any} args
 * @returns {FakeRichTextValue}
 */
export const newFakeRichTextValue = (...args) => {
  return Proxies.guard(new FakeRichTextValue(...args))
}

export class FakeRichTextValue {
  constructor (text, runs) {
    this.__text = text
    this.__runs = runs
  }

  copy () {
    const builder = newFakeRichTextValueBuilder(this.__text)
    builder.__runs = [...this.__runs]
    return builder.build()
  }

  getEndIndex () {
    return this.__text.length
  }

  getLinkUrl (startOffset) {
    if (this.__runs.length === 0) return null

    if (startOffset === undefined) {
      const firstRun = this.__runs[0]
      if (firstRun.getStartIndex() === 0 && firstRun.getEndIndex() === this.getText().length) {
        return firstRun.getLinkUrl()
      }
      return null
    }

    const run = this.__runs.find(r => r.getStartIndex() <= startOffset && r.getEndIndex() > startOffset)
    return run ? run.getLinkUrl() : null
  }

  getRuns () {
    return this.__runs
  }

  getStartIndex () {
    return 0
  }

  getText () {
    return this.__text
  }

  getTextStyle () {
    return this.__runs.length > 0 ? this.__runs[0].getTextStyle() : newFakeTextStyleBuilder().build()
  }

  toString () {
    return 'RichTextValue'
  }
}

// --- RichTextValueBuilder ---

/**
 * create a new FakeRichTextValueBuilder instance
 * @param  {...any} args
 * @returns {FakeRichTextValueBuilder}
 */
export const newFakeRichTextValueBuilder = (...args) => {
  return Proxies.guard(new FakeRichTextValueBuilder(...args))
}

export class FakeRichTextValueBuilder {
  constructor (text) {
    this.__text = text || ''
    this.__runs = []
  }

  build () {
    if (this.__text && !this.__runs.length) {
      this.__runs.push(newFakeRun(0, this.__text.length, newFakeTextStyleBuilder().build()))
    }
    return newFakeRichTextValue(this.__text, this.__runs)
  }

  copy () {
    const builder = newFakeRichTextValueBuilder(this.__text)
    builder.__runs = this.__runs.map(r => newFakeRun(r.getStartIndex(), r.getEndIndex(), r.getTextStyle().copy().build()))
    return builder
  }

  setLinkUrl (startOffset, endOffset, linkUrl) {
    if (arguments.length === 1) {
      linkUrl = startOffset
      startOffset = 0
      endOffset = this.__text.length
    }
    // This is a simplified implementation that just creates a single run for the link.
    const builder = newFakeTextStyleBuilder()
    if (linkUrl) builder.__link = { uri: linkUrl }
    this.setTextStyle(startOffset, endOffset, builder.build())
    return this
  }

  setText (text) {
    this.__text = text
    this.__runs = []
    return this
  }

  setTextStyle (startOffset, endOffset, textStyle) {
    if (arguments.length === 1) {
      textStyle = startOffset
      startOffset = 0
      endOffset = this.__text.length
    }
    // Simplified implementation
    this.__runs.push(newFakeRun(startOffset, endOffset, textStyle))
    return this
  }

  toString () {
    return 'RichTextValueBuilder'
  }
}