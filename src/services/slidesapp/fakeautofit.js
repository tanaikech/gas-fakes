import { Proxies } from '../../support/proxies.js';
import { AutofitType } from '../enums/slidesenums.js';

export const newFakeAutofit = (...args) => {
  return Proxies.guard(new FakeAutofit(...args));
};

export class FakeAutofit {
  constructor(shape) {
    this.__shape = shape;
  }

  get __resource() {
    const shapeResource = this.__shape.__resource;
    if (shapeResource && shapeResource.shape && shapeResource.shape.shapeProperties && shapeResource.shape.shapeProperties.autofit) {
      return shapeResource.shape.shapeProperties.autofit;
    }
    return {};
  }

  getAutofitType() {
    const type = this.__resource.autofitType || 'NONE';
    return AutofitType[type] || AutofitType.NONE;
  }

  disableAutofit() {
    const objectId = this.__shape.getObjectId();
    const presentationId = this.__shape.__presentation.getId();

    const requests = [{
      updateShapeProperties: {
        objectId: objectId,
        shapeProperties: {
          autofit: {
            autofitType: 'NONE'
          }
        },
        fields: 'autofit.autofitType'
      }
    }];

    Slides.Presentations.batchUpdate({ requests }, presentationId);
    return this;
  }

  getFontScale() {
    return this.__resource.fontScale !== undefined ? this.__resource.fontScale : 1;
  }

  getLineSpacingReduction() {
    return this.__resource.lineSpacingReduction !== undefined ? this.__resource.lineSpacingReduction : 0;
  }

  toString() {
    return 'Autofit';
  }
}
