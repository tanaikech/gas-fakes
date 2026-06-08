import { FakeElement } from './fakeelement.js';
import { FakeDocType } from './fakedoctype.js';

export class FakeDocument {
  constructor(rootElement = null) {
    this._content = [];
    this._rootElement = rootElement;
    if (rootElement) {
      this._content.push(rootElement);
    }
  }
  getRootElement() { return this._rootElement; }
  setRootElement(element) {
    if (this._rootElement) {
      const idx = this._content.indexOf(this._rootElement);
      if (idx !== -1) {
        this._content[idx] = element;
      }
    } else {
      this._content.push(element);
    }
    this._rootElement = element;
    return this;
  }
  hasRootElement() { return !!this._rootElement; }
  detachRootElement() {
    const root = this._rootElement;
    if (root) {
      const idx = this._content.indexOf(root);
      if (idx !== -1) this._content.splice(idx, 1);
      this._rootElement = null;
    }
    return root;
  }
  getDocType() {
    return this._content.find(c => c instanceof FakeDocType) || null;
  }
  setDocType(doctype) {
    const existing = this.getDocType();
    if (existing) {
      const idx = this._content.indexOf(existing);
      this._content[idx] = doctype;
    } else {
      this._content.unshift(doctype);
    }
    return this;
  }
  addContent(content, index = null) {
    if (content instanceof FakeElement) {
      if (this.hasRootElement()) {
        throw new Error("XmlService: Document already has a root element");
      }
      this._rootElement = content;
    }
    if (index === null) {
      this._content.push(content);
    } else {
      this._content.splice(index, 0, content);
    }
    return this;
  }
  cloneContent() {
    return [...this._content];
  }
  getAllContent() { return [...this._content]; }
  getContent(index) { return this._content[index] || null; }
  getContentSize() { return this._content.length; }
  getDescendants() {
    const descendants = [];
    const traverse = (node) => {
      descendants.push(node);
      if (node instanceof FakeElement) {
        node.getChildren().forEach(child => traverse(child));
      }
    };
    this._content.forEach(c => traverse(c));
    return descendants;
  }
  removeContent(contentOrIndex) {
    if (typeof contentOrIndex === 'number') {
      const removed = this._content.splice(contentOrIndex, 1)[0];
      if (removed === this._rootElement) this._rootElement = null;
      return removed || null;
    } else {
      const idx = this._content.indexOf(contentOrIndex);
      if (idx !== -1) {
        this._content.splice(idx, 1);
        if (contentOrIndex === this._rootElement) this._rootElement = null;
        return true;
      }
      return false;
    }
  }
  toString() {
    const rootName = this._rootElement ? this._rootElement.getName() : '';
    const hasDocType = this.getDocType() ? 'has DOCTYPE declaration' : 'No DOCTYPE declaration';
    return `[Document:  ${hasDocType}, Root is [Element: <${rootName}/>]]`;
  }
}
