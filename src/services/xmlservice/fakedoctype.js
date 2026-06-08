export class FakeDocType {
  constructor(name, publicId = null, systemId = null) {
    this._name = name || '';
    this._publicId = publicId || '';
    this._systemId = systemId || '';
    this._internalSubset = '';
    this._parentElement = null;
  }
  detach() { this._parentElement = null; return this; }
  getElementName() { return this._name; }
  getInternalSubset() { return this._internalSubset; }
  getParentElement() { return this._parentElement; }
  getPublicId() { return this._publicId; }
  getSystemId() { return this._systemId; }
  getValue() {
    return '';
  }
  setElementName(name) { this._name = name || ''; return this; }
  setInternalSubset(data) {
    if (data === null || data === undefined) {
      throw new Error("Argument cannot be null: data");
    }
    this._internalSubset = data;
    return this;
  }
  setPublicId(id) { this._publicId = id || ''; return this; }
  setSystemId(id) { this._systemId = id || ''; return this; }
  setParentElement(parent) { this._parentElement = parent; }
  toString() { return `[DocType: ${this._name}]`; }
}
