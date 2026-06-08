import { FakeAttribute } from './fakeattribute.js';

export class FakeElement {
  constructor(name, data = {}, parent = null) {
    const parts = name.split(':');
    this._localName = parts.pop();
    this._prefix = parts.length > 0 ? parts[0] : "";
    this._qualifiedName = name;
    this._data = data || {};
    this._parent = parent;
  }

  getName() {
    return this._localName;
  }

  getQualifiedName() {
    return this._qualifiedName;
  }

  getText() {
    if (typeof this._data === 'string') return this._data;
    if (this._data && typeof this._data === 'object') {
      return this._data['#text'] || '';
    }
    return '';
  }

  getValue() {
    return this.getText();
  }

  getChild(name, namespace) {
    const children = this.getChildren(name, namespace);
    return children.length > 0 ? children[0] : null;
  }

  getChildren(name, namespace) {
    if (!this._data || typeof this._data !== 'object') return [];

    let targetKey = name;
    if (name && namespace) {
      const prefix = namespace.getPrefix();
      targetKey = prefix ? `${prefix}:${name}` : name;
    }

    if (targetKey) {
      const childData = this._data[targetKey];
      if (!childData) return [];
      if (Array.isArray(childData)) {
        return childData.map(d => new FakeElement(targetKey, d, this));
      }
      return [new FakeElement(targetKey, childData, this)];
    }

    return Object.keys(this._data)
      .filter(key => !key.startsWith('@_') && key !== '#text')
      .flatMap(key => {
        const d = this._data[key];
        if (Array.isArray(d)) {
          return d.map(item => new FakeElement(key, item, this));
        }
        return [new FakeElement(key, d, this)];
      });
  }

  getChildText(name, namespace) {
    const child = this.getChild(name, namespace);
    return child ? child.getText() : '';
  }

  getAttribute(name, namespace = null) {
    if (!this._data || typeof this._data !== 'object') return null;
    const attrValue = this._data[`@_${name}`];
    if (attrValue === undefined) return null;
    return new FakeAttribute(name, String(attrValue), namespace);
  }

  getAttributes() {
    if (!this._data || typeof this._data !== 'object') return [];
    return Object.keys(this._data)
      .filter(key => key.startsWith('@_'))
      .map(key => {
        const name = key.slice(2);
        return new FakeAttribute(name, String(this._data[key]));
      });
  }

  setAttribute(name, value, namespace = null) {
    if (typeof name === 'object') {
      const attr = name;
      this._data[`@_${attr.getName()}`] = String(attr.getValue());
    } else {
      this._data[`@_${name}`] = String(value);
    }
    return this;
  }

  removeAttribute(name, namespace = null) {
    const key = typeof name === 'object' ? `@_${name.getName()}` : `@_${name}`;
    if (this._data && this._data[key] !== undefined) {
      delete this._data[key];
      return true;
    }
    return false;
  }

  setText(text) {
    if (typeof this._data !== 'object' || this._data === null) {
      this._data = {};
    }
    Object.keys(this._data).forEach(key => {
      if (!key.startsWith('@_')) {
        delete this._data[key];
      }
    });
    this._data['#text'] = String(text);
    return this;
  }

  addChild(element) {
    if (typeof this._data !== 'object' || this._data === null) {
      this._data = {};
    }
    element.setParentElement(this);
    const key = element.getQualifiedName();
    const childData = element._data;

    if (!this._data[key]) {
      this._data[key] = childData;
    } else if (Array.isArray(this._data[key])) {
      this._data[key].push(childData);
    } else {
      this._data[key] = [this._data[key], childData];
    }
    return this;
  }

  addContent(content) {
    if (typeof this._data !== 'object' || this._data === null) {
      this._data = {};
    }
    if (typeof content.setParentElement === 'function') {
      content.setParentElement(this);
    }
    if (typeof content.getQualifiedName === 'function') {
      return this.addChild(content);
    }
    const textVal = typeof content.getText === 'function' ? content.getText() : (typeof content.getValue === 'function' ? content.getValue() : "");
    if (!this._data['#text']) {
      this._data['#text'] = textVal;
    } else {
      this._data['#text'] += textVal;
    }
    return this;
  }

  setParentElement(parent) {
    this._parent = parent;
  }

  getParentElement() {
    return this._parent;
  }

  toString() {
    return "[Element: <" + this.getName() + "/>]";
  }
}
