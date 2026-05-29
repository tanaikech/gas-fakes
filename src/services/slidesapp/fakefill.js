import { Proxies } from '../../support/proxies.js';
import { newFakeSolidFill } from './fakesolidfill.js';
import { FillType } from '../enums/slidesenums.js';

export const newFakeFill = (...args) => {
  return Proxies.guard(new FakeFill(...args));
};

export class FakeFill {
  constructor(element) {
    this.__element = element;
  }

  get __fill() {
    if (this.__element.__resource.shape) {
      return this.__element.__resource.shape.shapeProperties?.shapeBackgroundFill || {};
    }
    return this.__element.__resource.pageBackgroundFill || {};
  }

  getType() {
    const fill = this.__fill;
    if (fill.solidFill && fill.propertyState !== 'NOT_RENDERED') {
      return FillType.SOLID;
    }
    return FillType.NONE;
  }

  isVisible() {
    return this.getType().toString() !== 'NONE';
  }

  getSolidFill() {
    if (this.getType().toString() !== 'SOLID') {
      return null;
    }
    return newFakeSolidFill(this);
  }

  setSolidFill(...args) {
    let rgbColor = null;
    let themeColor = null;
    let alpha = 1.0;

    if (args.length >= 3) {
      const r = args[0] / 255;
      const g = args[1] / 255;
      const b = args[2] / 255;
      rgbColor = { red: r, green: g, blue: b };
      if (args.length === 4) {
        alpha = args[3];
      }
    } else if (args.length > 0) {
      const colorArg = args[0];
      if (args.length === 2) {
        alpha = args[1];
      }

      if (typeof colorArg === 'string') {
        if (colorArg.startsWith('#') || colorArg.length === 6 || colorArg.length === 3) {
          const hex = colorArg.startsWith('#') ? colorArg : '#' + colorArg;
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          if (result) {
            rgbColor = {
              red: parseInt(result[1], 16) / 255.0,
              green: parseInt(result[2], 16) / 255.0,
              blue: parseInt(result[3], 16) / 255.0
            };
          }
        } else {
          themeColor = colorArg.toString();
        }
      } else if (colorArg && typeof colorArg.getColorType === 'function') {
        if (colorArg.getColorType().toString() === 'RGB') {
          const rgb = colorArg.asRgbColor();
          rgbColor = {
            red: rgb.getRed() / 255,
            green: rgb.getGreen() / 255,
            blue: rgb.getBlue() / 255
          };
        } else if (colorArg.getColorType().toString() === 'THEME') {
          themeColor = colorArg.asThemeColor().getThemeColorType().toString();
        }
      } else if (colorArg && colorArg.toString) {
        themeColor = colorArg.toString();
      }
    }

    const solidFill = {
      color: {}
    };
    if (rgbColor) {
      solidFill.color.rgbColor = rgbColor;
    } else if (themeColor) {
      solidFill.color.themeColor = themeColor;
    }
    if (alpha !== 1.0) {
      solidFill.alpha = alpha;
    }

    const presentationId = this.__element.__presentation?.getId() || this.__element.__page?.__presentation?.getId();
    if (this.__element.__resource.shape) {
      Slides.Presentations.batchUpdate([{
        updateShapeProperties: {
          objectId: this.__element.getObjectId(),
          shapeProperties: {
            shapeBackgroundFill: {
              propertyState: 'RENDERED',
              solidFill: solidFill
            }
          },
          fields: 'shapeBackgroundFill'
        }
      }], presentationId);
    } else {
      Slides.Presentations.batchUpdate([{
        updatePageProperties: {
          objectId: this.__element.getObjectId(),
          pageProperties: {
            pageBackgroundFill: {
              propertyState: 'RENDERED',
              solidFill: solidFill
            }
          },
          fields: 'pageBackgroundFill'
        }
      }], presentationId);
    }

    return this;
  }

  setTransparent() {
    const presentationId = this.__element.__presentation?.getId() || this.__element.__page?.__presentation?.getId();
    if (this.__element.__resource.shape) {
      Slides.Presentations.batchUpdate([{
        updateShapeProperties: {
          objectId: this.__element.getObjectId(),
          shapeProperties: {
            shapeBackgroundFill: {
              propertyState: 'NOT_RENDERED'
            }
          },
          fields: 'shapeBackgroundFill'
        }
      }], presentationId);
    } else {
      Slides.Presentations.batchUpdate([{
        updatePageProperties: {
          objectId: this.__element.getObjectId(),
          pageProperties: {
            pageBackgroundFill: {
              propertyState: 'NOT_RENDERED'
            }
          },
          fields: 'pageBackgroundFill'
        }
      }], presentationId);
    }
    return this;
  }

  toString() {
    return 'Fill';
  }
}
