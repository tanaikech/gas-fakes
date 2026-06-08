import * as Enums from '../enums/xmlenums.js';

/**
 * Base class for all XML content nodes (Text, Element, Comment, etc.).
 * Provides core functionality for content representation and type casting.
 */
export class FakeContent {
  /**
   * @param {string} type - The content type of this node.
   */
  constructor(type) {
    this._type = type;
    this._parent = null;
  }

  getType() {
    return this._type;
  }

  getParentElement() {
    if (this._parent && this._parent.constructor && this._parent.constructor.name === 'FakeDocument') {
      return null;
    }
    return this._parent;
  }

  setParentElement(parent) {
    this._parent = parent;
  }

  detach() {
    if (this._parent && typeof this._parent.removeContent === 'function') {
      this._parent.removeContent(this);
    }
    this._parent = null;
    return this;
  }

  // --- Type Casting Methods ---
  asCdata() { return this._type === Enums.ContentTypes.CDATA ? this : null; }
  asComment() { return this._type === Enums.ContentTypes.COMMENT ? this : null; }
  asDocType() { return this._type === Enums.ContentTypes.DOCTYPE ? this : null; }
  asElement() { return this._type === Enums.ContentTypes.ELEMENT ? this : null; }
  asEntityRef() { return this._type === Enums.ContentTypes.ENTITYREF ? this : null; }
  asProcessingInstruction() { return this._type === Enums.ContentTypes.PROCESSINGINSTRUCTION ? this : null; }
  asText() { return this._type === Enums.ContentTypes.TEXT ? this : null; }

  getValue() {
    return '';
  }
}
