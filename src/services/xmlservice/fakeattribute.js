import { FakeNamespace } from './fakenamespace.js';

export class FakeAttribute {
  constructor(name, value, namespace = null) {
    this._name = name;
    this._value = value;
    this._namespace = namespace || new FakeNamespace("", "");
  }
  getName() { return this._name; }
  getValue() { return this._value; }
  getNamespace() { return this._namespace; }
  setName(name) { this._name = name; return this; }
  setValue(value) { this._value = value; return this; }
  setNamespace(namespace) { this._namespace = namespace; return this; }
}
