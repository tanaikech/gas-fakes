import { Proxies } from '../../support/proxies.js';
import { newFakeSolidFill } from './fakesolidfill.js';
import { newFakePictureFill } from './fakepicturefill.js';
import { PageBackgroundType } from '../enums/slidesenums.js';

export const newFakePageBackground = (...args) => {
  return Proxies.guard(new FakePageBackground(...args));
};

export class FakePageBackground {
  constructor(page) {
    this.__page = page;
  }

  get __resource() {
    const res = this.__page.__resource;
    if (res && res.pageProperties && res.pageProperties.pageBackgroundFill) {
        return res.pageProperties.pageBackgroundFill;
    }
    return null;
  }

  getPictureFill() {
    const res = this.__resource;
    return res?.stretchedPictureFill ? newFakePictureFill(res.stretchedPictureFill, this.__page) : null;
  }

  getSolidFill() {
    return newFakeSolidFill(this.__page);
  }

  getType() {
    const res = this.__resource;
    if (!res || res.propertyState === 'NOT_RENDERED') return PageBackgroundType.NONE;
    if (res.stretchedPictureFill) return PageBackgroundType.PICTURE;
    if (res.solidFill) return PageBackgroundType.SOLID;
    return PageBackgroundType.NONE;
  }

  isVisible() {
    return this.getType().toString() !== 'NONE';
  }

  setPictureFill(urlOrBlob) {
    const presentationId = this.__page.__presentation.getId();
    let url = typeof urlOrBlob === 'string' ? urlOrBlob : '';
    
    const requests = [{
        updatePageProperties: {
            objectId: this.__page.getObjectId(),
            pageProperties: {
                pageBackgroundFill: {
                    stretchedPictureFill: {
                        contentUrl: url
                    }
                }
            },
            fields: 'pageBackgroundFill'
        }
    }];
    Slides.Presentations.batchUpdate({ requests }, presentationId);

    return this;
  }

  setSolidFill(color, alpha = 1.0) {
    const presentationId = this.__page.__presentation.getId();
    
    let solidFill = {};
    if (typeof color === 'string') {
      const hex = color.replace('#', '');
      solidFill = {
        color: {
          rgbColor: {
            red: parseInt(hex.substring(0, 2), 16) / 255,
            green: parseInt(hex.substring(2, 4), 16) / 255,
            blue: parseInt(hex.substring(4, 6), 16) / 255
          }
        }
      };
    } else if (color && color.toString() === 'Color') {
       solidFill = { color: { themeColor: 'ACCENT1' } };
    }

    if (alpha !== 1.0) {
      solidFill.alpha = alpha;
    }

    const requests = [{
        updatePageProperties: {
            objectId: this.__page.getObjectId(),
            pageProperties: {
                pageBackgroundFill: {
                    propertyState: 'RENDERED',
                    solidFill: solidFill
                }
            },
            fields: 'pageBackgroundFill'
        }
    }];
    Slides.Presentations.batchUpdate({ requests }, presentationId);
    return this;
  }

  setTransparent() {
    const presentationId = this.__page.__presentation.getId();
    const requests = [{
        updatePageProperties: {
            objectId: this.__page.getObjectId(),
            pageProperties: {
                pageBackgroundFill: {
                    propertyState: 'NOT_RENDERED'
                }
            },
            fields: 'pageBackgroundFill'
        }
    }];
    Slides.Presentations.batchUpdate({ requests }, presentationId);
    return this;
  }

  toString() {
    return 'PageBackground';
  }
}
