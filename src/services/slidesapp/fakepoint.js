import { Proxies } from '../../support/proxies.js';

export const newFakePoint = (...args) => {
  return Proxies.guard(new FakePoint(...args));
};

export class FakePoint {
  constructor(x, y) {
    this.__x = x;
    this.__y = y;
  }

  getX() {
    return this.__x;
  }

  getY() {
    return this.__y;
  }

  toString() {
    return 'Point';
  }
}
