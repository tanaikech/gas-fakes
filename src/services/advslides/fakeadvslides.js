import { FakeAdvResource } from '../common/fakeadvresource.js';
import { Syncit } from '../../support/syncit.js';
import { gError } from '../../support/helpers.js';
import { slidesCacher } from '../../support/slidescacher.js';
import { Proxies } from '../../support/proxies.js';

/**
 * @class FakeAdvSlidesPresentationsPages
 */
class FakeAdvSlidesPresentationsPages extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, 'presentations', Syncit.fxSlides);
  }


  //https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/getThumbnail
  getThumbnail(presentationId, pageObjectId, options) {
    ScriptApp.__behavior.isAccessible(presentationId, 'Slides', 'read');
    const { response, data } = this._call('getThumbnail', { presentationId, pageObjectId, ...options }, {}, 'pages');
    gError(response, 'slides.presentations.pages', 'getThumbnail');
    return data;
  }
}

/**
 * @class FakeAdvSlidesPresentations
 */
class FakeAdvSlidesPresentations extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, 'presentations', Syncit.fxSlides);
    this.slides = mainService;
    this.Pages = Proxies.guard(new FakeAdvSlidesPresentationsPages(mainService));
  }

  // Override 'get' to use the caching-enabled function fxSlidesGet.
  get(presentationId, options) {
    ScriptApp.__behavior.isAccessible(presentationId, 'Slides', 'read');
    const { response, data } = this._call('get', { presentationId, ...options }, {}, null, Syncit.fxSlidesGet);
    gError(response, 'slides.presentations', 'get');
    return data;    
  }

  // Signature matches Apps Script advanced service.
  create(presentation) {
    // The underlying API wants the resource in a 'requestBody' property for Node.js.
    const result = this._call('create', { requestBody: presentation });
    if (result.data) {
      this.slides.__addAllowed(result.data.presentationId);
    }
    return result.data;
  }

  // Signature matches Apps Script advanced service.
  // Robustly handle both resource object and raw requests array.
  batchUpdate(resource, presentationId) {
    // for slides, any batch update is a write
    ScriptApp.__behavior.isAccessible(presentationId, 'Slides', 'write');
    
    const requestBody = Array.isArray(resource) 
      ? { requests: resource } 
      : resource;

    const result = this._call('batchUpdate', {
      presentationId,
      requestBody,
    });
    gError(result.response, 'slides.presentations', 'batchUpdate');

    // Any update should invalidate the cache for that presentation.
    if (presentationId) {
      slidesCacher.clear(presentationId);
    }

    return result.data;
  }
}

/**
 * @class FakeAdvSlides
 * @description The Slides Advanced Service
 */
class FakeAdvSlides {
  constructor() {
    this.Presentations = Proxies.guard(new FakeAdvSlidesPresentations(this));
  }

  __addAllowed(id) {
    if (ScriptApp.__behavior.sandBoxMode) {
      ScriptApp.__behavior.addFile(id);
    }
    return id
  }
  __getSlidesPerformance() {
    return slidesCacher.getPerformance();
  }
  toString() {
    return 'AdvancedServiceIdentifier{name=slides, version=v1}';
  }
  getVersion() {
    return 'v1';
  }

}
/**
 * Creates a new fake Slides advanced service instance.
 * @returns {FakeAdvSlides}
 */
export const newFakeAdvSlides = () => Proxies.guard(new FakeAdvSlides());