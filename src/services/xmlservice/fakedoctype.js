import { FakeContent } from './fakecontent.js';
import * as Enums from '../enums/xmlenums.js';

export class FakeDocType extends FakeContent {
  constructor(name, publicId = null, systemId = null) {
    super(Enums.ContentTypes.DOCTYPE);
    this._name = name || '';
    this._publicId = publicId || '';
    this._systemId = systemId || '';
    this._internalSubset = '';
    this._parent = null;
  }

  getElementName() {
    return this._name;
  }

  getInternalSubset() {
    return this._internalSubset;
  }

  getPublicId() {
    return this._publicId;
  }

  getSystemId() {
    return this._systemId;
  }

  getValue() {
    return '';
  }

  setElementName(name) {
    this._name = name || '';
    return this;
  }

  setInternalSubset(data) {
    if (data === null || data === undefined) {
      throw new Error("Argument cannot be null: data");
    }
    this._internalSubset = data;
    return this;
  }

  setPublicId(id) {
    this._publicId = id || '';
    return this;
  }

  setSystemId(id) {
    this._systemId = id || '';
    return this;
  }

  detach() {
    return super.detach();
  }

  getParentElement() {
    return super.getParentElement();
  }

  toString() {
    return `[DocType: ${this._name}]`;
  }
}
