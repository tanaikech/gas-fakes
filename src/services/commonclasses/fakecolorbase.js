import { ColorType, ThemeColorType} from '../enums/commonenums.js'


export class FakeColorBase {
  // this is color type UNSUPPORTED until built
  constructor() {
    this.__type = 'UNSUPPORTED'
    this.__themeColorType = 'UNSUPPORTED'
    this.__color = null
  }
  __checkType(type, mess) {
    if (type !== this.__type) throw new Error(`Object is not of type ${mess}.`)
  }

  getColorType() {
    return ColorType[this.__type]
  }

  getThemeColorType() {
    return ThemeColorType[this.__themeColorType]
  }

}

