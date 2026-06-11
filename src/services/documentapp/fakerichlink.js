/**
 * @file Provides a fake implementation of the RichLink class.
 */
import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { FakeElement } from './fakeelement.js';
import { registerElement } from './elementRegistry.js';

const { is } = Utils;

/**
 * Creates a new proxied FakeRichLink instance.
 * @param {...any} args The arguments for the FakeRichLink constructor.
 * @returns {FakeRichLink} A new proxied FakeRichLink instance.
 */
export const newFakeRichLink = (...args) => {
  return Proxies.guard(new FakeRichLink(...args));
};

/**
 * A fake implementation of the RichLink class for DocumentApp.
 * @class FakeRichLink
 * @extends {FakeElement}
 * @implements {GoogleAppsScript.Document.RichLink}
 * @see https://developers.google.com/apps-script/reference/document/rich-link
 */
export class FakeRichLink extends FakeElement {
  /**
   * @param {import('./shadowdocument.js').ShadowDocument} shadowDocument The shadow document manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Returns the MIME type of the link.
   * @returns {string|null} The MIME type of the link.
   */
  getMimeType() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'RichLink.getMimeType');
    if (nargs !== 0) matchThrow();

    const richLink = this.__elementMapItem.richLink;
    return richLink?.richLinkProperties ? richLink.richLinkProperties.mimeType : null;
  }

  /**
   * Returns the link's displayed title.
   * @returns {string} The display title of the link.
   */
  getTitle() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'RichLink.getTitle');
    if (nargs !== 0) matchThrow();

    const richLink = this.__elementMapItem.richLink;
    return richLink?.richLinkProperties ? richLink.richLinkProperties.title : null;
  }

  /**
   * Returns the URL of the resource.
   * @returns {string} The URL of the resource.
   */
  getUrl() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'RichLink.getUrl');
    if (nargs !== 0) matchThrow();

    const richLink = this.__elementMapItem.richLink;
    return richLink ? richLink.uri : null;
  }

  toString() {
    return 'RichLink';
  }
}

registerElement('RICH_LINK', newFakeRichLink);
