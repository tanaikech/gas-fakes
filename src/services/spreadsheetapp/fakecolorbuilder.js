/**
 * @file
 * @imports ../typedefs.js
 */
/**
 * create a new FakeColorBuilder instance
 * @param  {...any} args 
 * @returns {FakeColorBuilder}
 */
export const newFakeColorBuilder = (...args) => {
  return Proxies.guard(new FakeColor(...args))
}


class FakeColorBuilder {
  // this is color type UNSUPPORTED until built
  constructor() {
    this.__type = {
      toString() {
        return 'UNSUPPORTED'
      }
    }
  }
  asRgbColor() {
    throw new Error('Object is not of type RgbColor.')
  }
  asThemeColor() {
    throw new Error ('Object is not of type ThemeColor.')
  }
  getColorType() {
    return this.__type
  }
  setRgbColor(color) {
    this.__color = color
    this.__colorType = 'RGB'
    return this
  }

  setThemeColor(color) {
    this.__color = color
    this.__colorType = 'THEME'
    return this
  }
  build() {
    return newFakeColor(this)
  }


}

