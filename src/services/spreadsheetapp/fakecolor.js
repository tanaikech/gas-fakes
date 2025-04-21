/**
 * @file
 * @imports ../typedefs.js
 */
/**
 * create a new FakeColor instance
 * @param  {...any} args 
 * @returns {FakeColor}
 */
export const FakeColor = (...args) => {
  return Proxies.guard(new FakeColor(...args))
}


class FakeColor {
  constructor(builder) {
    this.__builder = builder
  }
  asRgbColor() {
    return this.__builder.__color
  }
  asThemeColor() {
    return this.__builder.__color
  }
  getColorType() {
    return this.__builder.__colorType

  }
}

