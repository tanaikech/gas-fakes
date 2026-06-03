import { Proxies } from '../../support/proxies.js';
import { newFakeLineFill } from './fakelinefill.js';

/**
 * Represents the Border properties of a Slides element.
 * Emulates the Slides API resource structure.
 */
export const newFakeBorder = (...args) => {
  return Proxies.guard(new FakeBorder(...args));
};

export class FakeBorder {
  /**
   * @param {FakePageElement} parent - The element this border belongs to.
   */
  constructor(parent) {
    this._parent = parent;
  }

  get __resource() {
    // Border properties are typically in imageProperties.outline or shapeProperties.outline
    const res = this._parent.__resource;
    return res.image?.imageProperties?.outline || res.shape?.shapeProperties?.outline;
  }

  getLineFill() {
    return newFakeLineFill(this._parent);
  }

  isVisible() {
    const weight = this.getWeight();
    return weight !== null && weight > 0;
  }

  setDashStyle(style) {
    this.__update({ dashStyle: style.toString() }, 'dashStyle');
    return this;
  }

  setTransparent() {
    this.__update({ propertyState: 'NOT_RENDERED' }, 'propertyState');
    return this;
  }

  setWeight(weight) {
    this.__update({ weight: { magnitude: weight, unit: 'PT' }, propertyState: 'RENDERED' }, 'weight,propertyState');
    return this;
  }

  __update(props, fields) {
    const presentationId = this._parent.__presentation?.getId() || this._parent.__page?.__presentation?.getId();
    const type = this._parent.getPageElementType().toString();
    const objectId = this._parent.getObjectId();

    let request = null;
    if (type === 'SHAPE') {
      request = {
        updateShapeProperties: {
          objectId,
          shapeProperties: { outline: props },
          fields: fields ? fields.split(',').map(f => `outline.${f}`).join(',') : 'outline'
        }
      };
    } else if (type === 'IMAGE') {
        request = {
            updateImageProperties: {
              objectId,
              imageProperties: { outline: props },
              fields: fields ? fields.split(',').map(f => `outline.${f}`).join(',') : 'outline'
            }
          };
    }

    if (request) {
      Slides.Presentations.batchUpdate({ requests: [request] }, presentationId);
    }
  }

  /**
   * Retrieves the weight of the border in Points (PT).
   * @returns {number | null} The border weight in PT, or null if not defined/rendered.
   */
  getWeight() {
    const outline = this.__resource;
    if (!outline || outline.propertyState === 'NOT_RENDERED' || outline.weight === undefined) {
      return null;
    }
    return this._parent.__normalize(outline.weight);
  }

  /**
   * Gets the DashStyle of the border.
   * @returns {string} The dash style.
   */
  getDashStyle() {
    const outline = this.__resource;
    if (!outline || outline.propertyState === 'NOT_RENDERED' || !outline.dashStyle) {
      return 'SOLID';
    }
    return outline.dashStyle;
  }

  toString() {
    return 'Border';
  }
}
