import { FakeAttribute } from './fakeattribute.js';
import { FakeContent } from './fakecontent.js';
import { FakeText } from './faketext.js';
import * as Enums from '../enums/xmlenums.js';

/**
 * Represents a fake XML Element node.
 * Inherits from FakeContent.
 */
export class FakeElement extends FakeContent {
  /**
   * @param {string} name - The qualified name (e.g., "ns:tag").
   * @param {Object} data - Initial data structure (attributes, children, #text).
   * @param {FakeContent | null} parent - The parent element.
   */
  constructor(name, data = {}, parent = null) {
    super(Enums.ContentTypes.ELEMENT);
    
    const parts = name.split(':');
    this._localName = parts.pop();
    this._prefix = parts.length > 0 ? parts[0] : "";
    this._qualifiedName = name;
    this._data = data || {};
    this._parent = parent;
    this._namespace = null;
    this._content = [];
    this._contentInitialized = false;
  }

  // --- Core Properties & Getters ---

  getName() {
    return this._localName;
  }

  getQualifiedName() {
    return this._qualifiedName;
  }

  getNamespace(prefix) {
    if (prefix === undefined) {
      return this._namespace;
    }
    if (this._namespace && this._namespace.getPrefix() === prefix) {
      return this._namespace;
    }
    return null;
  }

  setNamespace(namespace) {
    this._namespace = namespace;
    return this;
  }

  setName(name) {
    this._localName = name;
    this._qualifiedName = this._prefix ? `${this._prefix}:${name}` : name;
    return this;
  }

  // --- Lazy Content Loader ---

  _ensureContent() {
    if (this._contentInitialized) return;
    this._contentInitialized = true;
    this._content = [];
    if (!this._data || typeof this._data !== 'object') return;

    // Load text if present
    if (this._data['#text']) {
      const textNode = new FakeText(this._data['#text']);
      textNode.setParentElement(this);
      this._content.push(textNode);
    }

    // Load child elements
    Object.keys(this._data).forEach(key => {
      if (key.startsWith('@_') || key === '#text') return;
      const childData = this._data[key];
      if (Array.isArray(childData)) {
        childData.forEach(d => {
          const childEl = new FakeElement(key, d, this);
          this._content.push(childEl);
        });
      } else {
        const childEl = new FakeElement(key, childData, this);
        this._content.push(childEl);
      }
    });
  }

  _syncData() {
    const attrs = {};
    if (this._data && typeof this._data === 'object') {
      Object.keys(this._data).forEach(key => {
        if (key.startsWith('@_')) {
          attrs[key] = this._data[key];
        }
      });
    }
    this._data = attrs;

    this._content.forEach(c => {
      if (c instanceof FakeElement) {
        const key = c.getQualifiedName();
        if (!this._data[key]) {
          this._data[key] = c._data;
        } else if (Array.isArray(this._data[key])) {
          this._data[key].push(c._data);
        } else {
          this._data[key] = [this._data[key], c._data];
        }
      } else {
        const textVal = c.getText ? c.getText() : (c.getValue ? c.getValue() : "");
        if (!this._data['#text']) {
          this._data['#text'] = textVal;
        } else {
          this._data['#text'] += textVal;
        }
      }
    });
  }

  // --- Content Accessors ---

  getText() {
    this._ensureContent();
    return this._content
      .filter(c => c.getType() === Enums.ContentTypes.TEXT || c.getType() === Enums.ContentTypes.CDATA)
      .map(c => c.getValue())
      .join('');
  }

  getValue() {
    return this.getText();
  }

  // --- Child/Descendant Navigation ---

  getChild(name, namespace) {
    const children = this.getChildren(name, namespace);
    return children.length > 0 ? children[0] : null;
  }

  getChildren(name, namespace) {
    this._ensureContent();
    let result = this._content.filter(c => c instanceof FakeElement);
    if (name) {
      let targetKey = name;
      if (namespace) {
        const prefix = namespace.getPrefix();
        targetKey = prefix ? `${prefix}:${name}` : name;
      }
      result = result.filter(c => c.getQualifiedName() === targetKey);
    }
    return result;
  }

  getChildText(name, namespace) {
    const child = this.getChild(name, namespace);
    return child ? child.getText() : '';
  }

  getDescendants() {
    this._ensureContent();
    const descendants = [];
    const traverse = (node) => {
      descendants.push(node);
      if (node instanceof FakeElement) {
        node._ensureContent();
        node._content.forEach(child => traverse(child));
      }
    };
    this._content.forEach(c => traverse(c));
    return descendants;
  }

  // --- Attribute Management ---

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

  // --- Text Content Management ---

  setText(text) {
    this._ensureContent();
    this._content = this._content.filter(c => c.getType() !== Enums.ContentTypes.TEXT && c.getType() !== Enums.ContentTypes.CDATA);
    const textNode = new FakeText(text);
    textNode.setParentElement(this);
    this._content.push(textNode);
    this._syncData();
    return this;
  }

  // --- Parent/Structure Management ---

  setParentElement(parent) {
    this._parent = parent;
  }

  getParentElement() {
    return this._parent;
  }

  isRootElement() {
    return this._parent === null;
  }

  isAncestorOf(element) {
    let current = element.getParentElement();
    while (current) {
      if (current === this) return true;
      current = current.getParentElement();
    }
    return false;
  }

  getDocument() {
    let current = this;
    while (current._parent) {
      if (current._parent.constructor && current._parent.constructor.name === 'FakeDocument') {
        return current._parent;
      }
      current = current._parent;
    }
    return null;
  }

  detach() {
    return super.detach();
  }

  // --- Content Manipulation ---

  addChild(element) {
    return this.addContent(element);
  }

  addContent(content, index = null) {
    this._ensureContent();
    if (typeof content.setParentElement === 'function') {
      content.setParentElement(this);
    }
    if (index === null) {
      this._content.push(content);
    } else {
      this._content.splice(index, 0, content);
    }
    this._syncData();
    return this;
  }

  removeContent(contentOrIndex) {
    this._ensureContent();
    if (contentOrIndex === undefined) {
      const old = [...this._content];
      this._content = [];
      this._syncData();
      return old;
    }
    if (typeof contentOrIndex === 'number') {
      const removed = this._content.splice(contentOrIndex, 1)[0];
      if (removed) {
        removed.setParentElement(null);
        this._syncData();
      }
      return removed || null;
    } else {
      const idx = this._content.indexOf(contentOrIndex);
      if (idx !== -1) {
        this._content.splice(idx, 1);
        contentOrIndex.setParentElement(null);
        this._syncData();
        return true;
      }
      return false;
    }
  }

  cloneContent() {
    this._ensureContent();
    return this._content.map(c => {
      if (c instanceof FakeElement) {
        return new FakeElement(c.getQualifiedName(), JSON.parse(JSON.stringify(c._data)));
      } else if (c.getType) {
        const text = c.getText ? c.getText() : (c.getValue ? c.getValue() : "");
        if (c.asCdata()) return new FakeCdata(text);
        if (c.asComment()) return new FakeComment(text);
        if (c.asText()) return new FakeText(text);
      }
      return c;
    });
  }

  getAllContent() {
    this._ensureContent();
    return [...this._content];
  }

  getContent(index) {
    this._ensureContent();
    return this._content[index] || null;
  }

  getContentSize() {
    this._ensureContent();
    return this._content.length;
  }

  toString() {
    return "[Element: <" + this.getName() + "/>]";
  }
}
