/**
 * @file Provides a fake implementation of the EquationFunction class.
 */

import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { registerElement } from './elementRegistry.js';

/**
 * A fake implementation of the EquationFunction class.
 * @class
 * @extends {FakeContainerElement}
 * @implements {GoogleAppsScript.Document.EquationFunction}
 * @see https://developers.google.com/apps-script/reference/document/equation-function
 */
export class FakeEquationFunction extends FakeContainerElement {
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Retrieves the code corresponding to the equation function.
   * @returns {string} the function code
   * @see https://developers.google.com/apps-script/reference/document/equation-function#getCode()
   */
  getCode() {
    return this.__elementMapItem.equationFunctionStyle?.code || "";
  }
}

/**
 * Creates a new fake EquationFunction.
 * @param {...any} args The arguments for the FakeEquationFunction constructor.
 * @returns {FakeEquationFunction} A new proxied FakeEquationFunction instance.
 */
export const newFakeEquationFunction = (...args) => Proxies.guard(new FakeEquationFunction(...args));
registerElement('EQUATION_FUNCTION', newFakeEquationFunction);
