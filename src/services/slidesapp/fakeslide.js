import { Proxies } from '../../support/proxies.js';
import { newFakeNotesPage } from './fakenotespage.js';
import { newFakeLayout } from './fakelayout.js';
import { newFakeMaster } from './fakemaster.js';
import { newFakePageElement } from './fakepageelement.js';
import { newFakePageBackground } from './fakepagebackground.js';

export const newFakeSlide = (...args) => {
  return Proxies.guard(new FakeSlide(...args));
};

/**
 * @class FakeSlide
 * A fake for the Slide class in Apps Script.
 * @see https://developers.google.com/apps-script/reference/slides/slide
 */
export class FakeSlide {
  /**
   * @param {object} resource the slide resource from Slides API
   * @param {FakePresentation} presentation the parent presentation
   */
  constructor(resource, presentation) {
    this.__id = resource.objectId;
    this.__presentation = presentation;
  }

  get __resource() {
    const presentationResource = this.__presentation.__resource;
    const slide = (presentationResource.slides || []).find(s => s.objectId === this.__id);

    if (!slide) {
      throw new Error(`Slide with ID ${this.__id} not found`);
    }
    return slide;
  }

  /**
   * Gets the unique ID for the slide.
   * @returns {string} The slide ID.
   */
  getObjectId() {
    return this.__id;
  }

  /**
   * Gets the notes page of the slide.
   * @returns {FakeNotesPage} The notes page.
   */
  getNotesPage() {
    const notesPage = this.__resource.slideProperties?.notesPage;
    return notesPage ? newFakeNotesPage(this) : null;
  }

  /**
   * Gets the layout the slide is based on.
   * @returns {FakeLayout} The layout.
   */
  getLayout() {
    const layoutId = this.__resource.slideProperties?.layoutObjectId;
    if (!layoutId) return null;

    // We need to find the layout in the presentation
    const presentationId = this.__presentation.getId();
    const presentation = Slides.Presentations.get(presentationId);
    const layout = presentation.layouts.find(l => l.objectId === layoutId);
    return layout ? newFakeLayout(layout, this.__presentation) : null;
  }



  /**
   * Gets the list of page elements on the slide.
   * @returns {FakePageElement[]} The page elements.
   */
  getPageElements() {
    return (this.__resource.pageElements || []).map(pe => newFakePageElement(pe, this));
  }

  /**
   * Gets the background of the slide.
   * @returns {FakePageBackground} The background.
   */
  getBackground() {
    const background = this.__resource.pageBackgroundFill;
    return background ? newFakePageBackground(this) : null;
  }

  /**
   * Deletes the slide.
   */
  remove() {
    const presentationId = this.__presentation.getId();
    Slides.Presentations.batchUpdate([{
      deleteObject: {
        objectId: this.getObjectId()
      }
    }], presentationId);
  }

  /**
   * Inserts a shape.
   * @param {SlidesApp.ShapeType} shapeType The shape type.
   * @param {number} [left] The left position.
   * @param {number} [top] The top position.
   * @param {number} [width] The width.
   * @param {number} [height] The height.
   * @returns {FakeShape} The new shape.
   */
  insertShape(shapeType, left = 0, top = 0, width = 300, height = 300) {
    // Default size and position if not provided
    // shapeType should be string e.g. TEXT_BOX
    const presentationId = this.__presentation.getId();
    const result = Slides.Presentations.batchUpdate([{
      createShape: {
        shapeType: shapeType,
        elementProperties: {
          pageObjectId: this.getObjectId(),
          size: {
            width: { magnitude: width * 12700, unit: 'EMU' }, // 1 pt = 12700 EMU
            height: { magnitude: height * 12700, unit: 'EMU' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: left * 12700,
            translateY: top * 12700,
            unit: 'EMU'
          }
        }
      }
    }], presentationId);

    // The result contains the new object ID
    const newObjectId = result.replies[0].createShape.objectId;

    // We assume the shape is added to the slide and we can retrieve it
    // Wait, we need to return a FakeShape.
    // We can fetch the updated slide and find it.
    // Or just create a FakeShape with the partial resource if we trust it?
    // Better to fetch fresh.

    // We can use getPageElements() to find it by ID.
    // But getPageElements returns FakePageElements.
    // We want FakeShape. FakePageElement has asShape().

    // Need to import newFakeShape if we want to return it directly, OR use getPageElements().
    // Let's use getPageElements since we already import newFakePageElement?
    // No, fakeslide.js imports newFakePageElement.

    // We need to invalidate cache? FakePresentation.batchUpdate logic handles cache clearing.
    // So subsequent access should be fresh.

    const elements = this.getPageElements();
    const newElement = elements.find(e => e.getObjectId() === newObjectId);
    if (!newElement) throw new Error('New shape not found');
    return newElement.asShape();
  }

  /**
   * Inserts a line.
   * @param {SlidesApp.LineCategory} lineCategory The line category.
   * @param {number} [left]
   * @param {number} [top]
   * @param {number} [width]
   * @param {number} [height]
   * @returns {FakeLine} The new line.
   */
  insertLine(lineCategory, left = 0, top = 0, width = 100, height = 100) {
    const presentationId = this.__presentation.getId();
    const result = Slides.Presentations.batchUpdate([{
      createLine: {
        lineCategory: lineCategory,
        elementProperties: {
          pageObjectId: this.getObjectId(),
          size: {
            width: { magnitude: width * 12700, unit: 'EMU' },
            height: { magnitude: height * 12700, unit: 'EMU' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: left * 12700,
            translateY: top * 12700,
            unit: 'EMU'
          }
        }
      }
    }], presentationId);

    const newObjectId = result.replies[0].createLine.objectId;
    const elements = this.getPageElements();
    const newElement = elements.find(e => e.getObjectId() === newObjectId);
    if (!newElement) throw new Error('New line not found');
    return newElement.asLine();
  }

  duplicate() {
    const presentationId = this.__presentation.getId();
    const result = Slides.Presentations.batchUpdate([{
      duplicateObject: {
        objectId: this.getObjectId()
      }
    }], presentationId);

    // The result contains the new object ID
    const newObjectId = result.replies[0].duplicateObject.objectId;
    // We need to get the updated presentation to find the new slide resource
    const updatedPresentation = Slides.Presentations.get(presentationId);
    const newSlideResource = updatedPresentation.slides.find(s => s.objectId === newObjectId);
    return newFakeSlide(newSlideResource, this.__presentation);
  }

  /**
   * Moves the slide to a new position.
   * @param {number} index The new index.
   */
  move(index) {
    const presentationId = this.__presentation.getId();

    Slides.Presentations.batchUpdate([{
      updateSlidesPosition: {
        slideObjectIds: [this.getObjectId()],
        insertionIndex: index
      }
    }], presentationId);
  }

  toString() {
    return 'Slide';
  }
}
