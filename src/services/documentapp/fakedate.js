/**
 * @file Provides a fake implementation of the Date class.
 */
import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { FakeElement } from './fakeelement.js';
import { registerElement } from './elementRegistry.js';

const { is } = Utils;

/**
 * Creates a new proxied FakeDate instance.
 * @param {...any} args The arguments for the FakeDate constructor.
 * @returns {FakeDate} A new proxied FakeDate instance.
 */
export const newFakeDate = (...args) => {
  return Proxies.guard(new FakeDate(...args));
};

/**
 * A fake implementation of the Date class for DocumentApp.
 * @class FakeDate
 * @extends {FakeElement}
 * @implements {GoogleAppsScript.Document.Date}
 * @see https://developers.google.com/apps-script/reference/document/date
 */
export class FakeDate extends FakeElement {
  /**
   * @param {import('./shadowdocument.js').ShadowDocument} shadowDocument The shadow document manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Returns the display value that's rendered in the document.
   * @returns {string} The display value.
   */
  getDisplayText() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Date.getDisplayText');
    if (nargs !== 0) matchThrow();

    const date = this.getTimestamp();
    const locale = this.getLocale() || 'en';

    // Format using a default representation if we can't perfectly mimic GAS.
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Returns the date's locale used for the display value.
   * @returns {string} The locale of the date.
   */
  getLocale() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Date.getLocale');
    if (nargs !== 0) matchThrow();

    // The API doesn't expose a per-date locale. 
    // It's likely inherited from the document.
    return null; 
  }

  /**
   * Returns the timestamp associated with the date.
   * @returns {Date} The timestamp.
   */
  getTimestamp() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Date.getTimestamp');
    if (nargs !== 0) matchThrow();

    const item = this.__elementMapItem;
    const dateResource = item.date;
    if (!dateResource || !dateResource.timestamp) {
      throw new Error('Date element missing timestamp.');
    }
    
    return new Date(dateResource.timestamp.seconds * 1000);
  }

  toString() {
    return 'Date';
  }
}

registerElement('DATE', newFakeDate);
