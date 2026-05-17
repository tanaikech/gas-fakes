export class FakeTextOutput {
  constructor(content = "") {
    this._content = content;
    this._mimeType = "text/plain";
    this._fileName = null;
    this.__isTextOutput = true;
  }

  append(content) {
    this._content += content;
    return this;
  }

  clear() {
    this._content = null;
    return this;
  }

  downloadAsFile(filename) {
    this._fileName = filename;
    return this;
  }

  getContent() {
    return this._content;
  }

  getFileName() {
    return this._fileName;
  }

  getMimeType() {
    return this._mimeType;
  }

  setContent(content) {
    this._content = content;
    return this;
  }

  setMimeType(mimeType) {
    this._mimeType = mimeType;
    return this;
  }
}
