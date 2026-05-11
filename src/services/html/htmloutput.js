
export class FakeHtmlOutput {
  constructor(content = '') {
    this._content = content;
    this._title = '';
    this._width = 600;
    this._height = 450;
    this._metaData = {};
    this._faviconUrl = '';
    this._xFrameOptionsMode = null;
    this._sandboxMode = null;
    this.__isHtmlOutput = true;
  }

  getContent() {
    return this._content;
  }

  setContent(content) {
    this._content = content;
    return this;
  }

  append(content) {
    this._content += content;
    return this;
  }

  setTitle(title) {
    this._title = title;
    return this;
  }

  getTitle() {
    return this._title;
  }

  setWidth(width) {
    this._width = width;
    return this;
  }

  getWidth() {
    return this._width;
  }

  setHeight(height) {
    this._height = height;
    return this;
  }

  getHeight() {
    return this._height;
  }

  setFaviconUrl(iconUrl) {
    this._faviconUrl = iconUrl;
    return this;
  }

  getFaviconUrl() {
    return this._faviconUrl;
  }

  addMetaTag(name, content) {
    this._metaData[name] = content;
    return this;
  }

  setXFrameOptionsMode(mode) {
    this._xFrameOptionsMode = mode;
    return this;
  }

  setSandboxMode(mode) {
    this._sandboxMode = mode;
    return this;
  }
}
