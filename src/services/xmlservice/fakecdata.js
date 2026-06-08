export class FakeCdata {
  constructor(text, parentElement = null) {
    this._text = text || '';
    this._parentElement = parentElement;
  }
  append(text) { this._text += text; return this; }
  detach() { this._parentElement = null; return this; }
  getParentElement() { return this._parentElement; }
  getText() { return this._text; }
  getValue() { return this._text; }
  setText(text) { this._text = text || ''; return this; }
  setParentElement(parent) { this._parentElement = parent; }
  toString() { return `[CDATA: ${this._text}]`; }
}
