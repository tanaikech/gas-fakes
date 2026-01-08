import { Proxies } from '../../support/proxies.js';
import { AutofitType } from '../enums/slidesenums.js';

export const newFakeAutofit = (...args) => {
  return Proxies.guard(new FakeAutofit(...args));
};

export class FakeAutofit {
  constructor(shape) {
    this.__shape = shape;
    // Store autofit type on the shape resource or locally?
    // Ideally on the resource so it persists if we reload the shape.
    // But for now, let's look at the shape's property if meaningful or just a local property default.
    // The resource might have 'text.autoFit'.
  }

  get __resource() {
    // Ensure shape.text exists
    if (!this.__shape.__resource.shape.text) {
      this.__shape.__resource.shape.text = {};
    }
    return this.__shape.__resource.shape.text;
  }

  getAutofitType() {
    const type = (this.__resource.autoFit && this.__resource.autoFit.autofitType) || 'NONE';
    return AutofitType[type] || AutofitType.NONE;
  }

  disableAutofit() {
    if (!this.__resource.autoFit) {
      this.__resource.autoFit = {};
    }
    this.__resource.autoFit.autofitType = AutofitType.NONE.toString();
    return this;
  }

  getFontScale() {
    return (this.__resource.autoFit && this.__resource.autoFit.fontScale) !== undefined ? this.__resource.autoFit.fontScale : 1;
  }

  getLineSpacingReduction() {
    return (this.__resource.autoFit && this.__resource.autoFit.lineSpacingReduction) !== undefined ? this.__resource.autoFit.lineSpacingReduction : 0;
  }

  toString() {
    return 'Autofit';
  }
}
