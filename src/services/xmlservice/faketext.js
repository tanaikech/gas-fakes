import { FakeContent } from './fakecontent.js';
import * as Enums from '../enums/xmlenums.js';

export class FakeText extends FakeContent {
  constructor(text = '') {
    super(Enums.ContentTypes.TEXT);
    this._text = text;
  }

  getText() {
    return this._text;
  }

  setText(text) {
    this._text = text || '';
    return this;
  }

  getValue() {
    return this._text;
  }

  append(text) {
    this._text += text || '';
    return this;
  }

  detach() {
    return super.detach();
  }

  getParentElement() {
    return super.getParentElement();
  }

  toString() {
    return `[Text: ${this._text}]`;
  }
}
