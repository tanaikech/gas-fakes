/**
 * A fake implementation of the FootnoteReference class for DocumentApp.
 * @class FakeFootnoteReference
 * @extends {FakeElement}
 * @implements {GoogleAppsScript.Document.FootnoteReference}
 * @see https://developers.google.com/apps-script/reference/document/footnote-reference
 */
class FakeFootnoteReference extends FakeElement {
  /**
   * @param {import('./shadowdocument.js').ShadowDocument} shadowDocument The shadow document manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Gets the footnote that this reference points to.
   * @returns {GoogleAppsScript.Document.Footnote} The footnote.
   */
  getFootnote() {
    const item = this.__elementMapItem;
    const footnoteId = item.footnoteReference?.footnoteId;
    if (!footnoteId) {
      throw new Error('FootnoteReference has no footnoteId.');
    }
    return this.shadowDocument.getFootnoteById(footnoteId);
  }

  /**
   * Returns the string "FootnoteReference".
   * @returns {string}
   */
  toString() {
    return 'FootnoteReference';
  }
}
/**
 * Creates a new proxied FakeFootnoteReference instance.
 * @param {...any} args The arguments for the FakeFootnoteReference constructor.
 * @returns {FakeFootnoteReference} A new proxied FakeFootnoteReference instance.
 */
export const newFakeFootnoteReference = (...args) => {
  return Proxies.guard(new FakeFootnoteReference(...args));
};

registerElement('FOOTNOTE_REFERENCE', newFakeFootnoteReference);
