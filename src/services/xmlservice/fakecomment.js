import { FakeContent } from './fakecontent.js';
import * as Enums from '../enums/xmlenums.js';

export class FakeComment extends FakeContent {
  constructor(text = '') {
    super(Enums.ContentTypes.COMMENT);
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

  detach() {
    return super.detach();
  }

  getParentElement() {
    return super.getParentElement();
  }

  toString() {
    return `[Comment: <!--${this._text}-->]`;
  }
}
