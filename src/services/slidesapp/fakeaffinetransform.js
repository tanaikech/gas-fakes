import { Proxies } from '../../support/proxies.js';
import { newFakeAffineTransformBuilder } from './fakeaffinetransformbuilder.js';

export const newFakeAffineTransform = (...args) => {
  return Proxies.guard(new FakeAffineTransform(...args));
};

export class FakeAffineTransform {
  constructor(scaleX, shearY, shearX, scaleY, translateX, translateY) {
    this.__scaleX = scaleX;
    this.__shearY = shearY;
    this.__shearX = shearX;
    this.__scaleY = scaleY;
    this.__translateX = translateX;
    this.__translateY = translateY;
  }

  getScaleX() {
    return this.__scaleX;
  }

  getScaleY() {
    return this.__scaleY;
  }

  getShearX() {
    return this.__shearX;
  }

  getShearY() {
    return this.__shearY;
  }

  getTranslateX() {
    return this.__translateX;
  }

  getTranslateY() {
    return this.__translateY;
  }

  toBuilder() {
    return newFakeAffineTransformBuilder()
      .setScaleX(this.__scaleX)
      .setShearY(this.__shearY)
      .setShearX(this.__shearX)
      .setScaleY(this.__scaleY)
      .setTranslateX(this.__translateX)
      .setTranslateY(this.__translateY);
  }

  toString() {
    return 'AffineTransform';
  }
}
