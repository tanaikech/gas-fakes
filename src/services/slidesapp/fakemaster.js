import { Proxies } from '../../support/proxies.js';
import { newFakeColorScheme } from './fakecolorscheme.js';
import { newFakePageBackground } from './fakepagebackground.js';
import { newFakePageElement, PageElementRegistry } from './fakepageelement.js';
import { newFakeLayout } from './fakelayout.js';

export const newFakeMaster = (...args) => {
  return Proxies.guard(new FakeMaster(...args));
};

export class FakeMaster {
  constructor(resource, presentation) {
    this.__id = resource.objectId;
    this.__presentation = presentation;
  }

  get __resource() {
    const presentationResource = this.__presentation.__resource;
    const master = (presentationResource.masters || []).find(m => m.objectId === this.__id);
    if (!master) {
      throw new Error(`Master with ID ${this.__id} not found`);
    }
    return master;
  }

  getObjectId() {
    return this.__id;
  }

  /**
   * Gets the background of the master.
   * @returns {FakePageBackground} The background.
   */
  getBackground() {
    return newFakePageBackground(this);
  }

  /**
   * Gets the color scheme of the master.
   * @returns {FakeColorScheme} The color scheme.
   */
  getColorScheme() {
    return newFakeColorScheme(this);
  }

  /**
   * Gets the type of the page.
   * @returns {SlidesApp.PageType}
   */
  getPageType() {
    return SlidesApp.PageType.MASTER;
  }

  /**
   * Gets the list of page elements on the master.
   * @returns {FakePageElement[]} The page elements.
   */
  getPageElements() {
    return (this.__resource.pageElements || []).map(pe => newFakePageElement(pe, this));
  }

  /**
   * Gets a page element by ID.
   * @param {string} id The ID.
   * @returns {FakePageElement|null} The element.
   */
  getPageElementById(id) {
    return this.getPageElements().find(pe => pe.getObjectId() === id) || null;
  }

  getGroups() {
    return this.getPageElements()
      .filter(pe => pe.getPageElementType().toString() === 'GROUP')
      .map(pe => pe.asGroup());
  }

  getImages() {
    return this.getPageElements()
      .filter(pe => pe.getPageElementType().toString() === 'IMAGE')
      .map(pe => pe.asImage());
  }

  getLines() {
    return this.getPageElements()
      .filter(pe => pe.getPageElementType().toString() === 'LINE')
      .map(pe => pe.asLine());
  }

  getShapes() {
    return this.getPageElements()
      .filter(pe => pe.getPageElementType().toString() === 'SHAPE')
      .map(pe => pe.asShape());
  }

  getTables() {
    return this.getPageElements()
      .filter(pe => pe.getPageElementType().toString() === 'TABLE')
      .map(pe => pe.asTable());
  }

  getVideos() {
    return this.getPageElements()
      .filter(pe => pe.getPageElementType().toString() === 'VIDEO')
      .map(pe => pe.asVideo());
  }

  getWordArts() {
    return this.getPageElements()
      .filter(pe => pe.getPageElementType().toString() === 'WORD_ART')
      .map(pe => pe.asWordArt());
  }

  getSheetsCharts() {
    return this.getPageElements()
      .filter(pe => pe.getPageElementType().toString() === 'SHEETS_CHART')
      .map(pe => pe.asSheetsChart());
  }

  /**
   * Inserts a Google Sheets chart on the master.
   * @param {EmbeddedChart} chart The chart.
   * @returns {SheetsChart} The inserted chart.
   */
  insertSheetsChart(chart) {
    const presentationId = this.__presentation.getId();
    const objectId = `chart_${Math.random().toString(36).substring(2, 11)}`;
    const spreadsheetId = chart.getSpreadsheetId ? chart.getSpreadsheetId() : '';
    const chartId = chart.getChartId ? chart.getChartId() : 0;

    const requests = [{
      createSheetsChart: {
        objectId,
        spreadsheetId,
        chartId,
        linkingMode: 'LINKED',
        elementProperties: {
          pageObjectId: this.getObjectId(),
          size: {
            width: { magnitude: 400, unit: 'PT' },
            height: { magnitude: 300, unit: 'PT' }
          }
        }
      }
    }];

    Slides.Presentations.batchUpdate({ requests }, presentationId);
    return this.getPageElementById(objectId).asSheetsChart();
  }

  /**
   * Inserts a Google Sheets chart as an image on the master.
   * @param {EmbeddedChart} chart The chart.
   * @returns {Image} The inserted image.
   */
  insertSheetsChartAsImage(chart) {
      const presentationId = this.__presentation.getId();
      const objectId = `chart_img_${Math.random().toString(36).substring(2, 11)}`;
      const requests = [{
        createImage: {
          objectId,
          url: 'https://via.placeholder.com/400x300?text=Sheets+Chart',
          elementProperties: {
            pageObjectId: this.getObjectId()
          }
        }
      }];
      Slides.Presentations.batchUpdate({ requests }, presentationId);
      return this.getPageElementById(objectId).asImage();
  }

  /**
   * Gets the layouts associated with this master.
   * @returns {FakeLayout[]} The layouts.
   */
  getLayouts() {
    const layouts = this.__presentation.__resource.layouts || [];
    return layouts
      .filter(l => l.layoutProperties?.masterObjectId === this.__id)
      .map(l => newFakeLayout(l, this.__presentation));
  }

  getPlaceholders() {
    return this.getPageElements().filter(pe => pe.__resource.shape?.placeholder || pe.__resource.image?.placeholder);
  }

