import { Proxies } from '../../support/proxies.js';
import { newFakeList } from './fakelist.js';

/**
 * create a new FakeListStyle instance
 * @param  {...any} args 
 * @returns {FakeListStyle}
 */
export const newFakeListStyle = (...args) => {
  return Proxies.guard(new FakeListStyle(...args));
};

export class FakeListStyle {
  constructor(textRange) {
    this.__textRange = textRange;
  }

  get __bullet() {
      // Find first paragraph marker with bullet in range
      const resource = this.__textRange.__resource;
      const elements = resource?.textElements || [];
      const start = this.__textRange.getStartIndex();

      let currentIndex = 0;
      for (const element of elements) {
        const length = element.textRun?.content?.length || (element.autoText ? 1 : 0);
        if (currentIndex >= start && element.paragraphMarker && element.paragraphMarker.bullet) {
          return element.paragraphMarker.bullet;
        }
        currentIndex += length;
      }
      return null;
  }

  applyListPreset(preset) {
    const presentationId = this.__textRange.__shape.__presentation.getId();
    const objectId = this.__textRange.__shape.getObjectId();
    const cellLocation = this.__textRange.__shape.__cellLocation;

    Slides.Presentations.batchUpdate({ requests: [{
        createParagraphBullets: {
            objectId,
            cellLocation,
            bulletPreset: preset.toString(),
            textRange: {
                type: 'FIXED_RANGE',
                startIndex: this.__textRange.getStartIndex(),
                endIndex: this.__textRange.getEndIndex()
            }
        }
    }] }, presentationId);
    return this;
  }

  getGlyph() {
    // API doesn't return the rendered glyph string directly easily.
    return this.__bullet ? '•' : null;
  }

  getList() {
    const bullet = this.__bullet;
    if (!bullet) return null;
    return newFakeList(bullet.listId, this.__textRange.__shape.__presentation, this.__textRange.__shape);
  }

  getNestingLevel() {
    return this.__bullet?.nestingLevel || 0;
  }

  isInList() {
    return !!this.__bullet;
  }

  removeFromList() {
    const presentationId = this.__textRange.__shape.__presentation.getId();
    const objectId = this.__textRange.__shape.getObjectId();
    const cellLocation = this.__textRange.__shape.__cellLocation;

    Slides.Presentations.batchUpdate({ requests: [{
        deleteAllText: {
            objectId,
            cellLocation,
            // Wait, deleteAllText is for all text.
            // To remove bullets, we use deleteParagraphBullets.
        }
    }] }, presentationId);
    // Correct request is deleteParagraphBullets
    Slides.Presentations.batchUpdate({ requests: [{
        deleteParagraphBullets: {
            objectId,
            cellLocation,
            textRange: {
                type: 'FIXED_RANGE',
                startIndex: this.__textRange.getStartIndex(),
                endIndex: this.__textRange.getEndIndex()
            }
        }
    }] }, presentationId);
    return this;
  }

  toString() {
    return 'ListStyle';
  }
}
