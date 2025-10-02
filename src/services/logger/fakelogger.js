import { format } from 'util';
import { Proxies } from '../../support/proxies.js';
import { Logging } from '@google-cloud/logging';

// --- Cloud Logging Integration ---

// Cloud Logging client instance.
export let cloudLog;

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
    /**
     * @private
     * @type {string}
     */
    this.__destination = (process.env.LOG_DESTINATION || 'CONSOLE').toUpperCase();
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
    // Check the instance's destination property.
    if (this.__destination === 'NONE') {
      // Still push to the internal log for getLog(), but don't output.
      const message = format(formatOrData, ...values);
      this.__log.push(message);
      return this;
    }

    const message = format(formatOrData, ...values);
    this.__log.push(message);

    // Pass the destination and instance context to the writer function.
    writeToCloudOrConsole(message, this);

    return this;
  }

  /**
   * Returns 'Logger'.
   * @returns {string}
   */
  toString() {
    return 'Logger';
  }

  /**
   * Sets the logging destination dynamically.
   * @param {string} destination - The destination ('CONSOLE', 'CLOUD', 'BOTH', 'NONE').
   * @returns {FakeLogger}
   */
  __setLogDestination(destination) {
    if (['CONSOLE', 'CLOUD', 'BOTH', 'NONE'].includes(destination.toUpperCase())) {
      this.__destination = destination.toUpperCase();
    }
    return this;
  }
}

/**
 * @returns {FakeLogger}
 */
export const newFakeLogger = (...args) => Proxies.guard(new FakeLogger(...args));

/**
 * Writes a log message to the configured destination (Cloud Logging or console).
 * @param {string} message The log message.
 * @private
 * @param {FakeLogger} loggerInstance The logger instance, to access its destination.
 */
const writeToCloudOrConsole =  (message, loggerInstance) => {
  const logDestination = loggerInstance.__destination;
  const useConsoleLogging = logDestination === 'CONSOLE' || logDestination === 'BOTH';
  const useCloudLogging = logDestination === 'CLOUD' || logDestination === 'BOTH';

  // Lazy-initialize the cloud logger if needed.
  const initializeCloudLogging = () => {
    if (cloudLog) return; // Already initialized.
    try {
      const projectId = ScriptApp.__projectId;
      if (!projectId) {
        throw new Error('Could not determine Google Cloud Project ID for logging.');
      }
      const logging = new Logging({ projectId });
      const logName = 'gas-fakes/console_logs';
      cloudLog = logging.log(logName);
      console.info(`gas-fakes: Cloud Logging is enabled, writing to log "${logName}".`);
    } catch (err) {
      console.warn(
        `gas-fakes: Cloud Logging failed to initialize. ` +
        'Falling back to console.log.',
        err.message
      );
      cloudLog = null;
    }
  };

  // Write to console if CONSOLE or BOTH is specified.
  if (useConsoleLogging) {
    // Write structured JSON to stdout for agent-based collection or local viewing.
    const logEntry = {
      message: message,
      severity: 'INFO',
    };
    console.log(JSON.stringify(logEntry));
  }

  // Write to Cloud Logging if CLOUD or BOTH is specified and client is ready.
  if (useCloudLogging) {
    // Initialize the cloud logger on the first use if it hasn't been already.
    if (!cloudLog) {
      initializeCloudLogging();
    }

    const metadata = {
      // Use the 'global' resource type, which is a generic fallback for applications
      // not running on a specific GCP compute service.
      resource: { type: 'global' },
      labels: {
        'gas-fakes-scriptId': ScriptApp.getScriptId(),
        'gas-fakes-userId': ScriptApp.__userId,
      },
      jsonPayload: { message: message },
      severity: 'INFO',
    };

    // Use log.write which returns a promise. T
    // his allows us to catch errors, such as a disabled API or permission issues.
    // however we are firing and forgetting so an error might appear later on in execution
    if (cloudLog) {
      cloudLog.write(cloudLog.entry(metadata)).catch(err=> console.error('gas-fakes: Failed to write to Cloud Logging.', err.message))
    }
  }
};