  getPlaceholder(placeholderType, index = 0) {
    const typeStr = placeholderType.toString();
    return this.getPlaceholders().find(p => {
      const ph = p.__resource.shape?.placeholder || p.__resource.image?.placeholder;
      return ph.type === typeStr && (ph.index === index || (index === 0 && ph.index === undefined));
    }) || null;
  }

  insertShape(shapeType, left = 0, top = 0, width = 300, height = 300) {
    const presentationId = this.__presentation.getId();
    const objectId = `shape_${Math.random().toString(36).substring(2, 11)}`;
    const requests = [{
      createShape: {
        objectId,
        shapeType: shapeType.toString(),
        elementProperties: {
          pageObjectId: this.getObjectId(),
          size: {
            width: { magnitude: width, unit: 'PT' },
            height: { magnitude: height, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: left,
            translateY: top,
            unit: 'PT'
          }
        }
      }
    }];

    Slides.Presentations.batchUpdate({ requests }, presentationId);
    return this.getPageElementById(objectId).asShape();
  }

  insertTextBox(text, left = 0, top = 0, width = 300, height = 50) {
    const shape = this.insertShape(SlidesApp.ShapeType.TEXT_BOX, left, top, width, height);
    if (text) shape.getText().setText(text);
    return shape;
  }

  insertTable(rows, columns, left = 0, top = 0, width = 300, height = 300) {
    const presentationId = this.__presentation.getId();
    const objectId = `table_${Math.random().toString(36).substring(2, 11)}`;
    const requests = [{
      createTable: {
        objectId,
        rows,
        columns,
        elementProperties: {
          pageObjectId: this.getObjectId(),
          size: {
            width: { magnitude: width, unit: 'PT' },
            height: { magnitude: height, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: left,
            translateY: top,
            unit: 'PT'
          }
        }
      }
    }];

    Slides.Presentations.batchUpdate({ requests }, presentationId);
    return this.getPageElementById(objectId).asTable();
  }

  /**
   * Inserts a video at the top left corner of the master.
   * @param {string} videoUrl The video URL.
   * @param {number} [left]
   * @param {number} [top]
   * @param {number} [width]
   * @param {number} [height]
   * @returns {FakeVideo} The inserted video.
   */
  insertVideo(videoUrl, left = 0, top = 0, width = 300, height = 200) {
    const presentationId = this.__presentation.getId();
    const objectId = `video_${Math.random().toString(36).substring(2, 11)}`;
    
    let videoId = videoUrl;
    if (videoUrl.includes('v=')) {
      videoId = videoUrl.split('v=')[1].split('&')[0];
    } else if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
    }

    const requests = [{
      createVideo: {
        objectId,
        source: 'YOUTUBE',
        id: videoId,
        elementProperties: {
          pageObjectId: this.getObjectId(),
          size: {
            width: { magnitude: width, unit: 'PT' },
            height: { magnitude: height, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: left,
            translateY: top,
            unit: 'PT'
          }
        }
      }
    }];

    Slides.Presentations.batchUpdate({ requests }, presentationId);
    return this.getPageElementById(objectId).asVideo();
  }

  insertImage(urlOrBlob, left = 0, top = 0, width = 300, height = 300) {
    const presentationId = this.__presentation.getId();
    const objectId = `image_${Math.random().toString(36).substring(2, 11)}`;
    let url = typeof urlOrBlob === 'string' ? urlOrBlob : '';

    const requests = [{
      createImage: {
        objectId,
        url: url || 'https://via.placeholder.com/150',
        elementProperties: {
          pageObjectId: this.getObjectId(),
          size: {
            width: { magnitude: width, unit: 'PT' },
            height: { magnitude: height, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: left,
            translateY: top,
            unit: 'PT'
          }
        }
      }
    }];

    Slides.Presentations.batchUpdate({ requests }, presentationId);
    return this.getPageElementById(objectId).asImage();
  }

  insertLine(lineCategory, startX, startY, endX, endY) {
    const presentationId = this.__presentation.getId();
    const objectId = `line_${Math.random().toString(36).substring(2, 11)}`;
    const requests = [{
      createLine: {
        objectId,
        lineCategory: lineCategory.toString(),
        elementProperties: {
          pageObjectId: this.getObjectId(),
          size: {
            width: { magnitude: Math.abs(endX - startX), unit: 'PT' },
            height: { magnitude: Math.abs(endY - startY), unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: Math.min(startX, endX),
            translateY: Math.min(startY, endY),
            unit: 'PT'
          }
        }
      }
    }];

    Slides.Presentations.batchUpdate({ requests }, presentationId);
    return this.getPageElementById(objectId).asLine();
  }

  remove() {
    const presentationId = this.__presentation.getId();
    Slides.Presentations.batchUpdate({ requests: [{
      deleteObject: {
        objectId: this.getObjectId()
      }
    }] }, presentationId);
  }

  replaceAllText(findText, replaceText, matchCase = false) {
    const presentationId = this.__presentation.getId();
    Slides.Presentations.batchUpdate({ requests: [{
      replaceAllText: {
        replaceText,
        containsText: {
          text: findText,
          matchCase
        },
        pageObjectIds: [this.getObjectId()]
      }
    }] }, presentationId);
    return this;
  }

  selectAsCurrentPage() {
    return this;
  }

  asLayout() { throw new Error('Cannot cast Master to Layout'); }
  asSlide() { throw new Error('Cannot cast Master to Slide'); }
  asMaster() { return this; }

  toString() {
    return 'Master';
  }
}
