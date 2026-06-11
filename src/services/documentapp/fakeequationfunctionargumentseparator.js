/**
 * @file Provides a fake implementation of the EquationFunctionArgumentSeparator class.
 */

import { Proxies } from '../../support/proxies.js';
import { FakeElement } from './fakeelement.js';
import { registerElement } from './elementRegistry.js';

/**
 * A fake implementation of the EquationFunctionArgumentSeparator class.
 * @class
 * @extends {FakeElement}
 * @implements {GoogleAppsScript.Document.EquationFunctionArgumentSeparator}
 * @see https://developers.google.com/apps-script/reference/document/equation-function-argument-separator
 */
export class FakeEquationFunctionArgumentSeparator extends FakeElement {
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }
}

/**
 * Creates a new fake EquationFunctionArgumentSeparator.
 * @param {...any} args The arguments for the FakeEquationFunctionArgumentSeparator constructor.
 * @returns {FakeEquationFunctionArgumentSeparator} A new proxied FakeEquationFunctionArgumentSeparator instance.
 */
export const newFakeEquationFunctionArgumentSeparator = (...args) => Proxies.guard(new FakeEquationFunctionArgumentSeparator(...args));
registerElement('EQUATION_FUNCTION_ARGUMENT_SEPARATOR', newFakeEquationFunctionArgumentSeparator);
