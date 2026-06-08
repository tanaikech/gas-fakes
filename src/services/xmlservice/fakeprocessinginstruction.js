import { FakeContent } from './fakecontent.js';
import * as Enums from '../enums/xmlenums.js';

export class FakeProcessingInstruction extends FakeContent {
  constructor(target, data = '') {
    super(Enums.ContentTypes.PROCESSINGINSTRUCTION);
    this._target = target;
    this._data = data;
  }

  getTarget() {
    return this._target;
  }

  setTarget(target) {
    this._target = target;
    return this;
  }

  getData() {
    return this._data;
  }

  setData(data) {
    this._data = data;
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
    return `[ProcessingInstruction: <?${this._target} ${this._data}?>]`;
  }
}
