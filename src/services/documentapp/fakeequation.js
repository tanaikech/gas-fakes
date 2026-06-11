/**
 * @file Provides a fake implementation of the Equation class.
 */

import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { registerElement } from './elementRegistry.js';

/**
 * A fake implementation of the Equation class.
 * @class
 * @extends {FakeContainerElement}
 * @implements {GoogleAppsScript.Document.Equation}
 * @see https://developers.google.com/apps-script/reference/document/equation
 */
export class FakeEquation extends FakeContainerElement {
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }
}

/**
 * Creates a new fake Equation.
 * @param {...any} args The arguments for the FakeEquation constructor.
 * @returns {FakeEquation} A new proxied FakeEquation instance.
 */
export const newFakeEquation = (...args) => Proxies.guard(new FakeEquation(...args));
registerElement('EQUATION', newFakeEquation);
