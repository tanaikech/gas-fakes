import { Proxies } from '../../support/proxies.js';
import { newFakeAffineTransform } from './fakeaffinetransform.js';

export const newFakeAffineTransformBuilder = (...args) => {
  return Proxies.guard(new FakeAffineTransformBuilder(...args));
};

export class FakeAffineTransformBuilder {
  constructor() {
    // Defaults? Documentation doesn't explicitly specify, but identity matrix is reasonable.
    // scaleX=1, scaleY=1, others 0.
    this.__scaleX = 1;
    this.__shearY = 0;
    this.__shearX = 0;
    this.__scaleY = 1;
    this.__translateX = 0;
    this.__translateY = 0;
  }

  build() {
    return newFakeAffineTransform(
      this.__scaleX,
      this.__shearY,
      this.__shearX,
      this.__scaleY,
      this.__translateX,
      this.__translateY
    );
  }

  setScaleX(scaleX) {
    this.__scaleX = scaleX;
    return this;
  }

  setScaleY(scaleY) {
    this.__scaleY = scaleY;
    return this;
  }

  setShearX(shearX) {
    this.__shearX = shearX;
    return this;
  }

  setShearY(shearY) {
    this.__shearY = shearY;
    return this;
  }

  setTranslateX(translateX) {
    this.__translateX = translateX;
    return this;
  }

  setTranslateY(translateY) {
    this.__translateY = translateY;
    return this;
  }

  toString() {
    return 'AffineTransformBuilder';
  }
}
