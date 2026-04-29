import { Proxies } from '../../support/proxies.js';
import { makeColorFromApi } from '../common/fakecolorbuilder.js';
import { InterpolationType } from '../enums/sheetsenums.js';

export const newFakeGradientCondition = (...args) => {
  return Proxies.guard(new FakeGradientCondition(...args));
};

export class FakeGradientCondition {
  constructor(apiGradient) {
    this.__apiGradient = apiGradient || {};
  }

  __getColor(point) {
    if (!point) return null;
    if (point.colorStyle) return makeColorFromApi(point.colorStyle);
    if (point.color) return makeColorFromApi({ rgbColor: point.color });
    return null;
  }

  __getType(point) {
    if (!point || !point.type) return null;
    return InterpolationType[point.type] || null;
  }

  __getValue(point) {
    if (!point) return "";
    if (point.type === 'MIN' || point.type === 'MAX') return "";
    return point.value !== undefined ? point.value : "";
  }

  getMaxColorObject() {
    return this.__getColor(this.__apiGradient.maxpoint);
  }

  getMaxType() {
    return this.__getType(this.__apiGradient.maxpoint);
  }

  getMaxValue() {
    return this.__getValue(this.__apiGradient.maxpoint);
  }

  getMidColorObject() {
    return this.__getColor(this.__apiGradient.midpoint);
  }

  getMidType() {
    return this.__getType(this.__apiGradient.midpoint);
  }

  getMidValue() {
    return this.__getValue(this.__apiGradient.midpoint);
  }

  getMinColorObject() {
    return this.__getColor(this.__apiGradient.minpoint);
  }

  getMinType() {
    return this.__getType(this.__apiGradient.minpoint);
  }

  getMinValue() {
    return this.__getValue(this.__apiGradient.minpoint);
  }

  toString() {
    return 'GradientCondition';
  }
}
