
import { ServerWorkerContext } from './serverworker.js';

/**
 * Emulates the client-side google.script.run API.
 * In gas-fakes, this runs in the same Node process.
 */
export class FakeGoogleScriptRun {
  constructor(handlers = {}) {
    this._successHandler = handlers.successHandler;
    this._failureHandler = handlers.failureHandler;
    this._userObject = handlers.userObject;
    this._serverFunctions = handlers.serverFunctions || null;

    return new Proxy(this, {
      get: (target, prop) => {
        // Return existing properties (like withSuccessHandler)
        if (prop in target) {
          return target[prop];
        }

        // Methods for chaining handlers
        if (prop === 'withSuccessHandler') {
          return (handler) => new FakeGoogleScriptRun({ ...target._getHandlers(), successHandler: handler });
        }
        if (prop === 'withFailureHandler') {
          return (handler) => new FakeGoogleScriptRun({ ...target._getHandlers(), failureHandler: handler });
        }
        if (prop === 'withUserObject') {
          return (obj) => new FakeGoogleScriptRun({ ...target._getHandlers(), userObject: obj });
        }

        // Special method to register functions manually if they aren't global
        // This is extremely useful for modular tests or explicit wiring
        if (prop === '__registerServerFunctions') {
           return (funcs) => {
             this._serverFunctions = { ...this._serverFunctions, ...funcs };
             return this;
           }
        }

        // Otherwise, it's a server-side function call
        return (...args) => {
          // Asynchronous execution simulation
          setTimeout(() => {
            try {
              if (prop.endsWith('_') || prop.startsWith('__')) {
                throw new Error(`google.script.run: function "${prop}" is private and cannot be called from the client.`);
              }
              
              // In Apps Script, parameters are passed by value (JSON serialized)
              const serializedArgs = JSON.parse(JSON.stringify(args));
              
              let result;

              // Fallback for modular tests that explicitly registered functions
              if (this._serverFunctions && typeof this._serverFunctions[prop] === 'function') {
                result = this._serverFunctions[prop](...serializedArgs);
              } else {
                // Main stateless execution path via Synchronous Worker Threads
                const ctx = new ServerWorkerContext();
                result = ctx.runFunction(prop, serializedArgs);
              }
              
              // Result is also serialized back
              const serializedResult = typeof result === 'undefined' ? undefined : JSON.parse(JSON.stringify(result));

              if (this._successHandler) {
                this._successHandler(serializedResult, this._userObject);
              }
            } catch (err) {
              if (this._failureHandler) {
                this._failureHandler(err, this._userObject);
              }
            }
          }, 0);
        };
      }
    });
  }

  _getHandlers() {
    return {
      successHandler: this._successHandler,
      failureHandler: this._failureHandler,
      userObject: this._userObject,
      serverFunctions: this._serverFunctions
    };
  }
}

