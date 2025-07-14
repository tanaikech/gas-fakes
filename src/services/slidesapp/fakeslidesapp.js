import { Proxies } from '../../support/proxies.js';
import * as Enums from '../enums/slidesenums.js';
import { newFakePresentation } from './fakepresentation.js';
import { Auth } from '../../support/auth.js';
import { Url } from '../../support/url.js';

export const newFakeSlidesApp = (...args) => {
  return Proxies.guard(new FakeSlidesApp(...args));
};

class FakeSlidesApp {
  constructor() {
    const enumProps = [
      'AlignmentPosition',
      'ArrowStyle',
      'AudioSourceType',
      'AutoTextType',
      'AutofitType',
      'CellMergeState',
      'ColorType',
      'ContentAlignment',
      'DashStyle',
      'FillType',
      'LineCategory',
      'LineFillType',
      'LineType',
      'LinkType',
      'ListPreset',
      'PageBackgroundType',
      'PageElementType',
      'PageType',
      'ParagraphAlignment',
      'PlaceholderType',
      'PredefinedLayout',
      'RadialGradientCenter',
      'RectanglePosition',
      'SelectionType',
      'ShadowType',
      'ShapeType',
      'SheetsChartEmbedType',
      'SlideLinkingMode',
      'SlidePosition',
      'SpacingMode',
      'TextBaselineOffset',
      'TextDirection',
      'ThemeColorType',
      'VideoSourceType',
    ];

    // import all known enums as props of slidesapp
    enumProps.forEach((f) => {
      this[f] = Enums[f];
    });
  }

  /**
   * Creates a new presentation with the given name.
   * @param {string} name The name of the new presentation.
   * @returns {import('./fakepresentation.js').FakePresentation} The new presentation.
   */
  create(name) {
    // use the advanced service which handles synchronization
    const presentation = Slides.Presentations.create({
      title: name,
    });
    return newFakePresentation(presentation);
  }

  /**
   * Gets the currently active presentation.
   * @returns {import('./fakepresentation.js').FakePresentation | null} The active presentation, or null if there is none.
   */
  getActivePresentation() {
    const id = Auth.getDocumentId();
    if (!id) {
      // This is what Apps Script does
      return null;
    }
    return this.openById(id);
  }

  /**
   * Opens the presentation with the specified ID.
   * @param {string} id The ID of the presentation to open.
   * @returns {import('./fakepresentation.js').FakePresentation} The presentation.
   */
  openById(id) {
    // use the advanced service which handles synchronization
    const presentation = Slides.Presentations.get(id);
    return newFakePresentation(presentation);
  }

  /**
   * Opens the presentation with the specified URL.
   * @param {string} url The URL of the presentation to open.
   * @returns {import('./fakepresentation.js').FakePresentation} The presentation.
   */
  openByUrl(url) {
    const id = Url.getIdFromUrl(url);
    if (!id) {
      throw new Error(`Invalid presentation URL: ${url}`);
    }
    return this.openById(id);
  }

  toString() {
    return 'SlidesApp';
  }
}