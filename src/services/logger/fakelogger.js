import { format } from 'util';
import { Proxies } from '../../support/proxies.js';

/**
 * @class
 * @implements {GoogleAppsScript.Base.Logger}
 */
export class FakeLogger {
  constructor() {
    /**
     * @private
     * @type {string[]}
     */
    this.__log = [];
    Object.seal(this);
  }

  /**
   * Clears the log.
   */
  clear() {
    this.__log = [];
  }

  /**
   * Returns the log contents.
   * @returns {string}
   */
  getLog() {
    return this.__log.join('\n');
  }

  /**
   * Logs a message.
   * @param {string} formatOrData
   * @param {...any} values
   * @returns {FakeLogger}
   */
  log(formatOrData, ...values) {
    const message = format(formatOrData, ...values);
    this.__log.push(message);

    // In Node.js, writing a JSON string to stdout is the standard way to produce
    // structured logs for Google Cloud Logging.
    // The Cloud Logging agent will parse this JSON and treat its properties
    // as structured log fields.
    const logEntry = {
      message: message,
      severity: 'INFO', // Corresponds to Logger.log() in Apps Script
    };
    console.log(JSON.stringify(logEntry));

    return this;
  }

  /**
   * Returns 'Logger'.
   * @returns {string}
   */
  toString() {
    return 'Logger';
  }
}

/**
 * @returns {FakeLogger}
 */
export const newFakeLogger = (...args) => Proxies.guard(new FakeLogger(...args));