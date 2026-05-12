export class FakeHtmlOutputMetaTag {
  constructor(name, content) {
    this._name = name;
    this._content = content;
  }

  getContent() {
    return this._content;
  }

  getName() {
    return this._name;
  }
}
