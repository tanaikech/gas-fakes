import { FakeContent } from './fakecontent.js';
import * as Enums from '../enums/xmlenums.js';

export class FakeEntityRef extends FakeContent {
  constructor(name = '', publicId = null, systemId = null) {
    super(Enums.ContentTypes.ENTITYREF);
    this._name = name;
    this._publicId = publicId;
    this._systemId = systemId;
  }

  getName() {
    return this._name;
  }

  setName(name) {
    this._name = name;
    return this;
  }

  getPublicId() {
    return this._publicId;
  }

  setPublicId(id) {
    this._publicId = id;
    return this;
  }

  getSystemId() {
    return this._systemId;
  }

  setSystemId(id) {
    this._systemId = id;
    return this;
  }

  getValue() {
    return '';
  }

  detach() {
    return super.detach();
  }

  getParentElement() {
    return super.getParentElement();
  }

  toString() {
    return `[EntityRef: &${this._name};]`;
  }
}
