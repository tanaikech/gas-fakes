/**
 * @file Provides a fake implementation of the EquationSymbol class.
 */

import { Proxies } from '../../support/proxies.js';
import { FakeElement } from './fakeelement.js';
import { registerElement } from './elementRegistry.js';

/**
 * A fake implementation of the EquationSymbol class.
 * @class
 * @extends {FakeElement}
 * @implements {GoogleAppsScript.Document.EquationSymbol}
 * @see https://developers.google.com/apps-script/reference/document/equation-symbol
 */
export class FakeEquationSymbol extends FakeElement {
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Retrieves the code corresponding to the equation symbol.
   * @returns {string} the symbol code
   * @see https://developers.google.com/apps-script/reference/document/equation-symbol#getCode()
   */
  getCode() {
    return this.__elementMapItem.equationSymbolStyle?.code || "";
  }
}

/**
 * Creates a new fake EquationSymbol.
 * @param {...any} args The arguments for the FakeEquationSymbol constructor.
 * @returns {FakeEquationSymbol} A new proxied FakeEquationSymbol instance.
 */
export const newFakeEquationSymbol = (...args) => Proxies.guard(new FakeEquationSymbol(...args));
registerElement('EQUATION_SYMBOL', newFakeEquationSymbol);
