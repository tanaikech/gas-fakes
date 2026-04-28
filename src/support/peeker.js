import { Proxies } from './proxies.js'
/**
 * this is a class to add a hasnext to a generator
 * @class Peeker
 * 
 */
class Peeker {
  /**
   * @constructor 
   * @param {function} generator the generator function to add a hasNext() to
   * @param {function} [continuationHandler] a function to return a continuation token
   * @returns {Peeker}
   */
  constructor(generator, continuationHandler) {
    this.generator = generator
    // in order to be able to do a hasnext we have to actually get the value
    // this is the next value stored
    this.peeked = generator.next()
    this.continuationHandler = continuationHandler
  }

  getContinuationToken() {
    return this.continuationHandler ? this.continuationHandler(this.peeked) : null
  }

  /**
   * we see if there's a next if the peeked at is all over
   * @returns {Boolean}
   */
  hasNext () {
    return !this.peeked.done
  }

  /**
   * get the next value - actually its already got and storef in peeked
   * @returns {object} {value, done}
   */
  next () {
    if (!this.hasNext()) {
      // TODO find out what driveapp does
      throw new Error ('iterator is exhausted - there is no more')
    }
    // instead of returning the next, we return the prepeeked next
    const value = this.peeked.value
    this.peeked = this.generator.next()
    return value?.__fakeResolved ?? value
  }
}

export const newPeeker = (...args) => Proxies.guard(new Peeker (...args))