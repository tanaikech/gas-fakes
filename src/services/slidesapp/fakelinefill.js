import { Proxies } from '../../support/proxies.js';

export const newFakeLineFill = (...args) => {
  return Proxies.guard(new FakeLineFill(...args));
};

export class FakeLineFill {
  constructor(line) {
    this.__line = line;
  }

  getFillType() {
    return this.__line.__line.lineFill?.solidFill ? 'SOLID' : 'NONE';
  }

  getSolidFill() {
    // This should return a SolidFill object
    // For now we might need a FakeSolidFill or just return something simple
    return null;
  }

  setSolidFill(color) {
    // Implementing this requires updateLineProperties with solidFill
    const presentationId = this.__line.__page.__presentation?.getId() || this.__line.__page.__slide?.__presentation.getId();

    let solidFill = {};
    if (typeof color === 'string') {
      solidFill = { color: { rgbColor: this.__hexToRgb(color) } };
    }
    // Handle other color types if needed

    Slides.Presentations.batchUpdate([{
      updateLineProperties: {
        objectId: this.__line.getObjectId(),
        lineProperties: {
          lineFill: {
            solidFill: solidFill
          }
        },
        fields: 'lineFill.solidFill'
      }
    }], presentationId);
    return this;
  }

  __hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      red: parseInt(result[1], 16) / 255.0,
      green: parseInt(result[2], 16) / 255.0,
      blue: parseInt(result[3], 16) / 255.0
    } : null;
  }

  toString() {
    return 'LineFill';
  }
}
